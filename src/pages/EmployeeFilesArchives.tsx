import { useState, useEffect, ReactNode, useMemo } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Space, Button, Skeleton, Popconfirm } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import { TabHeader, Table, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useEndpoints } from './../shared/constants/endpoints'
import { useAxios } from './../shared/lib/axios'
import { IArguments, TableParams, IEmployee, Employee201Res } from '../shared/interfaces'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { ROOTPATHS } from '../shared/constants'
import { useAuthContext } from '../shared/contexts/Auth'

const [{ EMPLOYEE201, }] = useEndpoints()
const { GET } = useAxios()

export default function EmployeeFiles() {
    renderTitle('Employee Archives')
    const navigate = useNavigate()
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IEmployee[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    useEffect(() => {
        if (!loadingUser && !codes['g01']) return
        const controller = new AbortController();
        user && fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [user])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['g01', 'g02', 'g03', 'g04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<IEmployee> = [
        {
            title: 'Employee No.',
            key: 'employee_code',
            dataIndex: 'employee_code',
            width: 130,
            align: 'center'
        },
        {
            title: 'Employee Name',
            key: 'full_name',
            dataIndex: 'full_name',
            width: 130,
            align: 'center'
        },
        {
            title: 'Position',
            key: 'position',
            dataIndex: 'position',
            width: 130,
            render: (_, record) => record.position?.name ?? '-'
        },
        {
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
            align: 'center',
            width: 130,
            render: (_, record) => record.department?.name ?? '-'
        },
        {
            title: 'Date Hired',
            key: 'date_hired',
            dataIndex: 'date_hired',
            align: 'center',
            width: 110,
        },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
            align: 'center',
            width: 110,
            render: (_, record) => record.is_active ?? '-'
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IEmployee) => <Popconfirm
                title={`Restore employee`}
                description={`Are you sure you want to restore ${record?.full_name}?`}
                onConfirm={() => {
                    GET(EMPLOYEE201.RESTORE + record?.id)
                        .then((res) => res)
                        .finally(() => fetchData({
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize,
                        }))
                }}
                okText="Restore"
                cancelText="Cancel"
            >
                <Button id='restore' type='primary' size='middle' onClick={() => null}>
                    <Space align='center'>
                        <BiRefresh />
                        Restore
                    </Space>
                </Button>
            </Popconfirm>,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<Employee201Res>(EMPLOYEE201.ARCHIVES, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        <>
            <MainHeader>
                <h1 className='color-white'>Employees 201 Files - Archives</h1>
            </MainHeader>
            <TabHeader
                handleSearch={handleSearch}
            >
                <Button onClick={() => navigate('/employee')}>Back to employees</Button>
            </TabHeader>
            <Table loading={loading} tableParams={tableParams} columns={columns} dataList={data} onChange={onChange} />
        </>
    )
}