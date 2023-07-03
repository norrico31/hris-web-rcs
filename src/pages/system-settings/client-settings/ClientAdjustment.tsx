import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select, Switch, Popconfirm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import useMessage from 'antd/es/message/useMessage'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import axiosClient, { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { ClientAdjustmentRes, IArguments, IClient, IClientAdjustment, IExpenseType, TableParams } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { CLIENTSETTINGS, EXPENSESETTINGS } }] = useEndpoints()

export default function ClientAdjustment() {
    const [data, setData] = useState<IClientAdjustment[]>([])
    const [selectedData, setSelectedData] = useState<IClientAdjustment | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isArchive, setIsArchive] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const key = 'error'

    useEffect(function () {
        const controller = new AbortController();
        fetchData({
            signal: controller.signal,
            search,
            page: isArchive ? 1 : (tableParams?.pagination?.current ?? 1),
            pageSize: tableParams?.pagination?.pageSize,
            isArchive
        })
        return () => {
            controller.abort()
        }
    }, [isArchive, search])

    const columns: ColumnsType<IClientAdjustment> = [
        {
            title: 'Client Adjustment',
            key: 'name',
            dataIndex: 'name',
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
            render: (_, record) => Number(record?.is_active) ? 'ACTIVE' : 'INACTIVE'
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
            render: (_: any, record: IClientAdjustment) => !isArchive ? <Action
                title='client adjustments'
                name={record.branch_name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            /> : <Popconfirm
                title={`Restore client adjustment`}
                description={`Are you sure you want to restore ${record?.branch_name}?`}
                onConfirm={() => {
                    GET(CLIENTSETTINGS.CLIENTADJUSTMENT.RESTORE + record?.id)
                        .then((res) => res)
                        .finally(() => fetchData({
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize,
                            isArchive
                        }))
                }}
                okText="Restore"
                cancelText="Cancel"
            >
                <Button id='restore' type='primary' size='middle' onClick={() => null}>
                    <Space align='center'>
                        <BiRefresh />
                        Restore
                    </Space>
                </Button>
            </Popconfirm>,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        let url = args?.isArchive ? (CLIENTSETTINGS.CLIENTADJUSTMENT.GET + '/archives') : CLIENTSETTINGS.CLIENTADJUSTMENT.GET;
        GET<ClientAdjustmentRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, isArchive })

    function handleDelete(id: string) {
        DELETE(CLIENTSETTINGS.CLIENTADJUSTMENT.DELETE, id)
            .catch((err) => {
                messageApi.open({
                    key,
                    type: 'error',
                    content: err?.response?.data?.message,
                    duration: 3
                })
            })
            .finally(() => fetchData({
                search,
                page: tableParams?.pagination?.current ?? 1,
                pageSize: tableParams?.pagination?.pageSize,
                isArchive
            }))
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
        <Card title={`Client Branches ${isArchive ? '- Archives' : ''}`}>
            {contextHolder}
            <TabHeader
                handleSearch={setSearch}
                handleCreate={!isArchive ? () => setIsModalOpen(true) : undefined}
                handleModalArchive={!isArchive ? () => setIsArchive(true) : undefined}
            >
                {isArchive ? <Button onClick={() => setIsArchive(false)}>Back to client adjustments</Button> : null}
            </TabHeader>
            {!isArchive ? (
                <>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataList={data}
                        tableParams={tableParams}
                        onChange={onChange}
                    />
                    <ClientAdjustmentModal
                        title={selectedData != undefined ? 'Update' : 'Create'}
                        selectedData={selectedData}
                        isModalOpen={isModalOpen}
                        handleCancel={handleCloseModal}
                        fetchData={fetchData}
                    />
                </>
            ) : (<Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />)}
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
    const [lists, setLists] = useState<{ clients: IClient[]; expenseTypes: IExpenseType[] }>({ clients: [], expenseTypes: [] })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData?.is_active) })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        const clientPromise = axiosClient(CLIENTSETTINGS.CLIENT.LISTS, { signal: controller.signal })
        const expenseTypePromise = axiosClient(EXPENSESETTINGS.EXPENSETYPE.LISTS, { signal: controller.signal })
        Promise.allSettled([clientPromise, expenseTypePromise])
            .then(([clientRes, expenseRes]: any) => {
                setLists({
                    ...lists,
                    clients: clientRes?.status == 'fulfilled' ? clientRes?.value.data : [],
                    expenseTypes: expenseRes?.status == 'fulfilled' ? expenseRes?.value.data : []
                })
            });
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: IClientAdjustment) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(CLIENTSETTINGS.CLIENTADJUSTMENT.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(CLIENTSETTINGS.CLIENTADJUSTMENT.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Client Adjustment`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Client Adjustment"
                name="name"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter client branch adjustment name...' />
            </FormItem>
            <FormItem name='client_id' label="Client" required rules={[{ required: true, message: 'Required' }]}>
                <Select
                    placeholder='Select client...'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                >
                    {lists.clients?.map((client) => (
                        <Select.Option value={client.id} key={client.id} style={{ color: '#777777' }}>{client.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem name='expense_type_id' label="Expense Type" required rules={[{ required: true, message: 'Required' }]}>
                <Select
                    placeholder='Select expense type...'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                >
                    {lists.expenseTypes?.map((expense) => (
                        <Select.Option value={expense.id} key={expense.id} style={{ color: '#777777' }}>{expense.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem
                label="Active"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
            >
                <Switch />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter Description...' />
            </FormItem>

            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}