import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Switch } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, IExpenseType, ExpenseTypeRes } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { EXPENSESETTINGS } }] = useEndpoints()

export default function ExpenseType() {
    const [data, setData] = useState<IExpenseType[]>([])
    const [selectedData, setSelectedData] = useState<IExpenseType | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IExpenseType> = [
        {
            title: 'Expense Type',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Entry',
            key: 'entry',
            dataIndex: 'entry',
        },
        {
            title: 'Taxable',
            key: 'is_taxable',
            dataIndex: 'is_taxable',
        },
        {
            title: 'For Client Adustment',
            key: 'for_client_adjustment',
            dataIndex: 'for_client_adjustment',
        },
        {
            title: 'Active',
            key: 'is_active',
            dataIndex: 'is_active',
            render: (_, record) => Number(record?.is_active) ? 'ACTIVE' : 'INACTIVE'
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: IExpenseType) => <Action
                title='Employee Status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<ExpenseTypeRes>(EXPENSESETTINGS.EXPENSETYPE.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(EXPENSESETTINGS.EXPENSETYPE.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IExpenseType) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Expense Types'>
            <TabHeader
                name='expense types'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                tableParams={tableParams}
                dataList={data}
                onChange={onChange}
            />
            <ExpenseTypeModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </Card>
    )
}


interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: IExpenseType
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ExpenseTypeModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IExpenseType>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IExpenseType) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EXPENSESETTINGS.EXPENSETYPE.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(EXPENSESETTINGS.EXPENSETYPE.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Expense Type`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Expense Type"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter expense name!' }]}
            >
                <Input placeholder='Enter expense name...' />
            </FormItem>
            <FormItem
                label="Entry"
                name="entry"
                required
                rules={[{ required: true, message: 'Please enter expense entry!' }]}
            >
                <Input placeholder='Enter expense entry...' />
            </FormItem>
            <FormItem
                label="Active"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
            >
                <Switch />
            </FormItem>
            {/* <FormItem
                label="Address"
                name="address"
                required
                rules={[{ required: true, message: 'Please enter address!' }]}
            >
                <Input placeholder='Enter address...' />
            </FormItem>
            <FormItem
                label="Contact Number"
                name="contact_number"
                required
                rules={[{ required: true, message: 'Please enter contact number!' }]}
            >
                <Input type='number' placeholder='Enter contact number...' />
            </FormItem>
            <FormItem
                label="Contact Person"
                name="contact_person"
                required
                rules={[{ required: true, message: 'Please enter contact person!' }]}
            >
                <Input type='text' placeholder='Enter contact person...' />
            </FormItem> */}
            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem>

            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}