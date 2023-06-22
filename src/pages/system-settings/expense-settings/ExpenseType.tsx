import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Switch, Popconfirm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import useMessage from 'antd/es/message/useMessage'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, IExpenseType, ExpenseTypeRes } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { EXPENSESETTINGS } }] = useEndpoints()

export default function ExpenseType() {
    const [data, setData] = useState<IExpenseType[]>([])
    const [selectedData, setSelectedData] = useState<IExpenseType | undefined>(undefined)
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

    const columns: ColumnsType<IExpenseType> = [
        {
            title: 'Expense Type',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Entry',
            key: 'entry',
            dataIndex: 'entry',
        },
        {
            title: 'Taxable',
            key: 'is_taxable',
            dataIndex: 'is_taxable',
        },
        {
            title: 'For Client Adustment',
            key: 'for_client_adjustment',
            dataIndex: 'for_client_adjustment',
        },
        {
            title: 'Active',
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
            render: (_: any, record: IExpenseType) => !isArchive ? <Action
                title='expense type'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            /> : <Popconfirm
                title={`Restore expense type`}
                description={`Are you sure you want to restore ${record?.name}?`}
                onConfirm={() => {
                    GET(EXPENSESETTINGS.EXPENSETYPE.RESTORE + record?.id)
                        .then((res) => console.log(res))
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
        let url = args?.isArchive ? (EXPENSESETTINGS.EXPENSETYPE.GET + '/archives') : EXPENSESETTINGS.EXPENSETYPE.GET;
        GET<ExpenseTypeRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, isArchive })

    function handleDelete(id: string) {
        DELETE(EXPENSESETTINGS.EXPENSETYPE.DELETE, id)
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

    function handleEdit(data: IExpenseType) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title={`Expense types ${isArchive ? '- Archives' : ''}`}>
            {contextHolder}
            <TabHeader
                handleSearch={setSearch}
                handleCreate={!isArchive ? () => setIsModalOpen(true) : undefined}
                handleModalArchive={!isArchive ? () => setIsArchive(true) : undefined}
            >
                {isArchive ? <Button onClick={() => setIsArchive(false)}>Back to expense types</Button> : null}
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
                    <ExpenseTypeModal
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
    selectedData?: IExpenseType
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ExpenseTypeModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IExpenseType>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IExpenseType) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EXPENSESETTINGS.EXPENSETYPE.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(EXPENSESETTINGS.EXPENSETYPE.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Expense Type`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Expense Type"
                name="name"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter expense name...' />
            </FormItem>
            <FormItem
                label="Entry"
                name="entry"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter expense entry...' />
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