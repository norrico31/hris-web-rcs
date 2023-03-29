import { useState, useEffect } from 'react'
import { Form as AntDForm, Input, DatePicker, Space, Button, Select, Row, Col } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import Modal from 'antd/es/modal/Modal'
import dayjs from 'dayjs'
import { useAuthContext } from '../shared/contexts/Auth'
import { useTasksServices } from '../shared/services/TasksSettings'
import { Action, TabHeader, Table, Form, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useAxios } from '../shared/lib/axios'
import { useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments } from '../shared/interfaces'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ TASKS }] = useEndpoints()

export default function Tasks() {
    renderTitle('Tasks')
    const [data, setData] = useState<ITasks[]>([])
    const [selectedData, setSelectedData] = useState<ITasks | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<ITasks> = [
        {
            title: 'Task Activity',
            key: 'task_activity',
            dataIndex: 'task_activity',
        },
        {
            title: 'Task Type',
            key: 'task_type',
            dataIndex: 'task_type',
        },
        {
            title: 'Sprint',
            key: 'sprint_name',
            dataIndex: 'sprint_name',
        },
        {
            title: 'Manhours',
            key: 'manhours',
            dataIndex: 'manhours',
            align: 'center',
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            align: 'center',
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
            render: (_, record: ITasks) => <Action
                title='Tasks'
                name={record.name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<TasksRes>(TASKS.GET, args?.signal!, { page: args?.page!, search: args?.search! })
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

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({ search: str, page: 1 })
    }

    function handleDelete(id: string) {
        DELETE(TASKS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITasks) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleDownload() {
        console.log('dowwnload')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <>
            <MainHeader>
                <h1 className='color-white'>Tasks</h1>
            </MainHeader>
            <TabHeader
                name='Tasks'
                handleSearchData={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                onChange={(pagination: TablePaginationConfig) => {
                    fetchData({ page: pagination?.current, search })
                }}
            />
            <TasksModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
            />
        </>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ITasks
    fetchData: (args?: IArguments) => void
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function TasksModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<ITasks>()
    const { user } = useAuthContext()
    const tasks = useTasksServices()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                date: dayjs(selectedData.date, 'YYYY/MM/DD') as any
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ITasks) {
        let { date, description, ...restValues } = values
        date = dayjs(date).format('YYYY/MM/DD') as any
        restValues = { ...restValues, user_id: selectedData ? selectedData.user_id : user?.id!, date, ...(description != undefined && { description }) } as any
        let result = selectedData ? PUT(TASKS.PUT, { ...restValues, id: selectedData.id }) : POST(TASKS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Tasks`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Task Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter task name!' }]}
            >
                <Input placeholder='Enter task name...' />
            </FormItem>
            <FormItem
                label="Date"
                name="date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <Row justify='space-between' align='middle'>
                <Col span={18}>
                    <FormItem name='task_activity_id' label="Task Activity" required rules={[{ required: true, message: 'Please select task activity!' }]}>
                        <Select
                            // mode='multiple'
                            placeholder='Select task activity'
                            allowClear
                            showSearch
                        >
                            {tasks.activities.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary'>
                        Add Activity
                    </Button>
                </Col>
            </Row>
            <Row justify='space-between' align='middle'>
                <Col span={18}>
                    <FormItem name='task_type_id' label="Task Type" required rules={[{ required: true, message: 'Please select task type!' }]}>
                        <Select
                            // mode='multiple'
                            placeholder='Select task type'
                            allowClear
                            showSearch
                        >
                            {tasks.sprints.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary'>
                        Add Type
                    </Button>
                </Col>
            </Row>
            <Row justify='space-between' align='middle'>
                <Col span={18}>
                    <FormItem name='sprint_id' label="Sprint" required rules={[{ required: true, message: 'Please select task sprint!' }]}>
                        <Select
                            // mode='multiple'
                            placeholder='Select sprint'
                            allowClear
                            showSearch
                        >
                            {tasks.activities.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary'>
                        Add Sprint
                    </Button>
                </Col>
            </Row>
            <FormItem name="manhours" label="Manhours" required rules={[{ required: true, message: 'Please manhours!' }]}>
                <Input placeholder='Enter manhours...' />
            </FormItem>
            <FormItem name="description" label="Description">
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