import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, IExpense, ExpenseRes } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { EXPENSESETTINGS } }] = useEndpoints()

export default function Expense() {
    const [data, setData] = useState<IExpense[]>([])
    const [selectedData, setSelectedData] = useState<IExpense | undefined>(undefined)
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

    const columns: ColumnsType<IExpense> = [
        {
            title: 'Expense Name',
            key: 'name',
            dataIndex: 'name',
        },
        // {
        //     title: 'Address',
        //     key: 'address',
        //     dataIndex: 'address',
        // },
        // {
        //     title: 'Contact Person',
        //     key: 'contact_person',
        //     dataIndex: 'contact_person',
        // },
        // {
        //     title: 'Contact Number',
        //     key: 'contact_number',
        //     dataIndex: 'contact_number',
        // },
        // {
        //     title: 'Status',
        //     key: 'status',
        //     dataIndex: 'status',
        // },
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
            render: (_: any, record: IExpense) => <Action
                title='Employee Status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<ExpenseRes>(EXPENSESETTINGS.EXPENSE.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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

    function handleDelete(id: string) {
        DELETE(EXPENSESETTINGS.EXPENSE.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IExpense) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Expenses'>
            <TabHeader
                name='client'
                handleSearchData={() => { }}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <ExpenseModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
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
    selectedData?: IExpense
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ExpenseModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IExpense>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IExpense) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EXPENSESETTINGS.EXPENSE.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(EXPENSESETTINGS.EXPENSE.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Expense`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Expense Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter expense name!' }]}
            >
                <Input placeholder='Enter expense name...' />
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
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}