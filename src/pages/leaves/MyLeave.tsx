import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Select, Skeleton, Row, TimePicker, Descriptions, Divider as AntDDivider, Col } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import useMessage from 'antd/es/message/useMessage'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Form, TabHeader, Table, Leaves, Divider } from '../../components'
import { renderTitle } from '../../shared/utils/utilities'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, ILeaveType, LeaveRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { AiOutlineEdit } from 'react-icons/ai'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ LEAVES, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function MyLeave() {
    renderTitle('Leave')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [leaveType, setLeaveType] = useState('all')
    const [data, setData] = useState<ILeave[]>([])
    const [selectedData, setSelectedData] = useState<ILeave | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [isModalCancel, setIsModalCancel] = useState(false)
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    useEffect(function fetch() {
        const controller = new AbortController();
        if (user != undefined) fetchData({
            args: {
                signal: controller.signal, search,
                page: tableParams?.pagination?.current,
                pageSize: tableParams?.pagination?.pageSize,
            },
            type: leaveType
        })
        return () => {
            controller.abort()
        }
    }, [user, search])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['c01']) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<ILeave> = renderColumns({ handleEdit, handleDelete, handleRequestSelected })

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = LEAVES.GET + 'false' + status
        GET<LeaveRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    function handleRequestSelected(overtime: ILeave) {
        setSelectedData(overtime)
        setIsModalCancel(true)
    }

    function handleDelete(id: string) {
        DELETE(LEAVES.DELETE, id)
            .finally(() => fetchData({ type: leaveType }))
    }

    function handleEdit(data: ILeave) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: leaveType })

    function closeModal() {
        setIsModalOpen(false)
        setSelectedData(undefined)
        setIsModalCancel(false)
    }

    return (
        <>
            <TabHeader handleSearch={setSearch} handleCreate={() => setIsModalOpen(true)} isRequest>
                <Select value={leaveType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
                    setLeaveType((str == undefined || str == '') ? 'all' : str)
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
            <Row justify='center'>
                <Col span={4}>
                    <Leaves />
                </Col>
            </Row>
            <Divider style={{ border: 'none' }} />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <LeaveModal
                leaveType={leaveType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                handleCancel={closeModal}
            />
            <ModalCancelRequest
                leaveType={leaveType}
                fetchData={fetchData}
                selectedRequest={selectedData}
                handleClose={closeModal}
                isModalOpen={isModalCancel}
            />
        </>
    )
}

const selectOptions = ['All', 'Pending', 'Approved']

type ModalProps = {
    leaveType: string
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
    selectedData?: ILeave
    isModalOpen: boolean
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

export function LeaveModal({ leaveType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [lists, setLists] = useState<ILeaveType[]>([])
    const [messageApi, contextHolder] = useMessage()
    const key = 'error'

    useEffect(() => {
        if (selectedData) {
            form.setFieldsValue({
                ...selectedData,
                date_start: selectedData?.date_start ? dayjs(selectedData?.date_start, 'YYYY/MM/DD') : null,
                date_end: selectedData?.date_end ? dayjs(selectedData?.date_end, 'YYYY/MM/DD') : null,
                time_start: selectedData?.time_start ? dayjs(selectedData?.time_start, 'h:mm A') : null,
                time_end: selectedData?.time_end ? dayjs(selectedData?.time_end, 'h:mm A') : null,
            })
        } else form.resetFields()

        const controller = new AbortController();
        axiosClient(HRSETTINGS.LEAVETYPE.LISTS, { signal: controller.signal })
            .then((res) => setLists(res?.data ?? []))
        return () => {
            controller.abort()
        }
    }, [selectedData])

    async function onFinish({ date_end, date_start, time_start, time_end, ...restProps }: Record<string, any>) {
        setLoading(true)
        date_start = dayjs(date_start).format('YYYY/MM/DD') as any
        date_end = dayjs(date_end).format('YYYY/MM/DD') as any
        time_start = dayjs(time_start).format('LT')
        time_end = dayjs(time_end).format('LT')
        restProps = { ...restProps, date_start, date_end, time_start, time_end } as any
        try {
            let result = selectedData ? PUT(LEAVES.PUT + selectedData?.id, { ...restProps, id: selectedData.id }) : POST(LEAVES.POST, restProps)
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
            fetchData({ type: leaveType })
            setLoading(false)
        }
    }

    return <Modal title='Request a Leave' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Leave Type"
                name="leave_type_id"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Select placeholder='Select leave type...' optionFilterProp="children" allowClear showSearch>
                    {lists.map((leave) => (
                        <Select.Option value={leave.id} key={leave.id} style={{ color: '#777777' }}>{leave?.type}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <Row justify='space-around' wrap={false}>
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
            <Row justify='space-around' wrap={false}>
                <FormItem
                    label="Start Time"
                    name="time_start"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >

                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format="h:mm A" />
                </FormItem>
                <FormItem
                    label="End Time"
                    name="time_end"
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
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                    {selectedData ? 'Update' : 'Submit'} Request
                </Button>
            </Row>
        </Form>
    </Modal>
}

const renderColumns = ({ handleEdit, handleDelete, handleRequestSelected }: { handleEdit: (ot: ILeave) => void; handleDelete: (id: string) => void; handleRequestSelected: (ot: ILeave) => void; }): ColumnsType<ILeave> => [
    {
        title: 'Submitted On',
        key: 'created_at',
        dataIndex: 'created_at',
        render: (_, record) => new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
        width: 150,
        align: 'center'
    },
    {
        title: 'Leave Type',
        key: 'leave_type',
        dataIndex: 'leave_type',
        width: 150,
        render: (_, record) => record.leave_type?.type ?? '-',
        align: 'center'
    },
    {
        title: 'Leave Start Requested',
        key: 'date_start',
        dataIndex: 'date_start',
        width: 300,
        render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
    },
    {
        title: 'Leave End Requested',
        key: 'date_end',
        dataIndex: 'date_end',
        width: 300,
        render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
    },
    {
        title: 'Requested Leave Duration',
        key: 'durations',
        dataIndex: 'durations',
        width: 250,
        align: 'center'
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
        render: (_, record: ILeave) => <Space direction='vertical'>
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

interface ModalCancelRequest {
    isModalOpen: boolean
    leaveType: string
    selectedRequest?: ILeave
    handleClose: () => void
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
    restoreLeave?: (id: string) => Promise<boolean>
}

export function ModalCancelRequest({ leaveType, selectedRequest, isModalOpen, handleClose, fetchData, restoreLeave }: ModalCancelRequest) {
    const [remarks, setRemarks] = useState('')
    const [messageApi, contextHolder] = useMessage()
    const [loading, setLoading] = useState(false)
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
        POST(LEAVES.CANCEL + selectedRequest?.id, { cancel_reason: remarks })
            .then((res) => {
                setRemarks('')
                handleClose()
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
                fetchData({ type: leaveType })
                setLoading(false)
            })
    }
    return <Modal title='Leave - Cancel Request' open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
        <LeaveDescription
            selectedRequest={selectedRequest!}
            remarks={remarks}
            setRemarks={setRemarks}
        />
        <Divider />
        <div style={{ textAlign: 'right' }}>
            <Space>
                {selectedRequest?.status === 'PENDING' && (
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading} onClick={cancelRequest}>
                        Cancel Request
                    </Button>
                )}
                <Button type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                    Close
                </Button>
            </Space>
        </div>
    </Modal>
}

type LeaveDescriptionProps = {
    selectedRequest: ILeave;
    remarks: string;
    setRemarks: React.Dispatch<React.SetStateAction<string>>
}

export function LeaveDescription({ selectedRequest, remarks, setRemarks }: LeaveDescriptionProps) {
    return <>
        <Descriptions bordered column={2}>
            <Descriptions.Item label="Requested By" span={2}>{selectedRequest?.user?.full_name}</Descriptions.Item>
            <Descriptions.Item label="Requested Date" span={2}>{new Date(selectedRequest?.created_at!).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
            <Descriptions.Item label="Leave Start" span={2}>{new Date(selectedRequest?.date_start! + '').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
            <Descriptions.Item label="Leave End" span={2}>{new Date(selectedRequest?.date_end! + '').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Descriptions.Item>
            <Descriptions.Item label="Start Time" span={2}>{selectedRequest?.time_start?.toString()}</Descriptions.Item>
            <Descriptions.Item label="End Time" span={2}>{selectedRequest?.time_end?.toString()}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>{selectedRequest?.status}</Descriptions.Item>
            <Descriptions.Item label="Leave Type" span={2}>{selectedRequest?.leave_type?.type}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered layout='vertical'>
            <Descriptions.Item label="Reason" style={{ textAlign: 'center' }}>{selectedRequest?.reason}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered>
            <Descriptions.Item label={selectedRequest?.cancel_reason ? 'Cancel Remarks' : "Remarks"} >
                {selectedRequest?.remarks ? (selectedRequest?.remarks) : selectedRequest?.cancel_reason ? selectedRequest?.cancel_reason : (
                    <Input.TextArea placeholder='Remarks...' value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ height: 150 }} disabled={selectedRequest?.status !== 'PENDING'} />
                )}
            </Descriptions.Item>
        </Descriptions>
    </>
}