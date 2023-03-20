import { useState, useEffect } from 'react'
import { Row, Col, Space, Button, Input, Divider as AntDDivider, Form } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader } from "../../../components"
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
    ]

    function fetchData(search: string) {

    }

    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ITaskActivities) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleDownload() {
        console.log('dowwnload')
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
                handleDownload={() => handleDownload()}
            />
            <Table loading={false} columns={columns} dataList={data} />
            <ActivityModal title={`${selectedData != undefined ? 'Edit' : 'Create'}`} selectedData={selectedData} isModalOpen={isModalOpen} handleCancel={handleCloseModal} />
        </Card>
    )
}


type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITaskActivities
    handleCancel: () => void
}

function ActivityModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = Form.useForm<ITaskActivities>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ITaskActivities) {
        console.log(values)

        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Activity`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 24 }}
            onFinish={onFinish}
            autoComplete="off"
            requiredMark='optional'
            layout='vertical'
        >
            <Form.Item
                label="Activity Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter activity name!' }]}
            >
                <Input placeholder='Enter activity name...' />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    </Modal>
}