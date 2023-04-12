import { useState, useEffect } from 'react'
import { Button, Form as AntDForm, Input, Modal, Select, Space, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table, Form } from './../../components'
import { IArguments, TableParams, IEmployeeEvaluation } from '../../shared/interfaces'
import { useEndpoints } from './../../shared/constants/endpoints'
import { useAxios } from '../../shared/lib/axios'

const [{ EMPLOYEE201: { EVALUATION } }] = useEndpoints()
const { GET } = useAxios()

export default function Evaluations() {
    const { employeeId, employeeInfo } = useEmployeeId()
    const [data, setData] = useState<IEmployeeEvaluation[]>([])
    const [selectedData, setSelectedData] = useState<IEmployeeEvaluation | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const columns: ColumnsType<IEmployeeEvaluation> = [
        {
            title: 'Copy',
            key: 'copy',
            dataIndex: 'copy',
        },
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

    const handleSearch = (str: string) => {
        setSearch(str)
        // fetchData({ search: str, page: 1 })
    }

    function handleDownload() {
        alert('download')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Evaluations'>
            <TabHeader
                name='evaluations'
                handleSearchData={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={employeeInfo?.evaluations ?? []}
                onChange={(evt) => console.log(evt)}
            />
            <EvaluationsModal
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
    selectedData?: IEmployeeEvaluation
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function EvaluationsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
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

    return <Modal title={`${title} - Evaluation`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Copy"
                name="copy"
                required
                rules={[{ required: true, message: 'Please enter copy!' }]}
            >
                <Input placeholder='Enter copy...' />
            </Item>
            <Item
                label="Type"
                name="type"
                required
                rules={[{ required: true, message: 'Please select type!' }]}
            >
                <Select
                    placeholder='Select type...'
                >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
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