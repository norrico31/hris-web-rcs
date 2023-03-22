import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
interface ITaskActivities {
    id: string;
    name: string;
    description: string;
}

export default function TaskActivities() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ITaskActivities | undefined>(undefined)

    const columns: ColumnsType<ITaskActivities> = [
        {
            title: 'Task Activity Name',
            key: 'name',
            dataIndex: 'name',
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
            render: (_: any, record: ITaskActivities) => <Action
                title='Activity'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ITaskActivities[] = [
        {
            id: '1',
            name: 'John Brown',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '2',
            name: 'Jim Green',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '3',
            name: 'Joe Black',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '4',
            name: 'Disabled User',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '5',
            name: 'John Brown',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '6',
            name: 'Jim Green',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '7',
            name: 'Joe Black',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '8',
            name: 'Disabled User',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '9',
            name: 'John Brown',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '10',
            name: 'Jim Green',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '11',
            name: 'Joe Black',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '12',
            name: 'Disabled User',
            description: 'Sydney No. 1 Lake Park',
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ITaskActivities) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Task Activities'>
            <TabHeader
                name='task activities'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <ActivityModal
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
    selectedData?: ITaskActivities
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function ActivityModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ITaskActivities>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ITaskActivities) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        console.log(restValues)
        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Activity`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Activity Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter activity name!' }]}
            >
                <Input placeholder='Enter activity name...' />
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