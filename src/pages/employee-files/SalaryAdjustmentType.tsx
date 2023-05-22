import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs'
import { Action, Card, Form, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { ExpenseRes, IArguments, IBenefits, IExpense, TableParams } from '../../shared/interfaces'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'

const [{ EMPLOYEE201, SYSTEMSETTINGS }] = useEndpoints()
const { GET, PUT, DELETE, POST } = useAxios()

export default function SalaryAdjustmentTyp() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IExpense | undefined>(undefined)
    const [data, setData] = useState<IExpense[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IExpense> = [
        {
            title: 'Expense',
            key: 'name',
            dataIndex: 'name',
            // render: (_, record) => record?.benefit.name
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
        },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<ExpenseRes>(EMPLOYEE201.EXPENSE.GET + employeeId, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        <Card title='Salary Adjustment Type'>
            <TabHeader
                handleSearch={handleSearch}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                onChange={onChange}
            />
            {/* <SalaryAdjustmentTypModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            /> */}
        </Card>
    )
}