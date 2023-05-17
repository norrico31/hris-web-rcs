import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs'
import { Action, Card, Form, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { IBenefits, IEmployeeBenefits } from '../../shared/interfaces'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'

const [{ EMPLOYEE201, SYSTEMSETTINGS }] = useEndpoints()
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
            key: 'amount',
            dataIndex: 'amount',
        },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
        },
        // {
        //     title: 'Description',
        //     key: 'description',
        //     dataIndex: 'description',
        // },
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
                handleSearch={() => null}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={employeeInfo?.employee_benefits}
                onChange={(evt) => console.log(evt)}
            />
            <EmployeeBenefitsModal
                title={selectedData != undefined ? 'Update' : 'Create'}
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
    const [lists, setLists] = useState<IBenefits[]>([])

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
            })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController();
        axiosClient(SYSTEMSETTINGS.HRSETTINGS.BENEFITS.LISTS, { signal: controller.signal })
            .then((res) => {
                setLists(res?.data ?? [])
            })

        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: Record<string, string>) {
        let { date, description, ...restValues } = values
        // restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EMPLOYEE201.BENEFITS.PUT + employeeId, { ...restValues, id: selectedData.id, user_id: employeeId }) : POST(EMPLOYEE201.BENEFITS.POST, { ...restValues, user_id: employeeId })
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Benefit`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Benefit"
                name="benefit_id"
                required
                rules={[{ required: true, message: '' }]}
            ><Select
                placeholder='Select Benefit'
                allowClear
                showSearch
                optionFilterProp="children"
            >
                    {lists.map((benefit) => (
                        <Select.Option value={benefit.id} key={benefit.id}>{benefit.name}</Select.Option>
                    ))}
                </Select>
            </Item>
            <Item
                label="Amount"
                name="amount"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input type='number' placeholder='Enter amount...' />
            </Item>
            <Item
                label="Status"
                name="is_active"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select
                    placeholder='Select status...'
                >
                    <Select.Option value="activate">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
            </Item>
            <Item style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}