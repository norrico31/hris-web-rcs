import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
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
            render: (_: any, record: IExpenseType) => <Action
                title='Employee Status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<ExpenseTypeRes>(EXPENSESETTINGS.EXPENSETYPE.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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
            })
    }

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
                handleSearchData={() => { }}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <ExpenseTypeModal
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
    selectedData?: IExpenseType
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ExpenseTypeModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IExpenseType>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IExpenseType) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EXPENSESETTINGS.EXPENSETYPE.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(EXPENSESETTINGS.EXPENSETYPE.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Expense Type`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Expense Type"
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