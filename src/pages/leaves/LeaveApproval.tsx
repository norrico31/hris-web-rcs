import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Space, Skeleton, Popconfirm, Row, Col, DatePicker, Input, Select, Descriptions, Modal } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import useMessage from 'antd/es/message/useMessage'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { AxiosResponse } from 'axios'
import { Card, Divider, TabHeader, Table } from '../../components'
import { renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, LeaveRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes } from '../../components/layouts/Sidebar'
import { LeaveModal } from './MyLeave'
import useWindowSize from '../../shared/hooks/useWindowSize'

const { GET, POST } = useAxios()
const [{ LEAVES }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function LeaveApproval() {
    renderTitle('Leave - Approval')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalRequest, setIsModalRequest] = useState(false)
    const [isApproved, setIsApproved] = useState(false)
    const [leaveType, setLeaveType] = useState('all')
    const [data, setData] = useState<ILeave[]>([])
    const [selectedData, setSelectedData] = useState<ILeave | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const { width } = useWindowSize()

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

    const codes = filterCodes(user?.role?.permissions)
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['c06']) return <Navigate to='/leave/myleaves' />

    const columns: ColumnsType<ILeave> = [
        {
            title: 'Submitted by',
            key: 'full_name',
            dataIndex: 'full_name',
            render: (_, record) => record?.user?.full_name ?? '-',
            width: 170,
        },
        {
            title: 'Submitted on',
            key: 'date',
            dataIndex: 'date',
            width: 160,
        },
        {
            title: 'Leave type',
            key: 'leave_type',
            dataIndex: 'leave_type',
            width: 120,
            filters: [],
            render: (_, record) => record.leave_type?.type ?? '-',
            align: 'center'
        },
        {
            title: 'Leave start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 120,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Leave end',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 120,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        // {
        //     title: 'Leave duration',
        //     key: 'leave_duration',
        //     dataIndex: 'leave_duration',
        //     render: (_, record) => record?.leave_durations?.name,
        //     width: 250,
        //     align: 'center'
        // },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            filters: arrStatus,
            width: 120,
        },
        {
            title: 'Actions',
            key: 'approver',
            dataIndex: 'approver',
            align: 'center',
            render: (_: any, record: ILeave) => <Space>
                <Button id='approve' size='middle' disabled={record?.status.toLowerCase() == 'approved' || record?.status.toLowerCase() == 'rejected'} onClick={() => selectedRequest(record, true)} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <FcApproval />
                    Approve
                </Button>
                <Button id='reject' size='middle' disabled={record?.status.toLowerCase() == 'approved' || record?.status.toLowerCase() == 'rejected'} onClick={() => selectedRequest(record, false)} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <RxCross2 />
                    Reject
                </Button>
            </Space>,
            width: 250
        }
    ];

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = LEAVES.GET + 'true' + status
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

    async function leaveApproval(url: string, payload: Payload) {
        setLoading(true)
        try {
            try {
                const res = await POST(LEAVES.POST + url, payload)
                console.log(res)
                return Promise.resolve(res)
            } catch (err: any) {
                return Promise.reject(err?.ressponse?.data?.message)
            }
        } catch {
            setLoading(false)
            fetchData({})
        }
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: leaveType })

    function selectedRequest(overtime: ILeave, isApproved: boolean) {
        setSelectedData(overtime)
        setIsApproved(isApproved)
        setIsModalRequest(true)
    }

    function closeModal() {
        setSelectedData(undefined)
        setIsModalRequest(false)
        setIsApproved(false)
    }

    return (
        <>
            <Row justify='space-between' wrap>
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
                    <Select.Option value='all'>All</Select.Option>
                    <Select.Option value='pending'>Pending</Select.Option>
                    <Select.Option value='approved'>Approved</Select.Option>
                    <Select.Option value='reject'>Rejected</Select.Option>
                </Select>
                {width < 978 && <Divider />}
                <Col>
                    <Space>
                        <DatePicker.RangePicker />
                        <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
                        <Button type='primary'>Request</Button>
                    </Space>
                </Col>
            </Row>
            <Divider />
            <Card title='Leave - Approval' level={5}>
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
                    handleCancel={() => setIsModalOpen(false)}
                />
                <LeaveApprovalModal
                    loading={loading}
                    leaveType={leaveType}
                    fetchData={fetchData}
                    leaveApproval={leaveApproval}
                    isModalOpen={isModalRequest}
                    isApproved={isApproved}
                    selectedRequest={selectedData}
                    handleClose={closeModal}
                />
            </Card>
        </>
    )
}


