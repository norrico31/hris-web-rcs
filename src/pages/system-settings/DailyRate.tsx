import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../components"

interface IDailyRate {
    id: string;
    name: string;
    bank_branch: string
    description?: string;
}

export default function DailyRate() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IDailyRate | undefined>(undefined)

    const columns: ColumnsType<IDailyRate> = [
        {
            title: 'Daily Rate Code',
            key: 'code',
            dataIndex: 'code',
        },
        {
            title: 'Daily Rate Name',
            key: 'bank_branch',
            dataIndex: 'bank_branch',
        },
        {
            title: 'Daily rate per Hour',
            key: 'rate_per_hour',
            dataIndex: 'rate_per_hour',
        },
        {
            title: 'Overtime Rate per Hour',
            key: 'overtime_rate',
            dataIndex: 'overtime_rate',
        },
        {
            title: 'Night Differential Overtime Rate per Hour',
            key: 'night_overtime_rate',
            dataIndex: 'night_overtime_rate',
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
            render: (_: any, record: IDailyRate) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: IDailyRate[] = [
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

    function handleEdit(data: IDailyRate) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Daily Rates'>
            <TabHeader
                name='daily rate'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <DailyRateModal
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
    selectedData?: IDailyRate
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function DailyRateModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<IDailyRate>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IDailyRate) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        console.log(restValues)
        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Daily Rate`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Daily Rate Code"
                name="code"
                required
                rules={[{ required: true, message: 'Please enter code!' }]}
            >
                <Input placeholder='Enter code...' />
            </FormItem>
            <FormItem
                label="Daily Rate Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter daily rate name!' }]}
            >
                <Input placeholder='Enter daily rate name...' />
            </FormItem>

            <FormItem
                name="Daily rate per Hour"
                label="rate"
            >
                <Input type='number' placeholder='Enter rate...' />
            </FormItem>
            <FormItem
                name="Overtime Rate per Hour"
                label="overtime"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                name="Night Differential Overtime Rate per Hour"
                label="overtime"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input.TextArea placeholder='Enter Description...' />
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