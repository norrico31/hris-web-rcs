import { useState, useEffect, ReactNode, useMemo } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Form as AntDForm, Input, DatePicker, Space, Button, Select, Steps, Row, Col, Divider, Skeleton } from 'antd'
import { LoadingOutlined, UserOutlined, CreditCardOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import Modal from 'antd/es/modal/Modal'
import dayjs, { Dayjs } from 'dayjs'
import { Action, TabHeader, Table, Form, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useEndpoints } from './../shared/constants/endpoints'
import axiosClient, { useAxios } from './../shared/lib/axios'
import { IArguments, TableParams, IEmployee, Employee201Res, IClient, IClientBranch, IEmployeeStatus, IPosition, IRole, IDepartment, ISalaryRates, ILineManager, ITeam, IBankDetails, IUser } from '../shared/interfaces'
import useMessage from 'antd/es/message/useMessage'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { ROOTPATHS } from '../shared/constants'
import { useAuthContext } from '../shared/contexts/Auth'
import { TeamModal } from './system-settings/hr-settings/Team'

const [{ EMPLOYEE201, SYSTEMSETTINGS: { CLIENTSETTINGS, HRSETTINGS }, ADMINSETTINGS, MYTEAMS }] = useEndpoints()
const { GET, POST, DELETE } = useAxios()

export default function MyTeam() {
    renderTitle('My Team')
    const navigate = useNavigate()
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IUser[]>([])
    const [selectedData, setSelectedData] = useState<IEmployee | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
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
        // {
        //     title: 'Date Hired',
        //     key: 'date_hired',
        //     dataIndex: 'date_hired',
        //     align: 'center',
        //     width: 110,
        // },
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
            {/* <EmployeeModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            /> */}

        </>
    )
}
