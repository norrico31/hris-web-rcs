import { useState, useEffect } from 'react'
import {  Space, Button, Input, Form, DatePicker } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import dayjs from 'dayjs'
import { Action, Table, Card, TabHeader } from "../../../components"

interface ITaskSprint {
    id: string;
    name: string;
    start_date: string
    end_date: string
    description: string;
}

export default function TaskSprint() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ITaskSprint | undefined>(undefined)

    const columns: ColumnsType<ITaskSprint> = [
        {
            title: 'Task Sprint',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Start Date',
            key: 'start_date',
            dataIndex: 'start_date',
        },
        {
            title: 'End Date',
            key: 'end_date',
            dataIndex: 'end_date',
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
            render: (_: any, record: ITaskSprint) => <Action
                title='Sprint'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ITaskSprint[] = [
        {
            id: '1',
            name: 'John Brown',
            start_date: '2023/03/20',
            end_date: '2023/03/23',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '2',
            name: 'Jim Green',
            start_date: '2023/03/22',
            end_date: '2023/03/25',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '3',
            name: 'Joe Black',
            start_date: '2023/03/25',
            end_date: '2023/03/28',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '4',
            name: 'Disabled User',
            start_date: '',
            end_date: '',
            description: 'Sydney No. 1 Lake Park',
        },
    ]

    function fetchData(search: string) {

    }


    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ITaskSprint) {
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
        <Card title='Task Sprint'>
            <TabHeader
                name='task sprint'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table loading={false} columns={columns} dataList={data} />
            <SprintModal title={`${selectedData != undefined ? 'Edit' : 'Create'}`} selectedData={selectedData} isModalOpen={isModalOpen} handleCancel={handleCloseModal} />
        </Card>
    )
}


type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITaskSprint
    handleCancel: () => void
}

function SprintModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = Form.useForm()

    useEffect(() => {
        if (selectedData != undefined) {
            let date = [dayjs(selectedData?.start_date, 'YYYY/MM/DD'), dayjs(selectedData?.end_date, 'YYYY/MM/DD')]

            form.setFieldsValue({
                ...selectedData,
                date
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: any) {
        let { date, ...restProps } = values
        let [start_date, end_date] = date
        start_date = dayjs(start_date).format('YYYY/MM/DD')
        end_date = dayjs(end_date).format('YYYY/MM/DD')
        restProps = { ...restProps, start_date, end_date, description: restProps.description == undefined ? null : restProps.description }
        console.log(restProps)
        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Sprint`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
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
                label="Sprint Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter types name!' }]}
            >
                <Input placeholder='Enter type name...' />
            </Form.Item>

            <Form.Item
                label="Start and End Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker.RangePicker
                    format='YYYY/MM/DD'
                />
            </Form.Item>


            <Form.Item
                name="description"
                label="Description"
            >
                <Input placeholder='Enter description...' />
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