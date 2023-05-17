import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Space, Skeleton, Popconfirm } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import { Card, TabHeader, Table } from '../../components'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { renderTitle } from '../../shared/utils/utilities'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, LeaveRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET, POST, PUT } = useAxios()
const [{ LEAVES, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function ForApproval() {
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
            signal: controller.signal,
            page: tableParams?.pagination?.current,
            pageSize: tableParams?.pagination?.pageSize,
            search,
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
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Leave Type',
            key: 'leave_type',
            dataIndex: 'leave_type',
            width: 120,
            render: (_, record) => record.leave_type?.name ?? '-',
            align: 'center'
        },
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 120,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Date End',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 120,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        {
            title: 'Time Start',
            key: 'time_start',
            dataIndex: 'time_start',
            width: 120
        },
        {
            title: 'Time End',
            key: 'time_end',
            dataIndex: 'time_end',
            width: 120
        },
        {
            title: 'Reason',
            key: 'reason',
            dataIndex: 'reason',
            width: 250,
            align: 'center'
        },
        {
            title: 'For Approval',
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

    function fetchData(args: IArguments) {
        setLoading(true)
        GET<LeaveRes>(LEAVES.GET + 'true&status=PENDING', args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    return (
        <>
            <TabHeader handleSearch={setSearch} />
            <Card title='Leave - Approval' level={5}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                />
            </Card>

        </>
    )
}