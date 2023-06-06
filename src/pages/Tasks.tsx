import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Typography, Form as AntDForm, Input, DatePicker, Space, Button, Select, Row, Col, Modal, Divider, Popconfirm, Skeleton } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axios from 'axios'
import dayjs from 'dayjs'
import { BiRefresh } from 'react-icons/bi'
import { v4 as uuidv4 } from "uuid"
import { BsBuildingFillAdd } from 'react-icons/bs'
import useMessage from 'antd/es/message/useMessage'
import { GrFormAdd } from 'react-icons/gr'
import { useAuthContext } from '../shared/contexts/Auth'
import { ITasksServices, useTasksServices } from '../shared/services/TasksSettings'
import { Action, TabHeader, Table, Form, MainHeader, } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments, ITeam } from '../shared/interfaces'
import { ActivityModal } from './system-settings/task-settings/TaskActivities'
import { SprintModal } from './system-settings/task-settings/TaskSprint'
import { TypesModal } from './system-settings/task-settings/TaskTypes'
import { Alert } from '../shared/lib/alert'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ TASKS, SYSTEMSETTINGS: { TASKSSETTINGS, HRSETTINGS }, }] = useEndpoints()

export default function Tasks() {
    renderTitle('My Tasks')
    const { user, loading: loadingUser } = useAuthContext()
    const navigate = useNavigate()
    let [data, setData] = useState<ITasks[]>([])
    const [selectedData, setSelectedData] = useState<ITasks | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalArchive, setIsModalArchive] = useState(false)
    const [isModalDownload, setIsModalDownload] = useState(false)
    const [loading, setLoading] = useState(true)

    const columns = useMemo(() => renderColumns({ handleDelete, handleEdit }), [data])
    data = useMemo(() => data, [data])

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['e01', 'e02', 'e03', 'e04'].every((c) => !codes[c])) {
        if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    function fetchData(args?: IArguments) {
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
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return isModalOpen ? (
        (
            <TasksCreateInputs
                title='Create'
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        )
    ) : selectedData ? (
        <TasksUpdateInputs
            title='Update'
            selectedData={selectedData}
            fetchData={fetchData}
            handleCancel={handleCloseModal}
        />
    ) : (
        <>
            <MainHeader>
                <h1 className='color-white'>My Tasks</h1>
            </MainHeader>
            <TabHeader
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
                handleModalArchive={() => navigate('/tasks/archives')}
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
            <ArchiveModal
                fetchMainData={fetchData}
                isModalOpen={isModalArchive}
                handleClose={() => setIsModalArchive(false)}
                columns={columns.slice(0, -1)}
            />
        </>
    )
}

type CreateInputProps = {
    title: string
    fetchData: (args?: IArguments) => void
    handleCancel: () => void
}

type UpdateInputProps = {
    title: string
    selectedData: ITasks
    fetchData: (args?: IArguments) => void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm
const { Title } = Typography

const initDataColState = () => [{
    id: uuidv4(),
    team_id: undefined,
    task_activity_id: undefined,
    task_type_id: undefined,
    sprint_id: undefined,
    manhours: undefined,
    description: undefined
}]

function TasksCreateInputs({ title, fetchData, handleCancel }: CreateInputProps) {
    const [form] = useForm<ITasks>()
    const [isModalActivity, setIsModalActivity] = useState(false)
    const [isModalTypes, setIsModalTypes] = useState(false)
    const [isModalSprints, setIsModalSprints] = useState(false)
    const [tasks, setTasks] = useState<Array<ITasksServices>>([{ activities: [], sprints: [], types: [] }])
    const [teams, setTeams] = useState<Array<ITeam[]>>([])
    const [loading, setLoading] = useState(false)
    const [teamIds, setTeamIds] = useState<Array<string>>([])
    const [dataColumns, setDataColumns] = useState<DataColumns>(initDataColState)
    const [currentIdx, setCurrentIdx] = useState(0)
    const [messageApi, contextHolder] = useMessage()
    const [isMultipleDelete, setIsMultipleDelete] = useState(false)
    const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])

    const controller = new AbortController();
    useEffect(() => {
        axiosClient(HRSETTINGS.TEAMS.USERS_LISTS, { signal: controller.signal })
            .then((res) => setTeams([res?.data]));
        return () => controller.abort()
    }, [handleCancel])

    useEffect(() => {
        if (teamIds[currentIdx]) {
            fetchList(TASKSSETTINGS.ACTIVITIES.LISTS + ('?team_id=' + teamIds[currentIdx]), 'activities', currentIdx);
            fetchList(TASKSSETTINGS.TYPES.LISTS + ('?team_id=' + teamIds[currentIdx]), 'types', currentIdx);
            fetchList(TASKSSETTINGS.SPRINT.LISTS + ('?team_id=' + teamIds[currentIdx]), 'sprints', currentIdx);
        }
    }, [currentIdx, teamIds])

    const fetchList = useCallback(async function (url: string, key: 'activities' | 'types' | 'sprints', idx: number) {
        const data = await getList(url)
        tasks[idx] = { ...tasks[idx], [key]: data ?? [] }
        setTasks([...tasks])
    }, [tasks])

    const addRow = useCallback(function () {
        setDataColumns(prevRow => [...prevRow, initDataColState()[0]])
    }, [dataColumns])

    const handleSelectChange = useCallback(function (id: string, idx: number, key: string) {
        dataColumns[idx][key] = id ?? null
        setDataColumns([...dataColumns])
    }, [dataColumns])

    const handleInputChange = useCallback(function (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, idx: number, key: string) {
        dataColumns[idx][key] = evt.target.value ?? null
        setDataColumns([...dataColumns])
    }, [dataColumns])

    const clearField = useCallback(function (idx: number) {
        dataColumns[idx] = initDataColState()[0]
        setDataColumns([...dataColumns])
    }, [dataColumns])

    const removeRow = useCallback(function (recordId: string, idx: number) {
        const newDataCol = dataColumns.filter(c => c.id !== recordId)
        const newTasks = tasks.splice(idx, 1)
        setDataColumns(newDataCol)
        setTasks(newTasks)
        if (teamIds[idx]) {
            const idxId = teamIds.indexOf(teamIds[idx])
            if (idxId > -1) teamIds.splice(idx, 1)
            setTeamIds([...teamIds])
        }
    }, [dataColumns, tasks, teamIds])

    const columns: ColumnsType<ITasks> = useMemo(() => [
        {
            title: 'Project / Team',
            key: 'team_id',
            dataIndex: 'team_id',
            render: (_, __, idx) => <Select
                placeholder='Select Project / Team'
                allowClear
                showSearch
                optionFilterProp="children"
                value={teamIds[idx]}
                onChange={(id) => {
                    teamIds[idx] = id
                    setTeamIds([...teamIds])
                    setCurrentIdx(idx)
                    handleSelectChange(id, idx, 'team_id')
                }}
                style={{ width: 200 }}
            >
                {teams[0]?.map((team) => (
                    <Select.Option value={team.id} key={team.id} style={{ color: '#777777' }}>{team.name}</Select.Option>
                )) ?? []}
            </Select>,
            width: 250,
            align: 'center'
        },
        {
            title: 'Task Activity',
            key: 'task_activity_id',
            dataIndex: 'task_activity_id',
            render: (_, __, idx) => <Row justify='space-between' style={{ width: 210, alignItems: 'center' }}>
                <Select
                    placeholder='Select task activity'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    disabled={!teamIds[idx]}
                    style={{ width: 150 }}
                    value={dataColumns[idx].task_activity_id as string}
                    onChange={(id: string) => handleSelectChange(id, idx, 'task_activity_id')}
                >
                    {tasks[idx]?.activities?.map((act) => (
                        <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                    )) ?? []}
                </Select>
                <Button className='btn-secondary' onClick={() => setIsModalActivity(true)} disabled={!teamIds[idx]}>
                    <GrFormAdd />
                </Button>
                <ActivityModal
                    title='Create'
                    teamId={teamIds[idx]}
                    fetchData={() => fetchList(TASKSSETTINGS.ACTIVITIES.LISTS + teamIds[idx] ? (TASKSSETTINGS.ACTIVITIES.LISTS + '?team_id=' + teamIds[idx]) : '', 'activities', idx)}
                    isModalOpen={isModalActivity}
                    handleCancel={() => setIsModalActivity(false)}
                />
            </Row>,
            width: 250,
            align: 'center'
        },
        {
            title: 'Task Type',
            key: 'task_type_id',
            dataIndex: 'task_type_id',
            render: (_, __, idx) => <Row justify='space-between' align='middle' style={{ width: 210 }}>
                <Select
                    placeholder='Select task type'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    disabled={!teamIds[idx]}
                    style={{ width: 150 }}
                    value={dataColumns[idx].task_type_id as string}
                    onChange={(id: string) => handleSelectChange(id, idx, 'task_type_id')}
                >
                    {tasks[idx]?.types?.map((act) => (
                        <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                    )) ?? []}
                </Select>
                <Button className='btn-secondary' onClick={() => setIsModalTypes(true)} disabled={!teamIds[idx]}>
                    <GrFormAdd />
                </Button>
                <TypesModal
                    title='Create'
                    teamId={teamIds[idx]}
                    fetchData={() => fetchList(TASKSSETTINGS.TYPES.LISTS + teamIds[idx] ? (TASKSSETTINGS.TYPES.LISTS + '?team_id=' + teamIds[idx]) : '', 'types', idx)}
                    isModalOpen={isModalTypes}
                    handleCancel={() => setIsModalTypes(false)}
                />
            </Row>,
            align: 'center',
            width: 200
        },
        {
            title: 'Sprint',
            key: 'sprint_id',
            dataIndex: 'sprint_id',
            render: (_, __, idx) => <Row justify='space-between' style={{ width: 210 }}>
                <Select
                    placeholder='Select sprint'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    disabled={!teamIds[idx]}
                    style={{ width: 150 }}
                    value={dataColumns[idx].sprint_id as string}
                    onChange={(id: string) => handleSelectChange(id, idx, 'sprint_id')}
                >
                    {tasks[idx]?.sprints?.map((act) => (
                        <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                    )) ?? []}
                </Select>
                <Button className='btn-secondary' onClick={() => setIsModalSprints(true)} disabled={!teamIds[idx]}>
                    <GrFormAdd />
                </Button>
                <SprintModal
                    title='Create'
                    teamId={teamIds[idx]}
                    fetchData={() => fetchList(TASKSSETTINGS.SPRINT.LISTS + teamIds[idx] ? (TASKSSETTINGS.SPRINT.LISTS + '?team_id=' + teamIds[idx]) : '', 'sprints', idx)}
                    isModalOpen={isModalSprints}
                    handleCancel={() => setIsModalSprints(false)}
                />
            </Row>,
            width: 250,
            align: 'center'
        },
        {
            title: 'Manhours',
            key: 'manhours',
            dataIndex: 'manhours',
            render: (_, __, idx) => <Input
                disabled={!teamIds}
                type='number'
                placeholder='Enter manhours...'
                style={{ width: 100 }}
                value={dataColumns[idx].manhours}
                onChange={(evt) => handleInputChange(evt, idx, 'manhours')}
            />,
            width: 150,
            align: 'center'
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
            render: (_, __, idx) => <Input.TextArea
                disabled={!teamIds}
                placeholder='Enter description...'
                style={{ width: 250, height: 80 }}
                value={dataColumns[idx].description}
                onChange={(evt) => handleInputChange(evt, idx, 'description')}
            />,
            width: 250,
            align: 'center'
        },
    ], [
        tasks,
        teams,
        teamIds,
        dataColumns,
        isModalActivity,
        isModalTypes,
        isModalSprints,
        currentIdx,
        isMultipleDelete
    ])
    !isMultipleDelete && columns.push({
        title: 'Action',
        key: 'action',
        dataIndex: 'action',
        render: (_, record, idx) => <Space key={record?.id}>
            <PopupConfirm
                title='Clear Field'
                description='Are you sure you want to clear this row field'
                onConfirm={() => clearField(idx)}
                okText="Clear"
                disabled={dataColumns?.length == 1}
            />
            <PopupConfirm
                title='Remove Row'
                description='Are you sure you want to remove this row?'
                onConfirm={() => removeRow(record?.id, idx)}
                okText="Remove"
                disabled={dataColumns?.length == 1}
            />
        </Space>,
        width: 250,
        align: 'center'
    })

    const key = 'error'
    function onFinish(values: ITasks) {
        if (dataColumns.length < 1) return messageApi.open({
            type: 'error',
            content: 'Please enter project / team for tasks',
            duration: 3
        })
        setLoading(true)
        const date = dayjs(values?.date).format('YYYY-MM-DD') as any
        const tasks = filterTasks(dataColumns)
        let payload = {
            ...values,
            date,
            tasks
        }
        let result = POST(TASKS.POST, { ...payload, date, ...(values?.description != undefined && { description: values?.description }) })
        result.then(() => {
            form.resetFields()
            handleCancel()
            setDataColumns(initDataColState)
        }).catch((err) => {
            messageApi.open({
                key,
                type: 'error',
                content: err.response.data.message ?? err.response.data.error,
                duration: 3
            })
            setLoading(false)
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }
    console.log(selectedRowIds)
    return <>
        {contextHolder}
        <Title level={2}>My Tasks - {title}</Title>
        <Divider />
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Row justify='space-around'>
                <FormItem
                    label="Task Name"
                    name="name"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <Input placeholder='Enter task name...' />
                </FormItem>
                <FormItem
                    label="Date"
                    name="date"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
            </Row>
            <Table columns={columns} dataList={dataColumns} rowSelection={isMultipleDelete ? {
                type: 'checkbox',
                onChange: (_: React.Key[], selectedRows: { [key: string]: string | number | undefined; }[]) => {
                    const rowIds = selectedRows.map((r) => r.id) as string[]
                    setSelectedRowIds(rowIds)
                },
            } : null} />
            <Divider style={{ border: 0 }} />
            <Row justify='space-between'>
                <Space>
                    {/* {!selectedRowIds.length && (
                        <Button type='primary' disabled={dataColumns.length < 2} onClick={() => setIsMultipleDelete(!isMultipleDelete)}>
                            {isMultipleDelete ? 'Cancel Multiple Delete' : 'Multiple Delete'}
                        </Button>
                    )}
                    {selectedRowIds.length > 0 && isMultipleDelete && (
                        <Button type='primary' onClick={() => alert(selectedRowIds)}>
                            Delete Selected
                        </Button>
                    )} */}
                    <Button className='btn-secondary' disabled={!teamIds} onClick={addRow}>
                        <Space>
                            <BsBuildingFillAdd /> Add Entry
                        </Space>
                    </Button>
                </Space>
                <Space>
                    <Button id='Create' type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        Create
                    </Button>
                    <Button id='cancel' onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </Row>
        </Form>
    </>
}

function TasksUpdateInputs({ title, selectedData, fetchData, handleCancel }: UpdateInputProps) {
    const [form] = useForm<ITasks>()
    const { user } = useAuthContext()
    const [isModalActivity, setIsModalActivity] = useState(false)
    const [isModalTypes, setIsModalTypes] = useState(false)
    const [isModalSprints, setIsModalSprints] = useState(false)
    const [tasks, setTasks] = useTasksServices()
    const [teams, setTeams] = useState<ITeam[]>([])
    const [loading, setLoading] = useState(false)
    const [teamIds, setTeamIds] = useState('')
    const [teamListById, setTeamListById] = useState<ITeam[]>([])
    const [messageApi, contextHolder] = useMessage()

    useEffect(() => {
        if (selectedData != undefined) {
            setTeamIds(selectedData.team?.id)
            form.setFieldsValue({
                ...selectedData,
                date: dayjs(selectedData.date, 'YYYY/MM/DD') as any
            })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController();
        axiosClient(HRSETTINGS.TEAMS.USERS_LISTS, { signal: controller.signal })
            .then((res) => setTeams(res?.data ?? []));
        return () => {
            controller.abort()
        }
    }, [selectedData])

    useEffect(() => {
        const controller = new AbortController();
        if (teamIds) {
            fetchList(TASKSSETTINGS.ACTIVITIES.LISTS + ('?team_id=' + teamIds), 'activities');
            fetchList(TASKSSETTINGS.TYPES.LISTS + ('?team_id=' + teamIds), 'types');
            fetchList(TASKSSETTINGS.SPRINT.LISTS + ('?team_id=' + teamIds), 'sprints');
            axiosClient(HRSETTINGS.TEAMS.USERS_LISTS + '?team_id=' + teamIds, { signal: controller.signal })
                .then((res) => setTeamListById(res?.data ?? []));
        }
        return () => {
            controller.abort()
        }
    }, [teamIds])

    async function fetchList(url: string, key: 'activities' | 'types' | 'sprints') {
        const data = await getList(url)
        setTasks((prevTasks) => ({ ...prevTasks, [key]: data }))
    }

    function onFinish(values: ITasks) {
        setLoading(true)
        let { date, description, ...restValues } = values
        date = dayjs(date).format('YYYY/MM/DD') as any
        restValues = { ...restValues, user_id: selectedData ? selectedData.user_id : user?.id!, date, ...(description != undefined && { description }) } as any
        let result = PUT(TASKS.PUT + selectedData.id!, { ...restValues, id: selectedData.id });
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).catch((err) => messageApi.open({
            type: 'error',
            content: err.response.data.message ?? err.response.data.error,
            duration: 5
        })).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <>
        {contextHolder}
        <Title level={2}>Tasks - {title}</Title>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Task Name"
                name="name"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter task name...' />
            </FormItem>
            <FormItem
                label="Date"
                name="date"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem name='team_id' label="Team" required rules={[{ required: true, message: 'Required' }]}>
                <Select
                    placeholder='Select team'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    value={teamIds}
                    onChange={(id) => {
                        setTeamIds(id)
                        form.setFieldsValue({
                            ...form.getFieldsValue(),
                            task_activity_id: null,
                            task_type_id: null,
                            sprint_id: null,
                        })
                    }}
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
                            disabled={!teamIds}
                        >
                            {tasks.activities?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalActivity(true)} disabled={!teamIds}>
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
                            disabled={!teamIds}
                        >
                            {tasks.types?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalTypes(true)} disabled={!teamIds}>
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
                            disabled={!teamIds}
                        >
                            {tasks.sprints?.map((act) => (
                                <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                </Col>
                <Col>
                    <Button className='btn-secondary' onClick={() => setIsModalSprints(true)} disabled={!teamIds}>
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
                    <Button id='Update' type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        Update
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
        <ActivityModal
            title='Create'
            teamId={teamIds}
            teamLists={teamListById}
            fetchData={() => fetchList(TASKSSETTINGS.ACTIVITIES.LISTS + teamIds ? (TASKSSETTINGS.ACTIVITIES.LISTS + '?team_id=' + teamIds) : '', 'activities')}
            isModalOpen={isModalActivity}
            handleCancel={() => setIsModalActivity(false)}
        />
        <TypesModal
            title='Create'
            teamId={teamIds}
            teamLists={teamListById}
            fetchData={() => fetchList(TASKSSETTINGS.TYPES.LISTS + teamIds ? (TASKSSETTINGS.TYPES.LISTS + '?team_id=' + teamIds) : '', 'types')}
            isModalOpen={isModalTypes}
            handleCancel={() => setIsModalTypes(false)}
        />
        <SprintModal
            title='Create'
            teamId={teamIds}
            teamLists={teamListById}
            fetchData={() => fetchList(TASKSSETTINGS.SPRINT.LISTS + teamIds ? (TASKSSETTINGS.SPRINT.LISTS + '?team_id=' + teamIds) : '', 'sprints')}
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

interface ArchiveModalProps {
    isModalOpen: boolean
    handleClose: () => void
    fetchMainData(args?: IArguments | undefined): void
    columns: ColumnsType<ITasks>
}

function ArchiveModal({ isModalOpen, handleClose, columns, fetchMainData }: ArchiveModalProps) {
    const [data, setData] = useState<ITasks[]>([])
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        isModalOpen && fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [isModalOpen])

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<TasksRes>(TASKS.ARCHIVES, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    columns.push({
        title: 'Action',
        key: 'action',
        dataIndex: 'action',
        align: 'center',
        render: (_, record: ITasks) => <Popconfirm
            title={`Restore Task`}
            description={`Are you sure you want to restore ${record?.name}?`}
            onConfirm={() => {
                GET(TASKS.RESTORE + record?.id)
                    .then((res) => {
                        console.log(res)
                    })
                    .finally(() => {
                        fetchData()
                        fetchMainData()
                    })
            }}
            okText="Restore"
            cancelText="Cancel"
        >
            <Button id='restore' type='primary' size='middle' onClick={() => null}>
                <Space>
                    <BiRefresh />
                    Restore
                </Space>
            </Button>
        </Popconfirm>,
        width: 150
    })

    return <Modal title='Archive - Tasks' open={isModalOpen} onCancel={handleClose} footer={null} forceRender width={1000}>
        <Table columns={columns} dataList={data} loading={loading} tableParams={tableParams} />
    </Modal>
}

type PopupConfirmProps = {
    title: string
    description: string
    okText: string
    onConfirm: () => void
    disabled: boolean
}

const PopupConfirm = ({ title, description, okText, onConfirm, disabled }: PopupConfirmProps) => <Popconfirm
    title={title}
    description={description}
    onConfirm={onConfirm}
    okText={okText}
    cancelText="Cancel"
    disabled={disabled}
>
    <Button disabled={disabled}>{okText} Entry</Button>
</Popconfirm>


function renderColumns({ handleDelete, handleEdit }: { handleDelete: (id: string) => void; handleEdit: (data: ITasks) => void }): ColumnsType<ITasks> {
    return [
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
            width: 200
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
}

const getList = (url: string) => axiosClient.get(url).then((res) => res?.data ?? [])

function filterTasks(tasks: DataColumns) {
    const filteredTasks = tasks.filter((task) => {
        const filteredTask: { [key: string]: any } = {};
        Object.keys(task).forEach((key) => {
            const value = task[key];
            if (value !== undefined && value !== '' && value !== null) {
                filteredTask[key] = value;
            }
        });
        const columnKeys = Object.keys(filteredTask);
        const hasOnlyIdColumn = columnKeys.length === 1 && columnKeys.includes('id');
        return !hasOnlyIdColumn;
    });

    return filteredTasks;
}

type DataColumns = {
    [key: string]: string | number | undefined;
}[]