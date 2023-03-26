import { useState, useEffect } from 'react'
import { Button, Form as AntDForm, Input, Modal, Select, Space, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table, Form } from './../../components';

interface IMemorandums {
    id: string;
    name: string;
    description: string;
}
export default function Memorandums() {
    const employeeId = useEmployeeId()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IMemorandums | undefined>(undefined)

    const columns: ColumnsType<IMemorandums> = [
        {
            title: 'Document Type',
            key: 'document_type',
            dataIndex: 'document_type',
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

    ];

    const data: IMemorandums[] = []

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
        <Card title='Memorandums'>
            <TabHeader
                name='memorandums'
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
            <MemorandumModal
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
    selectedData?: IMemorandums
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function MemorandumModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
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

    return <Modal title={`${title} - Memorandum`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Type"
                name="type"
                required
                rules={[{ required: true, message: 'Please enter type!' }]}
            >
                <Input placeholder='Enter document type...' />
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