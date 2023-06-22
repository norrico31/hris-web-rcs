import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Skeleton } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, TabHeader, Table, Form, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useEndpoints } from './../shared/constants/endpoints'
import { useAxios } from './../shared/lib/axios'
import { IArguments, TableParams, IEmployee, Employee201Res, IUser } from '../shared/interfaces'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { ROOTPATHS } from '../shared/constants'
import { useAuthContext } from '../shared/contexts/Auth'

const [{ EMPLOYEE201, MYTEAMS }] = useEndpoints()
const { GET, DELETE } = useAxios()

export default function MyTeam() {
    renderTitle('My Team')
    const navigate = useNavigate()
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IUser[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    useEffect(() => {
        if (!loadingUser && !codes['mb01']) return
        const controller = new AbortController();
        user && fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [user])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['mb01']) return <Navigate to={'/' + paths[0]} />

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
            render: (_, record: IEmployee) => <Action
                title='Employee'
                name={record.employee_name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => navigate('/team/edit/' + record.id + '/profile')}
                hasDelete
            />,
            width: 200
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<Employee201Res>(MYTEAMS.PROFILE.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.DELETE, id)
            .finally(fetchData)
    }

    return (
        <>
            <MainHeader>
                <h1 className='color-white'>My Team</h1>
            </MainHeader>
            <TabHeader
                handleSearch={handleSearch}
            />
            <Table loading={loading} tableParams={tableParams} columns={columns} dataList={data} onChange={onChange} />
        </>
    )
}
