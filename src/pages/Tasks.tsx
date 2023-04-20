import { useState, useEffect } from 'react'
import { Typography, Form as AntDForm, Input, DatePicker, Space, Button, Select, Row, Col } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import dayjs from 'dayjs'
import { useAuthContext } from '../shared/contexts/Auth'
import { useTasksServices } from '../shared/services/TasksSettings'
import { Action, TabHeader, Table, Form, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments, TasksActivitiesRes } from '../shared/interfaces'
import { ActivityModal } from './system-settings/task-settings/TaskActivities'
import { SprintModal } from './system-settings/task-settings/TaskSprint'
import { TypesModal } from './system-settings/task-settings/TaskTypes'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ TASKS, SYSTEMSETTINGS: { TASKSSETTINGS }, }] = useEndpoints()

export default function Tasks() {
    renderTitle('Tasks')
    const [data, setData] = useState<ITasks[]>([])
    const [selectedData, setSelectedData] = useState<ITasks | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

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
            render: (_, record) => record.task_activity?.name
        },
        {
            title: 'Task Type',
            key: 'task_type',
            dataIndex: 'task_type',
            render: (_, record) => record.task_type?.name
        },
        {
            title: 'Sprint',
            key: 'sprint_name',
            dataIndex: 'sprint_name',
            render: (_, record) => record.sprint?.name
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
                name={record.task_activity?.name + ' ' + record.sprint?.name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<TasksRes>(TASKS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            })
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

    return (selectedData || isModalOpen) ? (
        (
            <TasksInputs
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        )
    ) : (
        <>
            <MainHeader>
                <h1 className='color-white'>Tasks</h1>
            </MainHeader>
            <TabHeader
                name='Tasks'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={(pagination: TablePaginationConfig, filters) => {
                    console.log(pagination)
                    fetchData({ page: pagination?.current, search })
                }}
            />
        </>
    )
}

type Props = {
    title: string
    selectedData?: ITasks
    fetchData: (args?: IArguments) => void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm
const { Title } = Typography

function TasksInputs({ title, selectedData, fetchData, handleCancel }: Props) {
    const [form] = useForm<ITasks>()
    const { user } = useAuthContext()
    const [isModalActivity, setIsModalActivity] = useState(false)
    const [isModalTypes, setIsModalTypes] = useState(false)
    const [isModalSprints, setIsModalSprints] = useState(false)
    const [tasks, setTasks] = useTasksServices()

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

    async function fetchList(url: string, key: string) {
        const data = await getList(url)
        setTasks((prevTasks) => ({ ...prevTasks, [key]: data }))
    }

    function onFinish(values: ITasks) {
        let { date, description, ...restValues } = values
        date = dayjs(date).format('YYYY/MM/DD') as any
        restValues = { ...restValues, user_id: selectedData ? selectedData.user_id : user?.id!, date, ...(description != undefined && { description }) } as any
        let result = selectedData ? PUT(TASKS.PUT + selectedData.id!, { ...restValues, id: selectedData.id }) : POST(TASKS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <>
        <Title level={2}>Tasks - {title}</Title>
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
            <Row gutter={[24, 24]} align='middle'>
                <Col span={18}>
                    <FormItem name='task_activity_id' label="Task Activity" required rules={[{ required: true, message: 'Please select task activity!' }]}>
                        <Select
                            placeholder='Select task activity'
                            allowClear
                            showSearch
                        >
                            {tasks.activities?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalActivity(true)}>
                        Add Activity
                    </Button>
                </Col>
            </Row>
            <Row gutter={[24, 24]} align='middle'>
                <Col span={18}>
                    <FormItem name='task_type_id' label="Task Type" required rules={[{ required: true, message: 'Please select task type!' }]}>
                        <Select
                            placeholder='Select task type'
                            allowClear
                            showSearch
                        >
                            {tasks.types?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalTypes(true)}>
                        Add Type
                    </Button>
                </Col>
            </Row>
            <Row gutter={[24, 24]} align='middle'>
                <Col span={18}>
                    <FormItem name='sprint_id' label="Sprint" required rules={[{ required: true, message: 'Please select task sprint!' }]}>
                        <Select
                            placeholder='Select sprint'
                            allowClear
                            showSearch
                        >
                            {tasks.sprints?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalSprints(true)}>
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
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
        <ActivityModal
            title='Create'
            fetchData={() => fetchList(TASKSSETTINGS.ACTIVITIES.LISTS, 'activities')}
            isModalOpen={isModalActivity}
            handleCancel={() => setIsModalActivity(false)}
        />
        <TypesModal
            title='Create'
            fetchData={() => fetchList(TASKSSETTINGS.TYPES.LISTS, 'types')}
            isModalOpen={isModalTypes}
            handleCancel={() => setIsModalTypes(false)}
        />
        <SprintModal
            title='Create'
            fetchData={() => fetchList(TASKSSETTINGS.SPRINT.LISTS, 'sprints')}
            isModalOpen={isModalSprints}
            handleCancel={() => setIsModalSprints(false)}
        />
    </>
}

const getList = (url: string) => axiosClient.get(url).then((res) => res?.data ?? [])