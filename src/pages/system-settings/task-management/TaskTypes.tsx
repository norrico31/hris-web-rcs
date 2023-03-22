import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
interface ITaskTypes {
    id: string;
    name: string;
    description: string;
}

export default function TaskTypes() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ITaskTypes | undefined>(undefined)

    const columns: ColumnsType<ITaskTypes> = [
        {
            title: 'Task Type',
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
            render: (_: any, record: ITaskTypes) => <Action
                title='Types'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ITaskTypes[] = [
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
        console.log(search)
    }

    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ITaskTypes) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Task Types'>
            <TabHeader
                name='task types'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table loading={false} columns={columns} dataList={data} />
            <TypesModal title={`${selectedData != undefined ? 'Edit' : 'Create'}`} selectedData={selectedData} isModalOpen={isModalOpen} handleCancel={handleCloseModal} />
        </Card>
    )
}


type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITaskTypes
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function TypesModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ITaskTypes>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ITaskTypes) {
        console.log(values)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        console.log(restValues)
        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Types`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Type Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter types name!' }]}
            >
                <Input placeholder='Enter type name...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input.TextArea placeholder='Enter description...' />
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