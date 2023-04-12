import { useState, useEffect } from 'react'
import { Modal, Form as AntDForm, Input, Select, Space, Button, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table, Form } from './../../components'
import { IEmployeeContracts } from '../../shared/interfaces'

export default function EmployeeContracts() {
    const { employeeId, employeeInfo } = useEmployeeId()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeContracts | undefined>(undefined)

    const columns: ColumnsType<IEmployeeContracts> = [
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
        },
        {
            title: 'Attachments',
            key: 'attachments',
            dataIndex: 'attachments',
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
    ]

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
        <Card title='Contracts'>
            <TabHeader
                name='contracts'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={employeeInfo?.employee_contracts}
                onChange={(evt) => console.log(evt)}
            />
            <ContractsModal
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
    selectedData?: IEmployeeContracts
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function ContractsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
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

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e
        }
        const len = e?.fileList?.length
        let newFiles: Record<string, any> = {}
        for (let i = 0; i < len; i++) {
            const file = e?.fileList[i]
            newFiles[file.name] = file
        }
        newFiles = Object.values(newFiles)
        return newFiles
    }

    function onFinish(values: Record<string, string>) {
        console.log(values)
        // let { date, description, ...restProps } = values
        // let [start_date, end_date] = date
        // start_date = dayjs(start_date).format('YYYY/MM/DD')
        // end_date = dayjs(end_date).format('YYYY/MM/DD')
        // restProps = { ...restProps, start_date, end_date, ...(description != undefined && { description }) }
        // console.log(restProps)

        // if success
        form.resetFields()
        handleCancel()
    }

    return <Modal title={`${title} - Contract`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Type"
                name="type"
                required
                rules={[{ required: true, message: 'Please enter type!' }]}
            >
                <Input placeholder='Enter type...' />
            </Item>
            <Item label="Attachments">
                <Item name="attachments" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Upload.Dragger name="files" multiple beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                    </Upload.Dragger>
                </Item>
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