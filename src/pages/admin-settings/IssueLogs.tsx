import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Skeleton } from 'antd'
import { useAuthContext } from '../../shared/contexts/Auth'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Table, Card, TabHeader } from "../../components"
import { useAxios } from '../../shared/lib/axios'
import { ADMINSETTINGSPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IIssueLogs, IssueLogsRes, TableParams } from '../../shared/interfaces'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function IssueLogs() {
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IIssueLogs[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['id01']) return <Navigate to={'/' + paths[0]} />

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IIssueLogs> = [
        {
            title: 'Environment',
            key: 'env',
            dataIndex: 'env',
            width: 120,
        },
        {
            title: 'Service',
            key: 'service',
            dataIndex: 'service',
            width: 120,
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            width: 120,
            align: 'center'
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<IssueLogsRes>(ADMINSETTINGS.ISSUELOGS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    return (
        <Card title='Issue Logs'>
            <TabHeader
                handleSearch={handleSearch}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={Object.values(data)}
                tableParams={tableParams}
                onChange={onChange}
            />
        </Card>
    )
}
