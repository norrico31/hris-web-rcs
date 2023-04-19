import { useState, useEffect } from 'react'
import { Button, Form as AntDForm, Input, Modal, Select, Space, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table, Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeDocument, EmployeeDocumentRes } from '../../shared/interfaces'

const [{ EMPLOYEE201: { EMPLOYEEDOCUMENT } }] = useEndpoints()
const { GET } = useAxios()
// TODO
export default function EmployeeDocuments() {
    const { employeeId } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeDocument | undefined>(undefined)

    const [data, setData] = useState<IEmployeeDocument[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')

    useEffect(() => {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IEmployeeDocument> = [
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
    ]

    function fetchData(args?: IArguments) {
        GET<EmployeeDocumentRes>(EMPLOYEEDOCUMENT.GET + `/${employeeId}`, args?.signal!, { page: args?.page!, search: args?.search! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                    },
                })
            })
    }

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({ search: str, page: 1 })
    }

    function handleDownload() {
        alert('download')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Documents'>
            <TabHeader
                name='employee documents'
                handleSearchData={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={handleDownload}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={(pagination: TablePaginationConfig) => {
                    fetchData({ page: pagination?.current, search })
                }}
            />
            <DocumentsModal
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
    selectedData?: IEmployeeDocument
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function DocumentsModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
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

    return <Modal title={`${title} - Documents`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <Item
                label="Document Type"
                name="document_type"
                required
                rules={[{ required: true, message: 'Please enter document type!' }]}
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
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}