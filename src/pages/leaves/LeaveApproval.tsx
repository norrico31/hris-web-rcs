import { useState, useEffect, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Space, Skeleton, Row, Col, DatePicker, Input, Select, Descriptions, Modal, List, Card as AntDCard, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { ColumnsType } from 'antd/es/table'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import useMessage from 'antd/es/message/useMessage'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { AxiosResponse } from 'axios'
import { useSearchDebounce } from '../../shared/hooks/useDebounce'
import { Card, Divider } from '../../components'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
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
const { Title } = Typography

export default function LeaveApproval() {
    renderTitle('Leave Approval')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalRequest, setIsModalRequest] = useState(false)
    const [isApproved, setIsApproved] = useState(false)
    const [leaveType, setLeaveType] = useState('pending')
    const [data, setData] = useState<ILeave[]>([])
    const [selectedData, setSelectedData] = useState<ILeave | undefined>(undefined)
    const [search, setSearch] = useState('')
    const searchDebounce = useSearchDebounce(search)
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [{ date_start, date_end }, setDate] = useState<{ date_start?: string; date_end?: string }>({ date_start: undefined, date_end: undefined })

    useEffect(function fetch() {
        if (!loadingUser && !codes['c06']) return
        const controller = new AbortController();
        user && fetchData({
            args: {
                search: searchDebounce,
                signal: controller.signal,
                page: tableParams?.pagination?.current,
                pageSize: tableParams?.pagination?.pageSize,
            },
            type: leaveType,
            date_start,
            date_end
        })
        return () => {
            controller.abort()
        }
    }, [user, searchDebounce])

    const codes = filterCodes(user?.role?.permissions)
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['c06']) return <Navigate to='/myleaves/myleaves' />

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
            render: (_, record) => `${dayjs(record?.created_at).format('MMMM')} ${dayjs(record?.created_at).format('D')}, ${dayjs(record?.created_at).format('YYYY')}`,
            width: 110,
        },
        {
            title: 'Leave type',
            key: 'leave_type',
            dataIndex: 'leave_type',
            width: 120,
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
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
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
    ]

    function fetchData({ type, args, date_start, date_end }: { args?: IArguments; type?: string; date_start?: string; date_end?: string }) {
        setLoading(true)
        const status = `&status=${type?.toUpperCase()}`
        let url = LEAVES.GET + 'true' + status
        url = (date_start && date_end) ? (url + `&date_start=${date_start}&date_end=${date_end}`) : url
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

    const onChange = (page: number, pageSize: number) => fetchData({ args: { page, pageSize, search: searchDebounce }, type: leaveType, date_start, date_end })

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
                    setLeaveType((str == undefined || str == '') ? 'pending' : str)
                    fetchData({
                        args: {
                            search: searchDebounce,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize
                        },
                        type: (str == undefined || str == '') ? 'pending' : str,
                        date_start,
                        date_end
                    })
                }} style={{ width: 150 }}>
                    {selectOptions.map((opt) => (
                        <Select.Option value={opt.toLocaleLowerCase()} key={opt}>{opt}</Select.Option>
                    ))}
                </Select>
                <DividerWidth />
                <Col>
                    <Space>
                        <DatePicker.RangePicker onChange={(d: any) => {
                            const date_start = d?.length > 0 ? dayjs(d[0]).format('YYYY-MM-DD') : undefined
                            const date_end = d?.length > 0 ? dayjs(d[1]).format('YYYY-MM-DD') : undefined
                            fetchData({ type: leaveType, date_start, date_end, args: { page: tableParams?.pagination?.current ?? 1, search: searchDebounce, pageSize: tableParams?.pagination?.pageSize } })
                            setDate({ date_start, date_end })
                        }} />
                        <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
                    </Space>
                </Col>
            </Row>
            <Divider />
            <Title level={3}>For Approval</Title>
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 2,
                    lg: 2,
                    xl: 2,
                    xxl: 2,
                }}
                pagination={{ position: 'bottom', align: 'center', onChange }}
                loading={loading}
                dataSource={data}
                renderItem={(item) => (
                    <List.Item key={item.id}>
                        <AntDCard style={{ padding: 0 }} title={<h3 style={{ color: '#E49944', fontSize: 18 }}>{item.user.full_name}</h3>} extra={<b style={{ fontSize: 16 }}>{item?.date_start as ReactNode}</b>}>
                            <Row justify='center'>
                                <b style={{ fontSize: 32, color: '#9B3423' }}>{item.time_start as ReactNode} - {item.time_end as ReactNode}</b>
                            </Row>
                            <p>{item.leave_type.type}</p>
                            <Row justify='center'>
                                <Space>
                                    <Button id='approve' size='middle' disabled={item?.status.toLowerCase() == 'approved' || item?.status.toLowerCase() == 'rejected'} onClick={() => selectedRequest(item, true)} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                                        <FcApproval />
                                        Approve
                                    </Button>
                                    <Button id='reject' size='middle' disabled={item?.status.toLowerCase() == 'approved' || item?.status.toLowerCase() == 'rejected'} onClick={() => selectedRequest(item, false)} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                                        <RxCross2 />
                                        Reject
                                    </Button>
                                </Space>
                            </Row>
                        </AntDCard>
                    </List.Item>
                )}
            />
            <LeaveModal
                leaveType={leaveType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                handleCancel={() => setIsModalOpen(false)}
            />
            <LeaveApprovalModal
                leaveType={leaveType}
                fetchData={fetchData}
                leaveApproval={leaveApproval}
                isModalOpen={isModalRequest}
                isApproved={isApproved}
                selectedRequest={selectedData}
                handleClose={closeModal}
            />
        </>
    )
}

const selectOptions = ['Pending', 'Approved']

export function DividerWidth() {
    const { width } = useWindowSize()
    return width < 978 ? <Divider /> : null
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
    selectedRequest?: ILeave
    handleClose: () => void
    leaveApproval(url: string, remarks: Payload): Promise<AxiosResponse<any, any> | undefined>
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
}

function LeaveApprovalModal({ isApproved, leaveType, selectedRequest, isModalOpen, leaveApproval, handleClose, fetchData }: ModalProps) {
    const [remarks, setRemarks] = useState('')
    const [messageApi, contextHolder] = useMessage()
    const [loading, setLoading] = useState(false)
    const key = 'error'

    async function onSubmit() {
        try {
            if (!isApproved && (remarks == null || remarks == '')) {
                return messageApi.open({
                    key,
                    type: 'error',
                    content: `Please enter remarks before ${isApproved ? 'approve' : 'reject'}`,
                })
            }
            setLoading(true)
            const payload = {
                remarks,
                reason: selectedRequest?.reason,
                date_start: selectedRequest?.date_start,
                date_end: selectedRequest?.date_end,
            } as Payload
            const url = isApproved ? 'approve/' : 'reject/'
            const res = await leaveApproval(url + selectedRequest?.id, payload)
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
            setLoading(false)
        }
    }
    return <Modal title={`Leave - ${isApproved ? 'Approve' : 'Reject'}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
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