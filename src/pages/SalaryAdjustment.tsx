import { useState, useEffect } from "react"
import { Button, Col, DatePicker, Form as AntDForm, Input, Modal, Select, Space } from "antd"
import { ColumnsType } from "antd/es/table"
import { AiOutlineCalendar } from 'react-icons/ai'
import { Action, MainHeader, Table, Form } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import dayjs from "dayjs"

interface ISalaryAdjustment extends Partial<{ id: string }> {
    task_activity: string[]
    task_type: string[]
    sprint_name: string[]
    manhours: string
    date: string
    description: string;
}
export default function SalaryAdjustment() {
    renderTitle('Salary Adjustment')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ISalaryAdjustment | undefined>(undefined)

    const columns: ColumnsType<ISalaryAdjustment> = [
        {
            title: 'Employee Name',
            key: 'employee_name',
            dataIndex: 'employee_name',
        },
        {
            title: 'Adjustment Type',
            key: 'adjustment_type_id',
            dataIndex: 'adjustment_type_id',
        },
        {
            title: 'Adjustment Date',
            key: 'adjustment_date',
            dataIndex: 'adjustment_date',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
            align: 'center',
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
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
            render: (_, record: ISalaryAdjustment) => <Action
                title='Tasks'
                name={record.task_activity[0]}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ISalaryAdjustment[] = [
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

    function handleEdit(data: ISalaryAdjustment) {
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
                <Col>
                    <h1 className='color-white'>Salary Adjustment</h1>
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        Create Adjustment
                        <AiOutlineCalendar />
                    </Button>
                </Col>
            </MainHeader>
            <Table loading={false} columns={columns} dataList={data} />
            <SalaryAdjustmentModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
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
    selectedData?: ISalaryAdjustment
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function SalaryAdjustmentModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ISalaryAdjustment>()

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

    function onFinish(values: ISalaryAdjustment) {
        // if success
        let { date, description, ...restProps } = values
        date = dayjs(date, 'YYYY/MM/DD') as any
        restProps = { ...restProps, date, ...(description != undefined && { description }) } as any
        console.log(restProps)
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Adjustment`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Employee Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter employee name!' }]}
            >
                <Select
                    // defaultValue={defaultVal}
                    placeholder='Select employee'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem
                name='adjustment_type_id'
                label="Adjustment Type"
                required rules={[{ required: true, message: 'Please select adjustment type!' }]}
            >
                <Select
                    // defaultValue={defaultVal}
                    placeholder='Select adjustment type'
                >
                    <Select.Option value="demo">Demo</Select.Option>
                </Select>
            </FormItem>
            <FormItem
                label="Adjustment Date"
                name="adjustment_date"
                required
                rules={[{ required: true, message: 'Please select adjustment date!' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem name='amount' label="Amount" required rules={[{ required: true, message: 'Please enter amount!' }]}>
                <Input type='number' placeholder="Enter amount..." />
            </FormItem>
            <FormItem
                name="remarks"
                label="Remarks"
                required
                rules={[{ required: true, message: 'Please enter remarks!' }]}
            >
                <Input.TextArea placeholder='Enter remarks...' />
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