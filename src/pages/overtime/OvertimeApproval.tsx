import { useState, useEffect, ReactNode } from 'react'
import { Button, Col, DatePicker, Input, List, Modal, Row, Select, Skeleton, Space, Card as AntDCard, Typography } from 'antd'
import { Navigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import useMessage from 'antd/es/message/useMessage'
import { AxiosResponse } from 'axios'
import { ColumnsType } from 'antd/es/table'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { useSearchDebounce } from '../../shared/hooks/useDebounce'
import { Card, Divider, Table } from '../../components'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, IOvertime, OvertimeRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes } from '../../components/layouts/Sidebar'
import { OvertimeDescription, OvertimeModal } from './MyOvertime'
import { DividerWidth } from '../leaves/LeaveApproval'

const { GET, PUT } = useAxios()
const [{ OVERTIME }] = useEndpoints()

dayjs.extend(localizedFormat)
const { Title } = Typography

export default function OvertimeApproval() {
    renderTitle('Overtime Approval')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [overtimeType, setOvertimeType] = useState('pending')
    const [data, setData] = useState<IOvertime[]>([])
    const [selectedData, setSelectedData] = useState<IOvertime | undefined>(undefined)
    const [search, setSearch] = useState('')
    const searchDebounce = useSearchDebounce(search)
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [isModalRequest, setIsModalRequest] = useState(false)
    const [isApproved, setIsApproved] = useState(false)
    const [{ start_date, end_date }, setDate] = useState<{ start_date?: string; end_date?: string }>({ start_date: undefined, end_date: undefined })

    useEffect(function fetch() {
        if (!loadingUser && !codes['f06']) return
        const controller = new AbortController();
        user && fetchData({
            args: {
                search: searchDebounce,
                signal: controller.signal,
                page: tableParams?.pagination?.current,
                pageSize: tableParams?.pagination?.pageSize,
            },
            type: overtimeType,
            start_date,
            end_date
        })
        return () => {
            controller.abort()
        }
    }, [user, searchDebounce])

    const codes = filterCodes(user?.role?.permissions)
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['f06']) return <Navigate to='/overtime/myovertime' />

    const columns: ColumnsType<IOvertime> = [
        {
            title: 'Submitted by',
            key: 'full_name',
            dataIndex: 'full_name',
            render: (_, record) => record?.user?.full_name ?? '-',
            width: 170,
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Overtime Date',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 150,
            render: (_, record) => `${dayjs(record?.date).format('MMMM')} ${dayjs(record?.date).format('D')}, ${dayjs(record?.date).format('YYYY')}`
        },
        {
            title: 'Time Start',
            key: 'planned_ot_start',
            dataIndex: 'planned_ot_start',
            width: 150
        },
        {
            title: 'Time End',
            key: 'planned_ot_end',
            dataIndex: 'planned_ot_end',
            width: 150
        },
        {
            title: 'Reason',
            key: 'reason',
            dataIndex: 'reason',
            width: 250,
            align: 'center'
        },
        {
            title: 'Actions',
            key: 'approver',
            dataIndex: 'approver',
            align: 'center',
            render: (_: any, record: IOvertime) => <Space>
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

    function fetchData({ type, args, start_date, end_date }: { args?: IArguments; type?: string; start_date?: string; end_date?: string; }) {
        setLoading(true)
        const status = `&status=${type?.toUpperCase()}`
        let url = OVERTIME.GET + 'true' + status
        url = (start_date && end_date) ? (url + `&start_date=${start_date}&end_date=${end_date}`) : url
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
            })
            .catch((err) => err)
            .finally(() => setLoading(false))
    }

    async function overtimeApproval(url: string, payload: Payload) {
        setLoading(true)
        try {
            try {
                const res = await PUT(OVERTIME.POST + url, payload)
                closeModal()
                return Promise.resolve(res)
            } catch (err) {
                return Promise.reject(err)
            }
        } finally {
            setLoading(false)
            fetchData({ type: overtimeType })
        }
    }

    function selectedRequest(overtime: IOvertime, isApproved: boolean) {
        setSelectedData(overtime)
        setIsApproved(isApproved)
        setIsModalRequest(true)
    }

    function closeModal() {
        setSelectedData(undefined)
        setIsModalRequest(false)
        setIsApproved(false)
    }

    const onChange = (page: number, pageSize: number) => fetchData({ args: { page, pageSize, search: searchDebounce }, type: overtimeType, start_date, end_date })

    return (
        <>
            <Row justify='space-between' wrap>
                <Select value={overtimeType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
                    setOvertimeType((str == undefined || str == '') ? 'pending' : str)
                    fetchData({
                        args: {
                            search: searchDebounce,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize
                        },
                        type: (str == undefined || str == '') ? 'pending' : str,
                        start_date,
                        end_date
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
                            const start_date = d?.length > 0 ? dayjs(d[0]).format('YYYY/MM/DD') : undefined
                            const end_date = d?.length > 0 ? dayjs(d[1]).format('YYYY/MM/DD') : undefined
                            fetchData({ type: overtimeType, start_date, end_date, args: { page: tableParams?.pagination?.current ?? 1, search: searchDebounce, pageSize: tableParams?.pagination?.pageSize } })
                            setDate({ start_date, end_date })
                        }} />
                        <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
                    </Space>
                </Col>
            </Row>
            <Divider />
            <Title level={3}>For Approval</Title>
            {/* <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                /> */}
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
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
                        <AntDCard style={{ padding: 0 }} title={<h3 style={{ color: '#E49944', fontSize: 18 }}>{item.user.full_name}</h3>} extra={<blockquote style={{ margin: '10px 0' }}>{item.status}</blockquote>}>
                            <div style={{ textAlign: 'center' }}>
                                <Space direction='vertical' align='center'>
                                    <b style={{ fontSize: 18, color: '#949494' }}>Date: {item.date_start as ReactNode} - {item.date_end as ReactNode}</b>
                                    <b style={{ fontSize: 32, color: '#9B3423' }}>{item.planned_ot_start as ReactNode} - {item.planned_ot_end as ReactNode}</b>
                                </Space>
                            </div>
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
            <OvertimeApprovalModal
                overtimeApproval={overtimeApproval}
                isModalOpen={isModalRequest}
                isApproved={isApproved}
                selectedRequest={selectedData}
                handleClose={closeModal}
                fetchData={fetchData}
                overtimeType={overtimeType}
            />
            <OvertimeModal
                overtimeType={overtimeType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}

const selectOptions = ['Pending', 'Approved']

type Payload = {
    remarks: string
    reason: string
    date: string
    planned_ot_start: string
    planned_ot_end: string
}

interface ModalProps {
    isModalOpen: boolean
    isApproved: boolean
    overtimeType: string
    selectedRequest?: IOvertime
    handleClose: () => void
    overtimeApproval(url: string, remarks: Payload): Promise<AxiosResponse<any, any>>
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
}

function OvertimeApprovalModal({ isApproved, overtimeType, selectedRequest, isModalOpen, overtimeApproval, handleClose, fetchData }: ModalProps) {
    const [remarks, setRemarks] = useState('')
    const [messageApi, contextHolder] = useMessage()
    const [loading, setLoading] = useState(false)
    const key = 'error'

    async function onSubmit() {
        try {
            if (!isApproved && (remarks == null || remarks == '')) {
                messageApi.open({
                    key,
                    type: 'error',
                    content: `Please enter remarks before ${isApproved ? 'approve' : 'reject'}`,
                    duration: 5
                })
                return
            }
            setLoading(true)
            const url = isApproved ? 'approve-overtime/' : 'reject-overtime/'
            const payload = {
                remarks,
                date: selectedRequest?.date,
                planned_ot_start: selectedRequest?.planned_ot_start,
                planned_ot_end: selectedRequest?.planned_ot_end,
                reason: selectedRequest?.reason
            } as Payload
            const res = await overtimeApproval(url + selectedRequest?.id, payload)
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
            fetchData({ type: overtimeType })
            setLoading(false)
        }
    }

    return <Modal title={`Overtime - ${isApproved ? 'Approve' : 'Reject'}`} open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
        <OvertimeDescription
            remarks={remarks}
            setRemarks={setRemarks}
            selectedRequest={selectedRequest!}
        />
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