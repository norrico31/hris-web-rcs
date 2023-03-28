import { useState, useEffect, useRef } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams } from '../../../shared/interfaces'
interface ITaskTypes {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    updated_at: string
}

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { TASKS } }] = useEndpoints()

export default function TaskTypes() {
    const [data, setData] = useState<ITaskTypes[]>([])
    const [selectedData, setSelectedData] = useState<ITaskTypes | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function fetch() {
        let unmount = false;
        !unmount && fetchData()
        return () => {
            unmount = true
        }
    }, [])

    const columns: ColumnsType<ITaskTypes> = [
        {
            title: 'Task Type',
            key: 'name',
            dataIndex: 'name',
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
            render: (_: any, record: ITaskTypes) => <Action
                title='Types'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET(TASKS.TYPES.GET, { page: args?.page!, search: args?.search! })
            .then((res) => {
                setData(res.data.data.data)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res.data.data.total,
                        current: res.data.data.current_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    function handleDelete(id: string) {
        DELETE(TASKS.TYPES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITaskTypes) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Task Types'>
            <TabHeader
                name='task types'
                handleSearchData={(str: string) => {
                    setSearch(str)
                    fetchData({ search: str, page: 1 })
                }}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                onChange={(pagination: TablePaginationConfig) => {
                    fetchData({ page: pagination?.current, search })
                }}
            />
            <TypesModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITaskTypes
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function TypesModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<ITaskTypes>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ITaskTypes) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(TASKS.TYPES.PUT, { ...restValues, id: selectedData.id }) : POST(TASKS.TYPES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Types`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Type Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter types name!' }]}
            >
                <Input placeholder='Enter type name...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input.TextArea placeholder='Enter description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}