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
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
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
                handleSearchData={() => null}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
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
    const { employeeId, fetchData } = useEmployeeCtx()

    useEffect(() => {
        if (selectedData != undefined) {
            // let date = [dayjs(selectedData?.start_date, 'YYYY/MM/DD'), dayjs(selectedData?.end_date, 'YYYY/MM/DD')]

            form.setFieldsValue({
                ...selectedData,
                // date: date
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

    function onFinish(values: Record<string, string>) {
        // let { date, description, ...restProps } = values
        // let [start_date, end_date] = date
        // start_date = dayjs(start_date).format('YYYY/MM/DD')
        // end_date = dayjs(end_date).format('YYYY/MM/DD')
        // restProps = { ...restProps, start_date, end_date, ...(description != undefined && { description }) }
        // console.log(restProps)
        let { date, description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EMPLOYEE201.CONTRACTS.PUT + employeeId, { ...restValues, id: selectedData.id }) : POST(EMPLOYEE201.CONTRACTS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
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
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}