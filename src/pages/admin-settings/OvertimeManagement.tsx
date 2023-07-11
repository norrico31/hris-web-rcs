import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Select, Skeleton, Row, TimePicker, Descriptions, Typography, Popconfirm } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import useMessage from 'antd/es/message/useMessage'
import { AiOutlineEdit, AiOutlineEye } from 'react-icons/ai'
import { BsFillTrashFill } from 'react-icons/bs'
import dayjs from 'dayjs'
import { useAuthContext } from '../../shared/contexts/Auth'
import { Form, TabHeader, Table, Divider } from '../../components'
import { renderTitle } from '../../shared/utils/utilities'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ADMINSETTINGSPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IOvertime, IUser, OvertimeRes, TableParams } from '../../shared/interfaces'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ OVERTIME, ADMINSETTINGS: { USERS } }] = useEndpoints()

dayjs.extend(localizedFormat);
const { Title } = Typography

export default function OvertimeManagement() {
    renderTitle('Overtime Management')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [overtimeType, setOvertimeType] = useState('all')
    const [data, setData] = useState<IOvertime[]>([])
    const [selectedData, setSelectedData] = useState<IOvertime | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [isModalCancel, setIsModalCancel] = useState(false)

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])

    useEffect(function fetch() {
        if (!loadingUser && !codes['q01']) return
        const controller = new AbortController();
        if (user !== undefined) fetchData({
            signal: controller.signal, search,
            page: tableParams?.pagination?.current,
            pageSize: tableParams?.pagination?.pageSize,
        })
        return () => {
            controller.abort()
        }
    }, [user, search, loadingUser])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['q01']) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<IOvertime> = [
        {
            title: 'User',
            key: 'user',
            dataIndex: 'user',
            width: 200,
            render: (_, record) => record?.user.full_name
        },
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 200,
            // render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Time Start',
            key: 'planned_ot_start',
            dataIndex: 'planned_ot_start',
            width: 150
        },
        {
            title: 'Date End',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 200,
            // render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        {
            title: 'Time End',
            key: 'planned_ot_end',
            dataIndex: 'planned_ot_end',
            width: 150
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IOvertime) => <Space>
                <Button id='edit' type='default' size='middle' onClick={() => handleEdit(record)} className='btn-edit' >
                    <AiOutlineEdit color='white' />
                </Button>
                {record.status !== 'PENDING' ? (
                    <Popconfirm
                        title='Delete the selected data?'
                        description={`Are you sure you want to delete ${record.reason}?`}
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button id='delete' type='primary' size='middle' onClick={() => null}>
                            <BsFillTrashFill />
                        </Button>
                    </Popconfirm>
                ) : (
                    <Button className='btn-secondary' onClick={() => handleSelectedOvertime(record)}>
                        <AiOutlineEye />
                    </Button>

                )}
            </Space >,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<OvertimeRes>('/overtimes/list-am', args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                        pageSize: res?.per_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    function handleDelete(id: string) {
        DELETE(OVERTIME.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IOvertime) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleSelectedOvertime(data: IOvertime) {
        setIsModalCancel(true)
        setSelectedData(data)
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function closeModal() {
        setIsModalOpen(false)
        setSelectedData(undefined)
        setIsModalCancel(false)
    }

    return (
        <>
            <Title level={2}>Overtime Management</Title>
            <TabHeader handleSearch={setSearch} isRequest>
                <Button className='btn-secondary' onClick={() => setIsModalOpen(true)}>File Employee Overtime</Button>
                {/* <Select value={overtimeType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
                    setOvertimeType((str == undefined || str == '') ? 'all' : str)
                    fetchData({
                        args: {
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize
                        },
                        type: (str == undefined || str == '') ? 'all' : str
                    })
                }} style={{ width: 150 }}>
                    {selectOptions.map((opt) => (
                        <Select.Option value={opt.toLocaleLowerCase()} key={opt}>{opt}</Select.Option>
                    ))}
                </Select> */}
            </TabHeader>
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <OvertimeModal
                selectedData={selectedData}
                overtimeType={overtimeType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                handleCancel={closeModal}
            />
            <ModalCancelRequest
                isModalOpen={isModalCancel}
                selectedRequest={selectedData!}
                handleCancel={closeModal}
                overtimeType={overtimeType}
                fetchData={fetchData}
            />
        </>
    )
}

// const selectOptions = ['All', 'Pending', 'Approved']

type ModalProps = {
    overtimeType: string
    fetchData(args?: IArguments): void
    selectedData?: IOvertime
    isModalOpen: boolean
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

export function OvertimeModal({ overtimeType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const [users, setUsers] = useState<IUser[]>([])
    const key = 'error'

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                date_start: selectedData?.date_start != null ? dayjs(selectedData?.date_start, 'YYYY-MM-DD') : null,
                date_end: selectedData?.date_end != null ? dayjs(selectedData?.date_end, 'YYYY-MM-DD') : null,
                planned_ot_start: selectedData?.planned_ot_start != null ? dayjs(selectedData?.planned_ot_start, 'h:mm A') : null,
                planned_ot_end: selectedData?.planned_ot_end != null ? dayjs(selectedData?.planned_ot_end, 'h:mm A') : null,
            })
        } else form.resetFields()
        const controller = new AbortController();
        axiosClient.get(USERS.LISTS, { signal: controller.signal })
            .then((res) => {
                setUsers(res.data)
            })

    }, [selectedData])

    async function onFinish({ date_start, date_end, planned_ot_start, planned_ot_end, ...restProps }: Record<string, any>) {
        date_start = dayjs(date_start).format('YYYY-MM-DD')
        date_end = dayjs(date_end).format('YYYY-MM-DD')
        planned_ot_start = dayjs(planned_ot_start).format('LT')
        planned_ot_end = dayjs(planned_ot_end).format('LT')
        restProps = { ...restProps } as any
        setLoading(true)
        try {
            let result = selectedData ? PUT(OVERTIME.HRMANAGEMENTPUT + selectedData.id, { ...restProps, date_start, date_end, id: selectedData.id, planned_ot_start, planned_ot_end, manager: 1 }) : POST(OVERTIME.HRMANAGEMENTPOST, { ...restProps, date_start, date_end, planned_ot_start, planned_ot_end, manager: 1 })
            const res = await result
            form.resetFields()
            handleCancel()
        } catch (err: any) {
            messageApi.open({
                key,
                type: 'error',
                content: err?.response?.data?.message,
                duration: 5
            })
            setLoading(false)
        } finally {
            fetchData()
            setLoading(false)
        }
    }

    return <Modal title='Update - Overtime' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Employee"
                name="user_id"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Select placeholder='Select employee...' optionFilterProp="children" allowClear showSearch>
                    {users.map((user) => (
                        <Select.Option value={user.id} key={user.id} style={{ color: '#777777' }}>{user?.full_name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <Row justify='space-around'>
                <FormItem
                    label="Start Date"
                    name="date_start"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
                <FormItem
                    label="End Date"
                    name="date_end"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
            </Row>
            <Row justify='space-around'>
                <FormItem
                    label="Start Time"
                    name="planned_ot_start"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >

                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format="h:mm A" />
                </FormItem>
                <FormItem
                    label="End Time"
                    name="planned_ot_end"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format="h:mm A" />
                </FormItem>
            </Row>
            <FormItem
                label="Reason"
                name="reason"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input.TextArea placeholder='Enter reason...' />
            </FormItem>
            <Row justify='end'>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData ? 'Update' : 'Submit'} Request
                    </Button>
                </Space>
            </Row>
        </Form>
    </Modal>
}

type ModalCancelRequestProps = {
    isModalOpen: boolean
    handleCancel: () => void
    selectedRequest: IOvertime
    overtimeType: string
    fetchData(args?: IArguments): void
    restoreOvertime?: (id: string) => Promise<boolean>
}

function ModalCancelRequest({ isModalOpen, selectedRequest, fetchData, overtimeType, handleCancel, restoreOvertime }: ModalCancelRequestProps) {
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const [remarks, setRemarks] = useState('')

    useEffect(() => {
        if (selectedRequest?.cancellation_remarks) {
            setRemarks(selectedRequest?.cancellation_remarks)
        }
    }, [selectedRequest])

    const key = 'error'
    function cancelRequest() {
        if (remarks == null || remarks == '') {
            messageApi.open({
                key,
                type: 'error',
                content: `Please enter remarks to cancel the request`,
                duration: 5
            })
            return
        }
        setLoading(true)
        PUT(OVERTIME.CANCEL + selectedRequest?.id, { cancellation_remarks: remarks })
            .then((res) => {
                setRemarks('')
                handleCancel()
            })
            .catch((err) => {
                messageApi.open({
                    key,
                    type: 'error',
                    content: err?.response?.data?.message,
                    duration: 5
                })
                setLoading(false)
            })
            .finally(() => {
                fetchData()
                setLoading(false)
            })
    }

    async function approveReject(status: 'approve/' | 'reject/') {
        try {
            if (remarks == null || remarks == '') {
                messageApi.open({
                    key,
                    type: 'error',
                    content: `Please enter remarks before ${status}`,
                    duration: 5
                })
                return
            }
            setLoading(true)
            const url = status === 'approve/' ? 'approve-overtime/' : 'reject-overtime/'
            const payload = {
                remarks,
                date: selectedRequest?.date,
                planned_ot_start: selectedRequest?.planned_ot_start,
                planned_ot_end: selectedRequest?.planned_ot_end,
                reason: selectedRequest?.reason
            }
            const res = await PUT(OVERTIME.POST + url + selectedRequest?.id, payload)
            setRemarks('')
            handleCancel()
        } catch (err: any) {
            messageApi.open({
                type: 'error',
                content: err?.response?.data?.message,
                duration: 5
            })
            return err
        } finally {
            fetchData()
            setLoading(false)
        }
    }

    return <Modal title={selectedRequest?.status === 'APPROVED' || selectedRequest?.status === 'REJECTED' ? `Overtime - ${selectedRequest?.status} Request` : 'Overtime - Cancel Request'} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <OvertimeDescription
            selectedRequest={selectedRequest!}
            remarks={remarks}
            setRemarks={setRemarks}
        />
        <div style={{ textAlign: 'right' }}>
            <Space>
                {selectedRequest?.status === 'PENDING' ? (
                    <Space>
                        <Button className='btn-approve' onClick={() => approveReject('approve/')} disabled={loading} loading={loading}>Approve</Button>
                        <Button type="primary" loading={loading} disabled={loading} onClick={() => selectedRequest?.status === 'PENDING' ? approveReject('reject/') : cancelRequest()}>
                            Reject
                        </Button>
                    </Space>
                ) : (
                    <Button type='primary' onClick={cancelRequest} loading={loading} disabled={loading}>Cancel Leave</Button>
                )}
            </Space>
        </div>
    </Modal>
}

type OvertimeDescriptionProps = {
    selectedRequest: IOvertime;
    remarks: string;
    setRemarks: React.Dispatch<React.SetStateAction<string>>
}

export function OvertimeDescription({ selectedRequest, remarks, setRemarks }: OvertimeDescriptionProps) {
    console.log(selectedRequest)
    return <>
        <Descriptions bordered column={2}>
            <Descriptions.Item label="Requested By" span={2}>{selectedRequest?.user?.full_name}</Descriptions.Item>
            <Descriptions.Item label="Requested Date" span={2}>{new Date(selectedRequest?.created_at!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>{selectedRequest?.status}</Descriptions.Item>
            <Descriptions.Item label="Date Start Overtime" span={2}>{new Date(selectedRequest?.date_start + '').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
            <Descriptions.Item label="Date End Overtime" span={2}>{new Date(selectedRequest?.date_end + '').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
            <Descriptions.Item label="Planned OT Start" span={2}>{selectedRequest?.planned_ot_start?.toString()}</Descriptions.Item>
            <Descriptions.Item label="Planned OT End" span={2}>{selectedRequest?.planned_ot_end?.toString()}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered layout='vertical'>
            <Descriptions.Item label="Reason" style={{ textAlign: 'center' }}>{selectedRequest?.reason}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered>
            <Descriptions.Item label={selectedRequest?.cancellation_remarks ? 'Cancellation Remarks' : "Remarks"} >
                {selectedRequest?.remarks ? (selectedRequest?.remarks) : selectedRequest?.cancellation_remarks ? selectedRequest?.cancellation_remarks : (
                    <Input.TextArea placeholder='Remarks...' value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ height: 150 }} disabled={selectedRequest?.status !== 'PENDING'} />
                )}
            </Descriptions.Item>
        </Descriptions>
        <Divider />
    </>
}