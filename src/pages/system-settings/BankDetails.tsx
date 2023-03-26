import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../components"

interface IBankDetails {
    id: string;
    name: string;
    bank_branch: string
    description?: string;
}

export default function BankDetails() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IBankDetails | undefined>(undefined)

    const columns: ColumnsType<IBankDetails> = [
        {
            title: 'Bank Name',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Bank Branch',
            key: 'bank_branch',
            dataIndex: 'bank_branch',
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
            render: (_: any, record: IBankDetails) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: IBankDetails[] = [
        {
            id: '1',
            name: 'BDO',
            bank_branch: 'Santa Rosa'
        },
        {
            id: '2',
            name: 'BPI',
            bank_branch: 'Santa Rosa'
        },
        {
            id: '3',
            name: 'Metro Bank',
            bank_branch: 'Santa Rosa'
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: IBankDetails) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Bank Details'>
            <TabHeader
                name='bank details'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <BankDetailsModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
            />
        </Card>
    )
}


interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: IBankDetails
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function BankDetailsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<IBankDetails>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IBankDetails) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        console.log(restValues)
        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Bank Details`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Bank Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter bank name!' }]}
            >
                <Input placeholder='Enter bank name...' />
            </FormItem>
            <FormItem
                label="Bank Branch"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter bank branch!' }]}
            >
                <Input placeholder='Enter bank branch...' />
            </FormItem>

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
                    <Button type="primary" htmlType="submit" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}