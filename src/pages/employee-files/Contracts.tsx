import { useState, useEffect } from 'react'
import { Modal, Form as AntDForm, Input, Select, Space, Button, Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import useMessage from 'antd/es/message/useMessage';
import { Action, Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table, Form } from '../../components'
import { EmployeeContractsRes, IArguments, IEmployeeContracts, TableParams } from '../../shared/interfaces'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'

const [{ EMPLOYEE201 }] = useEndpoints()
const { PUT, DELETE, POST, GET } = useAxios()

export default function EmployeeContracts() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeContracts | undefined>(undefined)
    const [data, setData] = useState<IEmployeeContracts[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

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
            render: (_, record) => {
                // TODO DISPLAY FILE IN MODAL AND DOWNLAD
                return <Button type='link'>Download File</Button>
            }
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

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<EmployeeContractsRes>(EMPLOYEE201.CONTRACTS.GET + '?user_id=' + employeeId, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                        pageSize: res?.per_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.CONTRACTS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeContracts) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Contracts'>
            <TabHeader
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />

            <Table
                loading={loading}
                tableParams={tableParams}
                columns={columns}
                dataList={data}
                onChange={onChange}
            />
            <ContractsModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                employeeId={employeeId}
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
    selectedData?: IEmployeeContracts
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: Item, useForm } = AntDForm

function ContractsModal({ title, employeeId, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
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

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        if (!values.file && !selectedData) {
            messageApi.open({
                type: 'error',
                content: 'Please upload attachment',
                duration: 5
            })
            setLoading(false);
            return
        }
        const formData = new FormData()
        if (selectedData?.id) formData.append('_method', 'PUT')
        formData.append('user_id', employeeId)
        formData.append('type', values?.type)
        formData.append('file', values?.file ? values?.file[0].originFileObj : '')
        formData.append('is_active', values?.is_active)
        formData.append('description', (values?.description == undefined || values?.description === null) ? '' : values?.description)
        const editUrl = selectedData != undefined ? EMPLOYEE201.CONTRACTS.PUT + selectedData?.id : EMPLOYEE201.CONTRACTS.PUT + employeeId
        let result = selectedData ? POST(editUrl, formData) : POST(EMPLOYEE201.CONTRACTS.POST, formData)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Contract`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Type"
                name="type"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter type...' />
            </Item>
            <Item label="File">
                <Item name="file" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Upload listType="picture-card" beforeUpload={() => false}>
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Upload>
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