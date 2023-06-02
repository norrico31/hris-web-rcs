import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Select, Skeleton, Popconfirm, Space } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { Card, TabHeader, Table } from '../../components'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, LeaveRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { BiRefresh } from 'react-icons/bi'
import { ModalCancelRequest } from './MyLeave'

const { GET } = useAxios()
const [{ LEAVES }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function LeaveArchives() {
    renderTitle('Leave Archives')
    const { user, loading: loadingUser } = useAuthContext()
    const [leaveType, setLeaveType] = useState('all')
    const [data, setData] = useState<ILeave[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [isModalCancel, setIsModalCancel] = useState(false)
    const [selectedData, setSelectedData] = useState<ILeave | undefined>(undefined)

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

    const columns: ColumnsType<ILeave> = [
        {
            title: 'Name',
            key: 'full_name',
            dataIndex: 'full_name',
            render: (_, record) => record?.user?.full_name ?? '-',
            width: 150,
        },
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
            render: (_, record) => record.leave_type?.type ?? '-',
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
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: ILeave) => <Button className='btn-secondary' onClick={() => handleRequestSelected(record)}>
                View
            </Button>,
            width: 150
        }
    ];

    function handleRequestSelected(overtime: ILeave) {
        setSelectedData(overtime)
        setIsModalCancel(true)
    }

    function restoreLeave(id: string) {
        return GET(LEAVES.RESTORE + id)
            .then(() => true)
            .finally(() => fetchData({ type: leaveType }))
    }

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `?status=${type?.toUpperCase()}` : ''
        const url = LEAVES.ARCHIVES + status
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: leaveType })

    function closeModal() {
        setSelectedData(undefined)
        setIsModalCancel(false)
    }
    return (
        <>
            <TabHeader handleSearch={setSearch}>
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
            </TabHeader>
            <Card title={`Archives - ${firstLetterCapitalize(leaveType)}`} level={5}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                />
            </Card>
            <ModalCancelRequest
                isModalOpen={isModalCancel}
                selectedRequest={selectedData!}
                handleClose={closeModal}
                leaveType={leaveType}
                fetchData={fetchData}
                restoreLeave={restoreLeave}
            />
        </>
    )
}