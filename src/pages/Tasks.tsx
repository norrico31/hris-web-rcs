import { useState, useEffect } from 'react'
import { Form as AntDForm, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType } from "antd/es/table"
import Modal from 'antd/es/modal/Modal'
import dayjs from 'dayjs'
import { Card, Action, TabHeader, Table, Form, MainHeader } from '../components'

interface ITasks extends Partial<{ id: string }> {
    task_activity: string[]
    task_type: string[]
    sprint_name: string[]
    manhours: string
    date: string
    description: string;
}

export default function Tasks() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ITasks | undefined>(undefined)

    const columns: ColumnsType<ITasks> = [
        {
            title: 'Task Activity',
            key: 'task_activity',
            dataIndex: 'task_activity',
        },
        {
            title: 'Task Type',
            key: 'task_type',
            dataIndex: 'task_type',
        },
        {
            title: 'Sprint',
            key: 'sprint_name',
            dataIndex: 'sprint_name',
        },
        {
            title: 'Manhours',
            key: 'manhours',
            dataIndex: 'manhours',
            align: 'center',
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            align: 'center',
        },
        // {
        //     title: 'Start Date',
        //     key: 'start_date',
        //     dataIndex: 'start_date',
        // },
        // {
        //     title: 'End Date',
        //     key: 'end_date',
        //     dataIndex: 'end_date',
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
            render: (_, record: ITasks) => <Action
                title='Tasks'
                name={record.task_activity[0]}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ITasks[] = [
        {
            id: '1',
            task_activity: ['John Brown', 'John Brown', 'John Brown'],
            task_type: ['John Brown', 'John Brown', 'John Brown'],
            sprint_name: ['John Brown', 'John Brown', 'John Brown'],
            date: '2023/03/20',
            manhours: '7',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '2',
            task_activity: ['Jim Green', 'Jim Green', 'Jim Green'],
            task_type: ['Jim Green', 'Jim Green', 'Jim Green'],
            sprint_name: ['Jim Green', 'Jim Green', 'Jim Green'],
            date: '2023/03/22',
            manhours: '8',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '3',
            task_activity: ['Joe Black', 'Jim Green', 'Jim Green'],
            task_type: ['Joe Black', 'Jim Green', 'Jim Green'],
            sprint_name: ['Joe Black', 'Jim Green', 'Jim Green'],
            date: '2023/03/28',
            manhours: '10',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '4',
            task_activity: ['Disabled User'],
            task_type: ['Disabled User'],
            sprint_name: ['Disabled User'],
            date: '2023/04/09',
            manhours: '7',
            description: 'Sydney No. 1 Lake Park',
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }


    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ITasks) {
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
        <>
            <MainHeader>
                <h1 className='color-white'>Tasks</h1>
            </MainHeader>
            <TabHeader
                name='Tasks'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table loading={false} columns={columns} dataList={data} />
            <TasksModal
                title={`${selectedData != undefined ? 'Edit' : 'Create'}`}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
            />
        </>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITasks
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function TasksModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ITasks>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                date: dayjs(selectedData.date, 'YYYY/MM/DD') as any
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ITasks) {
        // if success
        let { date, description, ...restProps } = values
        date = dayjs(date, 'YYYY/MM/DD') as any
        restProps = { ...restProps, date, ...(description != undefined && { description }) } as any
        console.log(restProps)
        form.resetFields()
        handleCancel()
    }

    const defaultVal = ['Tulala', 'Tulala ulet', 'Tulala mag damag']

    return <Modal title={`${title} - Tasks`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Sprint Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter types name!' }]}
            >
                <Input placeholder='Enter type name...' />
            </FormItem>
            <FormItem
                label="Start and End Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem name='task_activity' label="Task Activity" required rules={[{ required: true, message: 'Please select task activity!' }]}>
                <Select
                    mode='multiple'
                    // defaultValue={defaultVal}
                    placeholder='Select task activity'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem name='task_type' label="Task Type" required rules={[{ required: true, message: 'Please select task type!' }]}>
                <Select
                    mode='multiple'
                    // defaultValue={defaultVal}
                    placeholder='Select task type'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem name='sprint_name' label="Sprint Name" required rules={[{ required: true, message: 'Please select task sprint!' }]}>
                <Select
                    mode='multiple'
                    // defaultValue={defaultVal}
                    placeholder='Select task sprint'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem
                name="manhours"
                label="Manhours"
                required
                rules={[{ required: true, message: 'Please manhours!' }]}
            >
                <Input placeholder='Enter description...' />
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