import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Space, Skeleton, Popconfirm, Select, Row, Col, DatePicker, Input } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import { Card, Divider, TabHeader, Table } from '../../components'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { renderTitle } from '../../shared/utils/utilities'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, LeaveRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { LeaveModal } from './MyLeave'

const { GET, POST, PUT } = useAxios()
const [{ LEAVES, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function LeaveApproval() {
    renderTitle('Leave - Approval')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [leaveType, setLeaveType] = useState('all')
    const [data, setData] = useState<ILeave[]>([])
    const [selectedData, setSelectedData] = useState<ILeave | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

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
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['c01', 'c02', 'c03', 'c04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />
    if (user?.role.name.toLowerCase() !== 'manager' && user?.role.name.toLowerCase() !== 'admin') return <Navigate to={'/leave/leaves'} />

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
            render: (_, record) => record.leave_type?.name ?? '-',
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
            title: 'Leave duration',
            key: 'leave_duration',
            dataIndex: 'leave_duration',
            render: (_, record) => record?.leave_durations?.name,
            width: 250,
            align: 'center'
        },
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
            render: (_: any, record: ILeave) => {
                return <Space>
                    <Popconfirm
                        title={`Leave request by - ${record?.user?.full_name}`}
                        description={`Are you sure you want to approve ${record?.reason}?`}
                        onConfirm={() => leaveApproval(`approve/${record?.id}`)}
                        okText="Approve"
                        cancelText="Cancel"
                        disabled={record?.status.toLowerCase() == 'approved'}
                    >
                        <Button id='approve' size='middle' disabled={record?.status.toLowerCase() == 'approved'} onClick={() => null} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                            <FcApproval />
                            Approve
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title={`Leave request by - ${record?.user?.full_name}`}
                        description={`Are you sure you want to reject ${record?.reason}?`}
                        onConfirm={() => leaveApproval(`reject/${record?.id}`)}
                        okText="Reject"
                        cancelText="Cancel"
                        disabled={record?.status.toLowerCase() == 'approved'}
                    >
                        <Button id='reject' size='middle' disabled={record?.status.toLowerCase() == 'approved'} onClick={() => null} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                            <RxCross2 />
                            Reject
                        </Button>
                    </Popconfirm>
                </Space>
            },
            width: 250
        }
    ];

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = LEAVES.GET + 'true' + status
        console.log('type: ', type)
        console.log('leaveType: ', leaveType)
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

    function leaveApproval(url: string) {
        setLoading(true)
        POST(LEAVES.POST + url, {})
            .then((res) => {
                console.log(res)
                alert('')
            })
            .catch((err) => console.log('error ng pag approval: ', err))
            .catch(() => {
                setLoading(false)
                fetchData({})
            })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: leaveType })

    return (
        <>
            <Row justify='space-between' wrap>
                {/* <Select value={leaveType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
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
                    </Select> */}
                <Col>
                    <DatePicker.RangePicker />
                </Col>
                <Col>
                    <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
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
            </Card>
        </>
    )
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