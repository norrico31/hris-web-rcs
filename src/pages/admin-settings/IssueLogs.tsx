import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Select, Skeleton } from 'antd'
import { useAuthContext } from '../../shared/contexts/Auth'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Table, Card, TabHeader } from "../../components"
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ADMINSETTINGSPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IIssueLogs, IssueLogsRes, TableParams } from '../../shared/interfaces'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'
import { firstLetterCapitalize } from '../../shared/utils/utilities'
import { BASE_URL_SYSTEMLOGS } from '../../shared/config'
import { useSearchDebounce } from '../../shared/hooks/useDebounce'

const { GET } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

const urlProd = BASE_URL_SYSTEMLOGS

export default function IssueLogs() {
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IIssueLogs[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const debounceSearch = useSearchDebounce(search, 700)
    const [loading, setLoading] = useState(true)

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])
    const [logs, setLogs] = useState('backend')

    useEffect(function () {
        if (!loadingUser && !codes['id01']) return
        const controller = new AbortController();
        fetchData({ signal: controller.signal, search: debounceSearch })
        return () => {
            controller.abort()
        }
    }, [loadingUser, logs, debounceSearch])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['id01']) return <Navigate to={'/' + paths[0]} />

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

    async function fetchData(args?: IArguments) {
        setLoading(true)
        const urls: Record<string, string> = {
            'backend': urlProd + `${logs}/laravel_logs`,
            'cron': urlProd + `${logs}/laravel_logs`,
            'auth': urlProd + 'auth_svc/laravel_logs',
            'email': urlProd + `${logs}/laravel_logs`,
            'report': urlProd + `${logs}/laravel_logs`,
            'passthru': urlProd + 'laravel_logs',
        }
        try {
            const res = await axiosClient.get(urls[logs], { params: { page: args?.page!, search: args?.search!, limit: args?.pageSize! }, signal: args?.signal! }) as any
            setData(res?.data.data.data ?? [])
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams?.pagination,
                    total: res?.data.data?.total,
                    current: res?.data.data?.current_page,
                },
            })
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search: debounceSearch, pageSize: pagination?.pageSize! })

    return (
        <Card title={`System Logs - ${firstLetterCapitalize(logs)}`}>
            <TabHeader
                handleSearch={setSearch}
            >
                <Select value={logs} allowClear showSearch optionFilterProp='children' onChange={(str) => setLogs((str == undefined || str == '') ? 'backend' : str)} style={{ width: 150 }}>
                    {logsList.map((opt) => (
                        <Select.Option value={opt.toLocaleLowerCase()} key={opt}>{firstLetterCapitalize(opt)}</Select.Option>
                    ))}
                </Select>
            </TabHeader>
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

const logsList = ['backend', 'cron', 'report', 'passthru', 'auth']
