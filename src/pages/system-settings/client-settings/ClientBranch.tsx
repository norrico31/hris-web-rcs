import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import axiosClient, { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { ClientBranchRes, IArguments, IClient, IClientBranch, TableParams } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { CLIENTSETTINGS } }] = useEndpoints()

export default function ClientBranch() {
    const [data, setData] = useState<IClientBranch[]>([])
    const [selectedData, setSelectedData] = useState<IClientBranch | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IClientBranch> = [
        {
            title: 'Client Branch',
            key: 'branch_name',
            dataIndex: 'branch_name',
        },
        {
            title: 'Client',
            key: 'client_name',
            dataIndex: 'client_name',
            render: (_, record) => record.client?.name
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
            render: (_: any, record: IClientBranch) => <Action
                title='Employee Status'
                name={record.branch_name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<ClientBranchRes>(CLIENTSETTINGS.CLIENTBRANCH.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            })
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
        DELETE(CLIENTSETTINGS.CLIENTBRANCH.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IClientBranch) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Client Branches'>
            <TabHeader
                name='client branch'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <ClientBranchModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </Card>
    )
}


interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: IClientBranch
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ClientBranchModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IClientBranch>()
    const [clients, setClients] = useState<IClient[]>([])

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        axiosClient(CLIENTSETTINGS.CLIENT.LISTS, { signal: controller.signal })
            .then((res) => setClients(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: IClientBranch) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(CLIENTSETTINGS.CLIENTBRANCH.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(CLIENTSETTINGS.CLIENTBRANCH.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Client Branch`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Client Branch"
                name="branch_name"
                required
                rules={[{ required: true, message: 'Please enter client branch!' }]}
            >
                <Input placeholder='Enter client branch...' />
            </FormItem>

            <FormItem name='client_id' label="Client" required rules={[{ required: true, message: 'Please select client!' }]}>
                <Select
                    placeholder='Select client...'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                >
                    {clients.map((team) => (
                        <Select.Option value={team.id} key={team.id} style={{ color: '#777777' }}>{team.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>

            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem>

            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}