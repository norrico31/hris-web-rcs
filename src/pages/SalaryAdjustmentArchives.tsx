import { useState, useEffect, useMemo } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuthContext } from "../shared/contexts/Auth"
import { Button, Col, Space, Skeleton, Popconfirm } from "antd"
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { MainHeader, Table, TabHeader } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import { useAxios } from "../shared/lib/axios"
import { ROOTPATHS, useEndpoints } from "../shared/constants"
import { IArguments, ISalaryAdjustment, SalaryAdjustmentRes, TableParams } from "../shared/interfaces"
import { filterCodes, filterPaths } from "../components/layouts/Sidebar"
import { BiRefresh } from "react-icons/bi"

const { GET } = useAxios()
const [{ SYSTEMSETTINGS: { EXPENSESETTINGS: { EXPENSE } } }] = useEndpoints()

export default function SalaryAdjustmentArchives() {
    renderTitle('Salary Adjustment Archives')
    const { user, loading: loadingUser } = useAuthContext()
    const navigate = useNavigate()
    const [data, setData] = useState<ISalaryAdjustment[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    useEffect(function getData() {
        if (!loadingUser && !codes['h01']) return
        const controller = new AbortController();
        user && fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['h01']) return <Navigate to={'/' + paths[0]} />


    const columns: ColumnsType<ISalaryAdjustment> = [
        {
            title: 'Employee Name',
            key: 'employee_name',
            dataIndex: 'employee_name',
            render: (_, record) => record?.user?.full_name,
            width: 200,
        },
        {
            title: 'Adjustment Type',
            key: 'adjustment_type_id',
            dataIndex: 'adjustment_type_id',
            render: (_, record) => record?.expense_type?.name ?? '-',
            width: 200,
        },
        {
            title: 'Adjustment Date',
            key: 'expense_date',
            dataIndex: 'expense_date',
            width: 200
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
            align: 'center',
            width: 150
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            align: 'center',
            width: 200
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: ISalaryAdjustment) => <Popconfirm
                title={`salary adjustment`}
                description={`Are you sure you want to restore ${record?.expense_type?.name}?`}
                onConfirm={() => {
                    GET(EXPENSE.RESTORE + record?.id)
                        .then((res) => {
                            console.log(res)
                        })
                        .finally(() => {
                            fetchData()
                        })
                }}
                okText="Restore"
                cancelText="Cancel"
            >
                <Button id='restore' type='primary' size='middle' onClick={() => null}>
                    <Space>
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
        GET<SalaryAdjustmentRes>(EXPENSE.GET + '/archives', args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
                <Col>
                    <h1 className='color-white'>Salary Adjustment - Archives</h1>
                </Col>
            </MainHeader>
            <TabHeader handleSearch={handleSearch} >
                <Button onClick={() => navigate('/salaryadjustments')}>Back to salary adjustments</Button>
            </TabHeader>
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
        </>
    )
}