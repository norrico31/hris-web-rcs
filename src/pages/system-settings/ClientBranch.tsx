import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../components"

interface IClientBranch {
    id: string;
    name: string;
    client?: any
    description?: string;
}

export default function ClientBranch() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IClientBranch | undefined>(undefined)

    const columns: ColumnsType<IClientBranch> = [
        {
            title: 'Client Branch',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Client',
            key: 'client_name',
            dataIndex: 'client_name',
            render: (_, record) => record.client?.name
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
            render: (_: any, record: IClientBranch) => <Action
                title='Employee Status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: IClientBranch[] = [
        {
            id: '1',
            name: 'BDO',
        },
        {
            id: '2',
            name: 'BPI',
        },
        {
            id: '3',
            name: 'Metro Bank',
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: IClientBranch) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Client Branches'>
            <TabHeader
                name='client branch'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <ClientBranchModal
                title={`${selectedData != undefined ? 'Edit' : 'Create'}`}
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
    selectedData?: IClientBranch
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function ClientBranchModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<IClientBranch>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IClientBranch) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        console.log(restValues)
        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Client Branch`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Client Branch"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter client branch!' }]}
            >
                <Input placeholder='Enter client branch...' />
            </FormItem>

            <FormItem name='client_id' label="Client" required rules={[{ required: true, message: 'Please select client!' }]}>
                <Select
                    placeholder='Select client...'
                    allowClear
                    showSearch
                >
                    <Select.Option value="male">Male</Select.Option>
                    <Select.Option value="female">Female</Select.Option>
                </Select>
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