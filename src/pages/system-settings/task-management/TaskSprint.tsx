import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, DatePicker } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import dayjs from 'dayjs'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { IArguments, TableParams } from '../../../shared/interfaces'
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'

interface ITaskSprint {
    id: string;
    name: string;
    start_date: string
    end_date: string
    description: string;
}

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { TASKS } }] = useEndpoints()

export default function TaskSprint() {
    const [data, setData] = useState<ITaskSprint[]>([])
    const [selectedData, setSelectedData] = useState<ITaskSprint | undefined>(undefined)
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

    const columns: ColumnsType<ITaskSprint> = [
        {
            title: 'Task Sprint',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Start Date',
            key: 'start_date',
            dataIndex: 'start_date',
        },
        {
            title: 'End Date',
            key: 'end_date',
            dataIndex: 'end_date',
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
            render: (_: any, record: ITaskSprint) => <Action
                title='Sprint'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET(TASKS.SPRINT.GET, { page: args?.page!, search: args?.search! })
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
        DELETE(TASKS.SPRINT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITaskSprint) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Task Sprint'>
            <TabHeader
                name='task sprint'
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
            <SprintModal
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
    selectedData?: ITaskSprint
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

function SprintModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<Record<string, any>>()

    useEffect(() => {
        if (selectedData != undefined) {
            let date = [dayjs(selectedData?.start_date, 'YYYY/MM/DD'), dayjs(selectedData?.end_date, 'YYYY/MM/DD')]

            form.setFieldsValue({
                ...selectedData,
                date: date
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: Record<string, string>) {
        let { date, description, ...restValues } = values
        let [start_date, end_date] = date
        start_date = dayjs(start_date).format('YYYY/MM/DD')
        end_date = dayjs(end_date).format('YYYY/MM/DD')
        restValues = { ...restValues, start_date, end_date, ...(description != undefined && { description }) }

        let result = selectedData ? PUT(TASKS.SPRINT.PUT, { ...restValues, id: selectedData.id }) : POST(TASKS.SPRINT.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Sprint`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} >
            <FormItem
                label="Sprint Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter types name!' }]}
            >
                <Input placeholder='Enter type name...' />
            </FormItem>
            <FormItem
                label="Start and End Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker.RangePicker
                    format='YYYY/MM/DD'
                />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input placeholder='Enter description...' />
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