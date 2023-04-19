import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, IClient, ClientRes } from '../../../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { CLIENTSETTINGS } }] = useEndpoints()

export default function Client() {
    const [data, setData] = useState<IClient[]>([])
    const [selectedData, setSelectedData] = useState<IClient | undefined>(undefined)
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

    const columns: ColumnsType<IClient> = [
        {
            title: 'Client',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Address',
            key: 'address',
            dataIndex: 'address',
        },
        {
            title: 'Contact Person',
            key: 'contact_person',
            dataIndex: 'contact_person',
        },
        {
            title: 'Contact Number',
            key: 'contact_number',
            dataIndex: 'contact_number',
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
            render: (_: any, record: IClient) => <Action
                title='Employee Status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<ClientRes>(CLIENTSETTINGS.CLIENT.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(CLIENTSETTINGS.CLIENT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IClient) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Clients'>
            <TabHeader
                name='client'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <ClientModal
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
    selectedData?: IClient
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function ClientModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IClient>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IClient) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(CLIENTSETTINGS.CLIENT.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(CLIENTSETTINGS.CLIENT.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Client`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Client Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter client!' }]}
            >
                <Input placeholder='Enter client...' />
            </FormItem>
            <FormItem
                label="Address"
                name="address"
                required
                rules={[{ required: true, message: 'Please enter address!' }]}
            >
                <Input placeholder='Enter address...' />
            </FormItem>
            <FormItem
                label="Contact Number"
                name="contact_number"
                required
                rules={[{ required: true, message: 'Please enter contact number!' }]}
            >
                <Input type='number' placeholder='Enter contact number...' />
            </FormItem>
            <FormItem
                label="Contact Person"
                name="contact_person"
                required
                rules={[{ required: true, message: 'Please enter contact person!' }]}
            >
                <Input type='text' placeholder='Enter contact person...' />
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