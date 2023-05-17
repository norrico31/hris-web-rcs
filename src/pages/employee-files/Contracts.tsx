import { useState, useEffect } from 'react'
import { Modal, Form as AntDForm, Input, Select, Space, Button, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { Action, Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table, Form } from '../../components'
import { IEmployeeContracts } from '../../shared/interfaces'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'

const [{ EMPLOYEE201 }] = useEndpoints()
const { PUT, DELETE, POST } = useAxios()

// TODO

export default function EmployeeContracts() {
    const { employeeInfo, fetchData } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeContracts | undefined>(undefined)

    const columns: ColumnsType<IEmployeeContracts> = [
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
        },
        {
            title: 'File',
            key: 'file',
            dataIndex: 'file',
        },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
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
            render: (_, record: IEmployeeContracts) => <Action
                title='Activity'
                name={record?.type}
                onConfirm={() => handleDelete(record?.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.CONTRACTS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeContracts) {
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
        <Card title='Contracts'>
            <TabHeader
                name='contracts'
                handleSearch={() => null}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                columns={columns}
                dataList={employeeInfo?.contracts}
                onChange={(evt) => console.log(evt)}
            />
            <ContractsModal
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
    selectedData?: IEmployeeContracts
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function ContractsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const { employeeId, fetchData } = useEmployeeCtx()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

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

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        const formData = new FormData()
        formData.append('id', '')
        formData.append('user_id', employeeId)
        formData.append('type', values?.type)
        formData.append('file', values?.file[0].originFileObj!)
        formData.append('is_active', values?.is_active)
        formData.append('description', values?.description != undefined ? values?.description : null)
        let result = selectedData ? PUT(EMPLOYEE201.CONTRACTS.PUT + employeeId, formData) : POST(EMPLOYEE201.CONTRACTS.POST, formData)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Contract`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Type"
                name="type"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter type...' />
            </Item>
            <Item label="Attachments">
                <Item name="file" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Upload.Dragger name="files" beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                </Item>
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
                    <Button type="primary" htmlType="submit" disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}