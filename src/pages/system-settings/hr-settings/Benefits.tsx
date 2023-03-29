import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs'
import { Card } from '../../../components'
import { TabHeader, Table, Form } from '../../../components'

interface IBenefits {
    id: string;
    name: string;
    description: string;
}

export default function Benefits() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IBenefits | undefined>(undefined)

    const columns: ColumnsType<IBenefits> = [
        {
            title: 'Benefit',
            key: 'benefit',
            dataIndex: 'benefit',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
        },
        {
            title: 'Schedule',
            key: 'schedule',
            dataIndex: 'schedule',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },

    ];

    const data: IBenefits[] = []

    function fetchData(search: string) {
        console.log(search)
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
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <BenefitsModal
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
    selectedData?: IBenefits
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function BenefitsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
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
        let { date, description, ...restProps } = values
        let [start_date, end_date] = date
        start_date = dayjs(start_date).format('YYYY/MM/DD')
        end_date = dayjs(end_date).format('YYYY/MM/DD')
        restProps = { ...restProps, start_date, end_date, ...(description != undefined && { description }) }
        console.log(restProps)

        // if success
        form.resetFields()
        handleCancel()
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
            <Item
                label="Start and End Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    style={{ width: '100%' }}
                    format='YYYY/MM/DD'
                />
            </Item>
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
                    <Button type="primary" htmlType="submit" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}