import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs'
import { Action, Card, Form, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { IEmployeeBenefits } from '../../shared/interfaces'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'

const [{ EMPLOYEE201 }] = useEndpoints()
const { PUT, DELETE, POST } = useAxios()
// TODO
export default function EmployeeBenefits() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeBenefits | undefined>(undefined)



    const columns: ColumnsType<IEmployeeBenefits> = [
        {
            title: 'Benefit',
            key: 'benefit',
            dataIndex: 'benefit',
            render: (_, record) => record?.benefit.name
        },
        {
            title: 'Amount',
            key: 'benefit_amount',
            dataIndex: 'benefit_amount',
        },
        {
            title: 'Schedule',
            key: 'benefit_schedule',
            dataIndex: 'benefit_schedule',
        },
        {
            title: 'Status',
            key: 'benefit_status',
            dataIndex: 'benefit_status',
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
            render: (_, record: IEmployeeBenefits) => <Action
                title='Activity'
                name={record?.benefit.name}
                onConfirm={() => handleDelete(record?.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.BENEFITS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeBenefits) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleDownload() {
        alert('download')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Benefits'>
            <TabHeader
                name='benefits'
                handleSearch={() => null}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                columns={columns}
                dataList={employeeInfo?.employee_benefits}
                onChange={(evt) => console.log(evt)}
            />
            <EmployeeBenefitsModal
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
    selectedData?: IEmployeeBenefits
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function EmployeeBenefitsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const { employeeId, fetchData } = useEmployeeCtx()
    const [form] = useForm<Record<string, any>>()

    // useEffect(() => {
    //     if (selectedData != undefined) {
    //         let date = [dayjs(selectedData?.start_date, 'YYYY/MM/DD'), dayjs(selectedData?.end_date, 'YYYY/MM/DD')]

    //         form.setFieldsValue({
    //             ...selectedData,
    //             date: date
    //         })
    //     } else {
    //         form.resetFields(undefined)
    //     }
    // }, [selectedData])

    function onFinish(values: Record<string, string>) {
        let { date, description, ...restValues } = values
        // let [start_date, end_date] = date
        // start_date = dayjs(start_date).format('YYYY/MM/DD')
        // end_date = dayjs(end_date).format('YYYY/MM/DD')
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EMPLOYEE201.BENEFITS.PUT + employeeId, { ...restValues, id: selectedData.id }) : POST(EMPLOYEE201.BENEFITS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Benefit`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Benefit"
                name="benefit"
                required
                rules={[{ required: true, message: 'Please enter benefit!' }]}
            >
                <Input placeholder='Enter benefit...' />
            </Item>
            <Item
                label="Amount"
                name="amount"
                required
                rules={[{ required: true, message: 'Please amount!' }]}
            >
                <Input type='number' placeholder='Enter amount...' />
            </Item>
            {/* <Item
                label="Start and End Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    style={{ width: '100%' }}
                    format='YYYY/MM/DD'
                />
            </Item> */}
            <Item
                label="Status"
                name="status"
                required
                rules={[{ required: true, message: 'Please select status!' }]}
            >
                <Select
                    placeholder='Select status...'
                >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
            </Item>
            <Item
                name="description"
                label="Description"
            >
                <Input placeholder='Enter description...' />
            </Item>
            <Item style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}