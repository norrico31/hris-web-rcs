import { useState, useEffect } from 'react'
import { Button, Form as AntDForm, Input, Modal, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Card } from '../../components'
import { TabHeader, Table, Form } from '../../components'

interface ISalaryAdjustmentType {
    id: string;
    name: string;
    description: string;
}

export default function SalaryAdjustmentType() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ISalaryAdjustmentType | undefined>(undefined)

    const columns: ColumnsType<ISalaryAdjustmentType> = [
        {
            title: 'Salary Adjustment Type',
            key: 'salary_name',
            dataIndex: 'salary_name',
        },
        {
            title: 'Entry',
            key: 'entry',
            dataIndex: 'entry',
        },
        {
            title: 'For Client Adjustment',
            key: 'client_adjustment',
            dataIndex: 'client_adjustment',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },

    ];

    const data: ISalaryAdjustmentType[] = []

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
        <Card title='Salary Adjustment Type'>
            <TabHeader
                name='salary adjustments'
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
            <SalaryAdjustmentModal
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
    selectedData?: ISalaryAdjustmentType
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function SalaryAdjustmentModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
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
        // let [start_date, end_date] = date
        // start_date = dayjs(start_date).format('YYYY/MM/DD')
        // end_date = dayjs(end_date).format('YYYY/MM/DD')
        // restProps = { ...restProps, start_date, end_date, ...(description != undefined && { description }) }
        // console.log(restProps)

        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Salary Adjustment Type`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Salary Adjustment Type Name"
                name="salary_name"
                required
                rules={[{ required: true, message: 'Please salary adjustment type name!' }]}
            >
                <Input placeholder='Enter salary adjustment type name...' />
            </Item>
            <Item
                label="Entry"
                name="entry"
                required
                rules={[{ required: true, message: 'Please entry!' }]}
            >
                <Input type='number' placeholder='Enter entry...' />
            </Item>
            <Item
                label="For Client Adjustment"
                name="client_adjustment"
                required
                rules={[{ required: true, message: 'Please for client adjustment!' }]}
            >
                <Input type='number' placeholder='Enter for client adjustment...' />
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