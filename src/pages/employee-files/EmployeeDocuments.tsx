import { useState, useEffect } from 'react'
import { Button, Form as AntDForm, Input, Modal, Select, Space, Upload } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import useMessage from 'antd/es/message/useMessage'
import { Action, Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table, Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeDocument, EmployeeDocumentRes } from '../../shared/interfaces'
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';

const [{ EMPLOYEE201: { EMPLOYEEDOCUMENT } }] = useEndpoints()
const { GET, POST, DELETE } = useAxios()

export default function EmployeeDocuments() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeDocument | undefined>(undefined)
    const [data, setData] = useState<IEmployeeDocument[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

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
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
        },
        {
            title: 'Description',
            key: 'document_description',
            dataIndex: 'document_description',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IEmployeeDocument) => <Action
                title='Tasks'
                name={record?.name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<EmployeeDocumentRes>(EMPLOYEEDOCUMENT.GET + `?user_id=${employeeId}`, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            }).finally(() => setLoading(false))
    }

    function handleDelete(id: string) {
        DELETE(EMPLOYEEDOCUMENT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeDocument) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({ search: str, page: 1 })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Documents'>
            <TabHeader
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <DocumentsModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                employeeId={employeeId}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    employeeId: string
    isModalOpen: boolean
    selectedData?: IEmployeeDocument
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function DocumentsModal({ title, employeeId, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()

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

    function handleDownload() {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = EMPLOYEEDOCUMENT.DOWNLOAD + `${selectedData?.id}`; // Replace 'your_file_url' with the actual file URL or data URL
        link.target = '_blank';

        // Trigger the download
        link.click();
    }

    function onFinish(values: Record<string, any>) {
        setLoading(true);
        if (!values.file && !selectedData) {
            messageApi.open({
                type: 'error',
                content: 'Please upload attachment',
                duration: 5
            })
            setLoading(false);
            return
        }
        const formData = new FormData();
        if (selectedData?.id) formData.append('_method', 'PUT');
        formData.append('user_id', employeeId);
        formData.append('document_type', values?.document_type);

        if (values?.file && values?.file.length > 0) {
            const file = values?.file[0];
            const originFileObj = file?.originFileObj;
            formData.append('file', originFileObj ? originFileObj : '');
            // Perform further actions or submit the form here
        }
        formData.append('is_active', values?.is_active)
        formData.append('document_description', (values?.document_description == undefined || values?.document_description === null) ? '' : values?.document_description)
        const editUrl = selectedData != undefined ? EMPLOYEEDOCUMENT.PUT + selectedData?.id : EMPLOYEEDOCUMENT.PUT + employeeId
        let result = selectedData ? POST(editUrl, formData) : POST(EMPLOYEEDOCUMENT.POST, formData)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Documents`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Document Type"
                name="document_type"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter document type...' />
            </Item>
            <Item label="File">
                <Item name="file" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Upload.Dragger name="files" beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                </Item>
            </Item>
            {selectedData && selectedData.file_name && (
                <Item>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ marginBottom: 8 }}>Download</span>
                            <a href={selectedData.file_name} onClick={(e) => { e.preventDefault(); handleDownload(); }}>
                                {selectedData.file_name}
                            </a>
                        </div>
                    </div>
                </Item>
            )}
            <Item
                label="Status"
                name="is_active"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Select
                    placeholder='Select status...'
                >
                    <Select.Option value="ACTIVE">Active</Select.Option>
                    <Select.Option value="INACTIVE">Inactive</Select.Option>
                </Select>
            </Item>
            <Item
                name="document_description"
                label="Description"
            >
                <Input placeholder='Enter description...' />
            </Item>
            <Item style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}