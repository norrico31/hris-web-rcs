import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import axiosClient, { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { ClientAdjustmentRes, IArguments, IClient, IClientAdjustment, TableParams } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { CLIENTSETTINGS } }] = useEndpoints()

export default function ClientAdjustment() {
    const [data, setData] = useState<IClientAdjustment[]>([])
    const [selectedData, setSelectedData] = useState<IClientAdjustment | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        const controller = new AbortController()
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IClientAdjustment> = [
        {
            title: 'Client Adjustment',
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
            render: (_: any, record: IClientAdjustment) => <Action
                title='Employee Status'
                name={record.branch_name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<ClientAdjustmentRes>(CLIENTSETTINGS.CLIENTADJUSTMENT.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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
        DELETE(CLIENTSETTINGS.CLIENTADJUSTMENT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IClientAdjustment) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Client Adjustment'>
            <TabHeader
                name='client adjustment'
                handleSearchData={() => { }}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
            <ClientAdjustmentModal
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
    selectedData?: IClientAdjustment
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ClientAdjustmentModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IClientAdjustment>()
    const [clients, setClients] = useState<IClient[]>([])

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        axiosClient(CLIENTSETTINGS.CLIENT.DROPDOWN, { signal: controller.signal })
            .then((res) => setClients(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: IClientAdjustment) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(CLIENTSETTINGS.CLIENTADJUSTMENT.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(CLIENTSETTINGS.CLIENTADJUSTMENT.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Client Adjustment`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Client Adjustment"
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
                    {clients.map((client) => (
                        <Select.Option value={client.id} key={client.id} style={{ color: '#777777' }}>{client.name}</Select.Option>
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