type Payload = {
    remarks: string
    reason: string
    date_start: string | Dayjs
    date_end: string | Dayjs
}

interface ModalProps {
    isModalOpen: boolean
    leaveType: string
    isApproved: boolean
    loading: boolean
    selectedRequest?: ILeave
    handleClose: () => void
    leaveApproval(url: string, remarks: Payload): Promise<AxiosResponse<any, any> | undefined>
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
}

function LeaveApprovalModal({ isApproved, loading, leaveType, selectedRequest, isModalOpen, leaveApproval, handleClose, fetchData }: ModalProps) {
    const [remarks, setRemarks] = useState('')
    const [messageApi, contextHolder] = useMessage()

    async function onSubmit() {
        try {
            if (remarks == null || remarks == '') {
                return messageApi.open({
                    type: 'error',
                    content: `Please enter remarks before ${isApproved ? 'approve' : 'reject'}`,
                    duration: 5
                })
            }
            const payload = {
                remarks,
                reason: selectedRequest?.reason,
                date_start: selectedRequest?.date_start,
                date_end: selectedRequest?.date_end,
            } as Payload
            const url = isApproved ? 'approve/' : 'reject/'
            const res = await leaveApproval(url + selectedRequest?.id, payload)
            console.log(res)
            setRemarks('')
            handleClose()
        } catch (err: any) {
            messageApi.open({
                type: 'error',
                content: err?.response?.data?.message,
                duration: 5
            })
            return err
        } finally {
            fetchData({ type: leaveType })
        }
    }
    return <Modal title={`Leave - ${isApproved ? 'Approve' : 'Reject'}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
        <Descriptions bordered column={2}>
            <Descriptions.Item label="Requested By" span={2}>{selectedRequest?.user?.full_name}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>{selectedRequest?.status}</Descriptions.Item>
            <Descriptions.Item label="Leave Type" span={2}>{selectedRequest?.leave_type?.type}</Descriptions.Item>
            {/* <Descriptions.Item label="Date Requested" span={2}>{selectedRequest?.date?.toString()}</Descriptions.Item> */}
            <Descriptions.Item label="Leave Start" span={2}>{selectedRequest?.date_start?.toString()}</Descriptions.Item>
            <Descriptions.Item label="Leave  End" span={2}>{selectedRequest?.date_end?.toString()}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered layout='vertical'>
            <Descriptions.Item label="Reason" style={{ textAlign: 'center' }}>{selectedRequest?.reason}</Descriptions.Item>
        </Descriptions>
        <Divider />
        <Descriptions bordered>
            <Descriptions.Item label="Remarks" >
                <Input.TextArea placeholder='Remarks...' value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ height: 150 }} />
            </Descriptions.Item>
        </Descriptions>
        <Divider />
        <div style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading} onClick={onSubmit}>
                    {isApproved ? 'Approve' : 'Reject'} Request
                </Button>
                <Button type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                    Cancel
                </Button>
            </Space>
        </div>
    </Modal>
}

const arrStatus = [
    {
        value: 'all',
        text: 'All'
    },
    {
        value: 'pending',
        text: 'Pending'
    },
    {
        value: 'approved',
        text: 'Approved'
    },
    {
        value: 'reject',
        text: 'Reject'
    },
]