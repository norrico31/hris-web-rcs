import { useState, useEffect } from 'react'
import { Form as AntDForm, Input, Space, Button, TimePicker, Row, Col } from 'antd'
import { ColumnsType } from "antd/es/table"
import Modal from 'antd/es/modal/Modal'
import dayjs from 'dayjs'
import { Action, TabHeader, Table, Form, Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { renderTitle } from '../../shared/utils/utilities'

interface ISchedule extends Partial<{ id: string }> {
    name: string
    time_in: string
    time_out: string
    status: string
    description?: string
}

export default function Schedule() {
    renderTitle('Schedule')
    const employeeId = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ISchedule | undefined>(undefined)

    const columns: ColumnsType<ISchedule> = [
        {
            title: 'Schedule Name',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Time In',
            key: 'time_in',
            dataIndex: 'time_in',
        },
        {
            title: 'Time Out',
            key: 'time_out',
            dataIndex: 'time_out',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
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
            render: (_, record: ISchedule) => <Action
                title='Schedule'
                name={record.name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ISchedule[] = [
        {
            id: '1',
            name: 'John Brown',
            time_in: 'Time In Shit',
            time_out: 'Time Out Shit',
            status: 'tulala',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '2',
            name: 'John Brown',
            time_in: 'Time In Shit',
            time_out: 'Time Out Shit',
            status: 'tulala',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '3',
            name: 'John Brown',
            time_in: 'Time In Shit',
            time_out: 'Time Out Shit',
            status: 'tulala',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '4',
            name: 'John Brown',
            time_in: 'Time In Shit',
            time_out: 'Time Out Shit',
            status: 'tulala',
            description: 'Sydney No. 1 Lake Park',
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }


    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ISchedule) {
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
        <Card title='Schedule'>
            <TabHeader
                name='Schedule'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table loading={false} columns={columns} dataList={data} />
            <ScheduleModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ISchedule
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function ScheduleModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ISchedule>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                // date: dayjs(selectedData.date, 'YYYY/MM/DD') as any
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ISchedule) {
        // if success
        let { description, ...restProps } = values
        // date = dayjs(date, 'YYYY/MM/DD') as any
        restProps = { ...restProps, ...(description != undefined && { description }) } as any
        console.log(restProps)
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Schedule`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} initialValues={{ time_in: dayjs('08:00:00', 'HH:mm:ss'), time_out: dayjs('05:00:00', 'HH:mm:ss') }}>
            <FormItem
                label="Schedule Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter schedule name!' }]}
            >
                <Input placeholder='Enter schedule name...' />
            </FormItem>
            <Row justify='space-between'>
                <Col span={11}>
                    <FormItem
                        label="Time In"
                        name="time_in"
                        required
                        rules={[{ required: true, message: 'Please select time in!' }]}
                    >
                        <TimePicker style={{ width: '100%' }} />
                    </FormItem>
                </Col>
                <Col span={11}>
                    <FormItem
                        label="Time Out"
                        name="time_out"
                        required
                        rules={[{ required: true, message: 'Please select time out!' }]}
                    >
                        <TimePicker style={{ width: '100%' }} />
                    </FormItem>
                </Col>
            </Row>
            <FormItem
                label="Status"
                name="status"
                required
                rules={[{ required: true, message: 'Please status!' }]}
            >
                <Input placeholder='Enter status...' />
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