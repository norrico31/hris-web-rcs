import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Popconfirm, Select, Skeleton, Space } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { BiRefresh } from 'react-icons/bi'
import { Card, TabHeader, Table } from '../../components'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IOvertime, OvertimeRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { ModalCancelRequest } from './MyOvertime'

const { GET } = useAxios()
const [{ OVERTIME }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function OvertimeArchives() {
    renderTitle('Overtime Archives')
    const { user, loading: loadingUser } = useAuthContext()
    const [overtimeType, setOvertimeType] = useState('all')
    const [data, setData] = useState<IOvertime[]>([])
    const [selectedData, setSelectedData] = useState<IOvertime | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [isModalCancel, setIsModalCancel] = useState(false)

    useEffect(function fetch() {
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
    }, [user, search])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['c01', 'c02', 'c03', 'c04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<IOvertime> = [
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 150,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Date End',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 150,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
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
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IOvertime) => <Button className='btn-secondary' onClick={() => handleRequestSelected(record)}>
                View
            </Button>,
            width: 150
        }
    ];

    function handleRequestSelected(overtime: IOvertime) {
        setSelectedData(overtime)
        setIsModalCancel(true)
    }

    function restoreOvertime(id: string) {
        return GET(OVERTIME.RESTORE + id)
            .then(() => true)
            .finally(() => fetchData({ type: overtimeType }))
    }

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `?status=${type?.toUpperCase()}` : ''
        GET<OvertimeRes>(OVERTIME.ARCHIVES + status, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: overtimeType })

    function closeModal() {
        setSelectedData(undefined)
        setIsModalCancel(false)
    }

    return (
        <>
            <TabHeader handleSearch={setSearch} isRequest>
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
                    <Select.Option value='all'>All</Select.Option>
                    <Select.Option value='pending'>Pending</Select.Option>
                    <Select.Option value='approved'>Approved</Select.Option>
                    <Select.Option value='reject'>Rejected</Select.Option>
                </Select>
            </TabHeader>
            <Card title={`Archives - ${firstLetterCapitalize(overtimeType)}`} level={5}>
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
                handleCancel={closeModal}
                overtimeType={overtimeType}
                fetchData={fetchData}
                restoreOvertime={restoreOvertime}
            />
        </>
    )
}