import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Select, Skeleton, Row, TimePicker, Descriptions } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import useMessage from 'antd/es/message/useMessage'
import { Form, TabHeader, Table, Divider } from '../../components'
import { renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IOvertime, OvertimeRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { AiOutlineEdit } from 'react-icons/ai'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ OVERTIME }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function MyOvertime() {
    renderTitle('Overtime')
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
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    useEffect(function fetch() {
        if (!loadingUser && !codes['f01']) return
        const controller = new AbortController();
        if (user != undefined) fetchData({
            args: {
                signal: controller.signal, search,
                page: tableParams?.pagination?.current,
                pageSize: tableParams?.pagination?.pageSize,
            },
            type: overtimeType
        })
        return () => {
            controller.abort()
        }
    }, [user, search, loadingUser])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['f01', 'f02', 'f03', 'f04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<IOvertime> = [
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 200,
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
            render: (_, record: IOvertime) => <Space direction='vertical'>
                {(record?.status.toLowerCase() === 'approved' || record?.status.toLowerCase() === 'rejected' || record?.status.toLowerCase() === 'canceled') ? (
                    <Button className='btn-secondary' onClick={() => handleRequestSelected(record)}>
                        View
                    </Button>
                ) : (
                    <Space>
                        <Button id='edit' type='default' size='middle' onClick={() => handleEdit(record)} className='btn-edit' >
                            <AiOutlineEdit color='white' />
                        </Button>
                        {record?.status.toLowerCase() === 'pending' && (
                            <Button type='primary' onClick={() => handleRequestSelected(record)}>
                                {record?.status.toLowerCase() === 'canceled' ? 'View' : 'Cancel Request'}
                            </Button>
                        )}
                    </Space>
                )}
            </Space>,
            width: 150
        },
    ]

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = OVERTIME.GET + 'false' + status
        GET<OvertimeRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            .finally(() => fetchData({ type: overtimeType }))
    }

    function handleEdit(data: IOvertime) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: overtimeType })

    function handleRequestSelected(overtime: IOvertime) {
        setSelectedData(overtime)
        setIsModalCancel(true)
    }

    function closeModal() {
        setIsModalOpen(false)
        setSelectedData(undefined)
        setIsModalCancel(false)
    }

    return (
        <>
            <TabHeader handleSearch={setSearch} handleCreate={() => setIsModalOpen(true)} isRequest>
                <Select value={overtimeType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
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
                </Select>
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

const selectOptions = ['All', 'Pending', 'Approved']

type ModalProps = {
    overtimeType: string
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
    selectedData?: IOvertime
    isModalOpen: boolean
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

export function OvertimeModal({ overtimeType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()
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
    }, [selectedData])

    async function onFinish({ date_start, date_end, planned_ot_start, planned_ot_end, ...restProps }: Record<string, any>) {
        date_start = dayjs(date_start).format('YYYY-MM-DD')
        date_end = dayjs(date_end).format('YYYY-MM-DD')
        planned_ot_start = dayjs(planned_ot_start).format('LT')
        planned_ot_end = dayjs(planned_ot_end).format('LT')
        restProps = { ...restProps } as any
        setLoading(true)
        try {
            let result = selectedData ? PUT(OVERTIME.PUT + selectedData?.id, { ...restProps, date_start, date_end, id: selectedData.id, planned_ot_start, planned_ot_end, manager: 0 }) : POST(OVERTIME.POST, { ...restProps, date_start, date_end, planned_ot_start, planned_ot_end, manager: 0 })
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
            fetchData({ type: overtimeType })
            setLoading(false)
        }
    }

    return <Modal title={`${selectedData ? 'Update ' : 'Submit '} Overtime Request`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
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
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
    restoreOvertime?: (id: string) => Promise<boolean>
}

export function ModalCancelRequest({ isModalOpen, selectedRequest, fetchData, overtimeType, handleCancel, restoreOvertime }: ModalCancelRequestProps) {
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
                fetchData({ type: overtimeType })
                setLoading(false)
            })
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
                {selectedRequest?.status === 'PENDING' && (
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading} onClick={cancelRequest}>
                        Cancel Request
                    </Button>
                )}
                <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                    Close
                </Button>
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