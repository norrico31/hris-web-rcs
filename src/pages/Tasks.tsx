import { useState, useEffect } from 'react'
import { Typography, Form as AntDForm, Input, DatePicker, Space, Button, Select, Row, Col, Modal, Divider } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axios from 'axios'
import dayjs from 'dayjs'
import { useAuthContext } from '../shared/contexts/Auth'
import { useTasksServices } from '../shared/services/TasksSettings'
import { Action, TabHeader, Table, Form, MainHeader, } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments, ITeam } from '../shared/interfaces'
import { ActivityModal } from './system-settings/task-settings/TaskActivities'
import { SprintModal } from './system-settings/task-settings/TaskSprint'
import { TypesModal } from './system-settings/task-settings/TaskTypes'
import { Alert } from '../shared/lib/alert'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ TASKS, SYSTEMSETTINGS: { TASKSSETTINGS, HRSETTINGS }, }] = useEndpoints()

// TODO: PERMISSIONS

export default function Tasks() {
    renderTitle('Tasks')
    const { user } = useAuthContext()
    const [data, setData] = useState<ITasks[]>([])
    const [selectedData, setSelectedData] = useState<ITasks | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalDownload, setIsModalDownload] = useState(false)
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
            render: (_, record) => record.task_activity?.name,
            width: 130
        },
        {
            title: 'Task Type',
            key: 'task_type',
            dataIndex: 'task_type',
            render: (_, record) => record.task_type?.name,
            width: 130
        },
        {
            title: 'Sprint',
            key: 'sprint_name',
            dataIndex: 'sprint_name',
            render: (_, record) => record.sprint?.name,
            width: 130
        },
        {
            title: 'Department',
            key: 'department_id',
            dataIndex: 'department_id',
            render: (_, record) => record.department?.name,
            width: 130
        },
        {
            title: 'Team',
            key: 'team_id',
            dataIndex: 'team_id',
            render: (_, record) => record.team?.name,
            width: 130
        },
        {
            title: 'Manhours',
            key: 'manhours',
            dataIndex: 'manhours',
            align: 'center',
            width: 120
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            align: 'center',
            width: 120
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
            width: 250
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
            />,
            width: 150
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<TasksRes>(TASKS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(TASKS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ITasks) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (selectedData || isModalOpen) ? (
        (
            <TasksInputs
                title={selectedData != undefined ? 'Update' : 'Create'}
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
                name='tasks management'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            >
                <Button type='primary' onClick={() => setIsModalDownload(true)}>Download</Button>
            </TabHeader>
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <TasksModalDownload
                userId={user?.id!}
                isModalDownload={isModalDownload}
                handleClose={() => setIsModalDownload(false)}
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
    const [teams, setTeams] = useState<ITeam[]>([])
    const [loading, setLoading] = useState(false)
    const [teamId, setTeamId] = useState('')

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                date: dayjs(selectedData.date, 'YYYY/MM/DD') as any
            })
            setTeamId(selectedData?.team_id ?? selectedData.team?.id)
        } else {
            form.resetFields(undefined)
            setTeamId('')
        }
        const controller = new AbortController();
        axiosClient(HRSETTINGS.TEAMS.USERS_LISTS, { signal: controller.signal })
            .then((res) => setTeams(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData])

    useEffect(() => {
        if (teamId != undefined || teamId != '') {
            const acitivityUrl = teamId ? TASKSSETTINGS.ACTIVITIES.LISTS + ('?team_id=' + teamId) : TASKSSETTINGS.ACTIVITIES.LISTS;
            const typesUrl = teamId ? TASKSSETTINGS.TYPES.LISTS + ('?team_id=' + teamId) : TASKSSETTINGS.TYPES.LISTS;
            const sprintsUrl = teamId ? TASKSSETTINGS.SPRINT.LISTS + ('?team_id=' + teamId) : TASKSSETTINGS.SPRINT.LISTS;
            fetchList(acitivityUrl, 'activities');
            fetchList(typesUrl, 'types');
            fetchList(sprintsUrl, 'sprints');
        }
    }, [teamId])

    async function fetchList(url: string, key: 'activities' | 'types' | 'sprints') {
        const data = await getList(url)
        setTasks((prevTasks) => ({ ...prevTasks, [key]: data }))
    }

    function onFinish(values: ITasks) {
        setLoading(true)
        let { date, description, ...restValues } = values
        date = dayjs(date).format('YYYY/MM/DD') as any
        restValues = { ...restValues, user_id: selectedData ? selectedData.user_id : user?.id!, date, ...(description != undefined && { description }) } as any
        let result = selectedData ? PUT(TASKS.PUT + selectedData.id!, { ...restValues, id: selectedData.id }) : POST(TASKS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).catch((err) => {
            // display error
            console.log(err)
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <>
        <Title level={2}>Tasks - {title}</Title>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Task Name"
                name="name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter task name...' />
            </FormItem>
            <FormItem
                label="Date"
                name="date"
                required
                rules={[{ required: true, message: '' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem name='team_id' label="Team" required rules={[{ required: true, message: '' }]}>
                <Select
                    placeholder='Select team'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    value={teamId}
                    onChange={setTeamId}
                >
                    {teams.map((team) => (
                        <Select.Option value={team.id} key={team.id} style={{ color: '#777777' }}>{team.name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <Row gutter={[24, 24]} align='middle'>
                <Col span={18}>
                    <FormItem name='task_activity_id' label="Task Activity" required rules={[{ required: true, message: '' }]}>
                        <Select
                            placeholder='Select task activity'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            disabled={!teamId}
                        >
                            {tasks.activities?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalActivity(true)} disabled={!teamId}>
                        Add Activity
                    </Button>
                </Col>
            </Row>
            <Row gutter={[24, 24]} align='middle'>
                <Col span={18}>
                    <FormItem name='task_type_id' label="Task Type" required rules={[{ required: true, message: '' }]}>
                        <Select
                            placeholder='Select task type'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            disabled={!teamId}
                        >
                            {tasks.types?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalTypes(true)} disabled={!teamId}>
                        Add Type
                    </Button>
                </Col>
            </Row>
            <Row gutter={[24, 24]} align='middle'>
                <Col span={18}>
                    <FormItem name='sprint_id' label="Sprint" required rules={[{ required: true, message: '' }]}>
                        <Select
                            placeholder='Select sprint'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            disabled={!teamId}
                        >
                            {tasks.sprints?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalSprints(true)} disabled={!teamId}>
                        Add Sprint
                    </Button>
                </Col>
            </Row>
            <FormItem name="manhours" label="Manhours" required rules={[{ required: true, message: '' }]}>
                <Input placeholder='Enter manhours...' />
            </FormItem>
            <FormItem name="description" label="Description">
                <Input.TextArea placeholder='Enter description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button id={selectedData != undefined ? 'Edit' : 'Create'} type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
        <ActivityModal
            title='Create'
            teamId={teamId}
            fetchData={() => fetchList(TASKSSETTINGS.ACTIVITIES.LISTS + teamId ? (TASKSSETTINGS.ACTIVITIES.LISTS + '?team_id=' + teamId) : '', 'activities')}
            isModalOpen={isModalActivity}
            handleCancel={() => setIsModalActivity(false)}
        />
        <TypesModal
            title='Create'
            teamId={teamId}
            fetchData={() => fetchList(TASKSSETTINGS.TYPES.LISTS + teamId ? (TASKSSETTINGS.TYPES.LISTS + '?team_id=' + teamId) : '', 'types')}
            isModalOpen={isModalTypes}
            handleCancel={() => setIsModalTypes(false)}
        />
        <SprintModal
            title='Create'
            teamId={teamId}
            fetchData={() => fetchList(TASKSSETTINGS.SPRINT.LISTS + teamId ? (TASKSSETTINGS.SPRINT.LISTS + '?team_id=' + teamId) : '', 'sprints')}
            isModalOpen={isModalSprints}
            handleCancel={() => setIsModalSprints(false)}
        />
    </>
}

const dateVal = [dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD'), dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD')]

function TasksModalDownload({ userId, isModalDownload, handleClose }: { userId: string; isModalDownload: boolean; handleClose: () => void; }) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<any>(dateVal)

    function handleDownload() {
        setLoading(true)
        const start_date = dayjs(date[0]).format('YYYY-MM-DD')
        const end_date = dayjs(date[1]).format('YYYY-MM-DD')
        axios.post(TASKS.DOWNLOAD, JSON.stringify({
            start_date,
            end_date,
            user_id: userId
        }), {
            headers: {
                'Content-Disposition': "attachment; filename=task_report.xlsx",
                "Content-Type": "application/json",
            },
            responseType: 'arraybuffer'
        })
            .then((res: any) => {
                Alert.success('Download Success', 'Tasks Download Successfully!')
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `Tasks ${dayjs(start_date).format('YYYY-MM-DD')} - ${dayjs(end_date).format('YYYY-MM-DD')}.xlsx`)
                document.body.appendChild(link)
                link.click()
                handleClose()
            })
            .catch(err => {
                console.log('error to: ', err)
            })
            .finally(() => {
                setLoading(false)
                setDate(dateVal)
            })
    }

    return (
        <Modal title='Download - Tasks' open={isModalDownload} onCancel={handleClose} footer={null} forceRender>
            <Divider />
            <Row justify='space-between'>
                <Title level={5}>Select Date: </Title>
                <DatePicker.RangePicker
                    format='YYYY/MM/DD'
                    onChange={setDate}
                    value={date}
                />

            </Row>
            <Divider style={{ border: 'none', margin: 10 }} />
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button id='download' type="primary" loading={loading} disabled={loading} onClick={handleDownload}>
                        Download
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Modal>
    )
}

const getList = (url: string) => axiosClient.get(url).then((res) => res?.data ?? [])