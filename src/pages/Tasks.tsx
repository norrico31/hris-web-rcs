import { useState, useEffect, useMemo, ReactNode, startTransition, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Typography, Form as AntDForm, Input, DatePicker, Space, Button, Select, Row, Col, Modal, Divider, Popconfirm, Skeleton, FloatButton } from 'antd'
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
import { Action, TabHeader, Table, Form, MainHeader, Card, } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments, ITeam, ITaskActivities, ITaskTypes, ITaskSprint } from '../shared/interfaces'
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
    description: undefined,
}]

type SelectedRow = { id: string; idx: number }[]

function TasksCreateInputs({ title, fetchData, handleCancel }: CreateInputProps) {
    const [form] = useForm<ITasks>()
    const [loading, setLoading] = useState(false)
    const [teams, setTeams] = useState<Array<ITeam[]>>([])
    const [messageApi, contextHolder] = useMessage()
    const initialTeams = useMemo(() => teams[0] ?? [], [teams[0]])
    const [dataRow, setDataRow] = useState<DataRow[]>(initDataColState)

    const [tasks, setTasks] = useState<Array<ITasksServices>>([{ activities: [], sprints: [], types: [] }])
    const [teamIds, setTeamIds] = useState<Array<string>>([])
    const [currentIdx, setCurrentIdx] = useState(0)

    const [isModalActivity, setIsModalActivity] = useState(false)
    const [isModalTypes, setIsModalTypes] = useState(false)
    const [isModalSprints, setIsModalSprints] = useState(false)

    const controller = new AbortController();
    useEffect(() => {
        axiosClient(HRSETTINGS.TEAMS.USERS_LISTS, { signal: controller.signal })
            .then((res) => setTeams([res?.data]));
        return () => controller.abort()
    }, [])

    useEffect(() => {
        if (teamIds[currentIdx]) fetchTasks(teamIds[currentIdx])
    }, [currentIdx, teamIds])

    const fetchList = async function (url: string, key: 'activities' | 'types' | 'sprints', idx: number) {
        const data = await getList(url)
        tasks[idx] = { ...tasks[idx], [key]: data ?? [] }
        setTasks(() => [...tasks])
    }

    const fetchTasks = async (id: string) => {
        try {
            const activitiesPromise = axiosClient.get(TASKSSETTINGS.ACTIVITIES.LISTS + '?team_id=' + id)
            const typesPromise = axiosClient.get(TASKSSETTINGS.TYPES.LISTS + '?team_id=' + id)
            const sprintsPromise = axiosClient.get(TASKSSETTINGS.SPRINT.LISTS + '?team_id=' + id)
            const [activitiesRes, typesRes, sprintsRes] = await Promise.allSettled([activitiesPromise, typesPromise, sprintsPromise]) as any
            tasks[currentIdx] = {
                activities: activitiesRes?.status === 'fulfilled' ? activitiesRes?.value?.data : [],
                types: typesRes?.status === 'fulfilled' ? typesRes?.value?.data : [],
                sprints: sprintsRes?.status === 'fulfilled' ? sprintsRes?.value?.data : [],
            }
            setTasks([...tasks])
        } catch (error) {
            console.log(error)
        }
    }

    const dataColsChange = (data: DataRow) => {
        if (!data) return
        const newDataCols = dataRow.map((d) => d.id === data.id ? { ...data } : d)
        setDataRow(newDataCols)
    }

    const removeRow = (idx: number) => {
        const newDataRow = [...dataRow] as DataRow[]
        newDataRow.splice(idx, 1)
        const newTasks = [...tasks] as Array<ITasksServices>
        newTasks.splice(idx, 1)
        const newTeamIds = [...teamIds] as Array<string>
        newTeamIds.splice(idx, 1)
        setDataRow(newDataRow)
        setTasks(newTasks)
        setTeamIds(newTeamIds)
    }

    const key = 'error'
    function onFinish(values: ITasks) {
        if (dataRow.length < 1) return messageApi.open({
            type: 'error',
            content: 'Please enter project / team for tasks',
            duration: 3
        })
        setLoading(true)
        const date = dayjs(values?.date).format('YYYY-MM-DD') as any
        const tasks = filterTasks(dataRow) // ito gez
        let payload = {
            ...values,
            date,
            tasks
        }
        let result = POST(TASKS.POST, { ...payload, date, ...(values?.description != undefined && { description: values?.description }) })
        result.then(() => {
            form.resetFields()
            handleCancel()
            setDataRow(initDataColState)
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

    const handleOpenActivityModal = (idx: number) => {
        setCurrentIdx(idx)
        setIsModalActivity(true)
    }
    const handleOpenTypesModal = (idx: number) => {
        setCurrentIdx(idx)
        setIsModalTypes(true)
    }
    const handleOpenSprintsModal = (idx: number) => {
        setCurrentIdx(idx)
        setIsModalSprints(true)
    }

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
            <Card>
                <Row gutter={[24, 24]}>
                    <div style={{ display: 'flex', overflowX: 'auto', flexDirection: 'column' }}>
                        {dataRow.map((data, idx) => (
                            <DataRowItem
                                key={data.id}
                                index={idx}
                                data={data}
                                dataColsChange={dataColsChange}
                                removeRow={() => removeRow(idx)}
                                initialTeams={initialTeams}
                                activities={tasks[idx]?.activities}
                                types={tasks[idx]?.types}
                                sprints={tasks[idx]?.sprints}
                                setCurrentIdx={setCurrentIdx}
                                setTeamIds={setTeamIds}
                                handleOpenActivityModal={() => handleOpenActivityModal(idx)}
                                handleOpenTypesModal={() => handleOpenTypesModal(idx)}
                                handleOpenSprintsModal={() => handleOpenSprintsModal(idx)}
                                isDisableField={!teamIds[idx]}
                                isDisableAction={dataRow.length == 1}
                            />
                        ))}
                    </div>
                </Row>
                {/* TODO: refactor in width hooks */}
                <FloatButton.BackTop style={{ insetInlineStart: '350px', insetBlockEnd: '88px' }} />
                <Space>
                    {/* {(selectedRowIds.length > 0 && isMultipleDelete) ? (
                    <Button type='primary' onClick={() => removeMultipleRow(selectedRowIds)}>
                    Delete Selected
                    </Button>
                    ) : (
                        <Button type='primary' disabled={dataRow.length < 2} onClick={() => setIsMultipleDelete(!isMultipleDelete)}>
                        {isMultipleDelete ? 'Cancel Multiple Delete' : 'Multiple Delete'}
                        </Button>
                    )} */}
                </Space>
                <Button className='btn-secondary' disabled={!teamIds} onClick={() => setDataRow(prevDataCol => [...prevDataCol, initDataColState()[0]])}>
                    <Space>
                        <BsBuildingFillAdd /> Add Entry
                    </Space>
                </Button>
            </Card>
            <Divider style={{ border: 0 }} />
            <Row justify='end'>
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
        <ActivityModal
            title='Create'
            teamId={teamIds[currentIdx]}
            fetchData={() => fetchList(TASKSSETTINGS.ACTIVITIES.LISTS + teamIds[currentIdx] ? (TASKSSETTINGS.ACTIVITIES.LISTS + '?team_id=' + teamIds[currentIdx]) : '', 'activities', currentIdx)}
            isModalOpen={isModalActivity}
            handleCancel={() => setIsModalActivity(false)}
        />
        <TypesModal
            title='Create'
            teamId={teamIds[currentIdx]}
            fetchData={() => fetchList(TASKSSETTINGS.TYPES.LISTS + teamIds[currentIdx] ? (TASKSSETTINGS.TYPES.LISTS + '?team_id=' + teamIds[currentIdx]) : '', 'types', currentIdx)}
            isModalOpen={isModalTypes}
            handleCancel={() => setIsModalTypes(false)}
        />
        <SprintModal
            title='Create'
            teamId={teamIds[currentIdx]}
            fetchData={() => fetchList(TASKSSETTINGS.SPRINT.LISTS + teamIds[currentIdx] ? (TASKSSETTINGS.SPRINT.LISTS + '?team_id=' + teamIds[currentIdx]) : '', 'sprints', currentIdx)}
            isModalOpen={isModalSprints}
            handleCancel={() => setIsModalSprints(false)}
        />
        <Divider style={{ margin: '10px 0', border: 'none' }} />

    </>
}

interface DataRowItem {
    data: DataRow
    index: number
    dataColsChange: (data: DataRow) => void
    removeRow: () => void
    initialTeams: ITeam[]
    activities: ITaskActivities[]
    types: ITaskTypes[]
    sprints: ITaskSprint[]
    setCurrentIdx: React.Dispatch<React.SetStateAction<number>>
    setTeamIds: React.Dispatch<React.SetStateAction<string[]>>
    handleOpenActivityModal: () => void
    handleOpenTypesModal: () => void
    handleOpenSprintsModal: () => void
    isDisableField: boolean
    isDisableAction: boolean
}

function DataRowItem({ data, dataColsChange, removeRow, initialTeams, activities, types, sprints, setCurrentIdx, index, setTeamIds, handleOpenActivityModal, handleOpenTypesModal, handleOpenSprintsModal, isDisableField, isDisableAction }: DataRowItem) {
    const [model, setModel] = useState(data)
    useEffect(() => dataColsChange(model), [model])

    const handleInputChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => setModel({ ...model, manhours: evt.target.value ?? null }), [model?.manhours])
    const handleTextAreaChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => setModel({ ...model, description: evt.target.value ?? null }), [model?.description])

    return <>
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Col>
                <TaskTitle>Project / Team</TaskTitle>
                <Select
                    placeholder='Select Project / Team'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    value={model.team_id as string}
                    onChange={(id: string) => {
                        startTransition(() => {
                            setTeamIds((prevIds: any) => {
                                prevIds[index] = id
                                return [...prevIds]
                            })
                        })
                        setModel({ ...model, team_id: id })
                        setCurrentIdx(index)
                    }}
                    style={{ width: 200 }}
                >
                    {initialTeams?.map((team: any) => <Select.Option value={team.id} key={team.id} style={{ color: '#777777' }}>{team.name}</Select.Option>)}
                </Select>
            </Col>
            <Col>
                <div>
                    <TaskTitle>Task Activity</TaskTitle>
                    <Row justify='space-between' style={{ width: 210, alignItems: 'center' }}>
                        <Select
                            placeholder='Select task activity'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            disabled={isDisableField}
                            style={{ width: 150 }}
                            value={model?.task_activity_id as string}
                            onChange={(id: string) => setModel({ ...model, task_activity_id: id ?? null })}
                        >
                            {activities?.map((act: any) => <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>)}
                        </Select>
                        <Button className='btn-secondary' onClick={handleOpenActivityModal}>
                            <GrFormAdd />
                        </Button>
                    </Row>
                </div>
            </Col>
            <Col>
                <div>
                    <TaskTitle>Task Type</TaskTitle>
                    <Row justify='space-between' align='middle' style={{ width: 210 }}>
                        <Select
                            placeholder='Select task type'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            disabled={isDisableField}
                            style={{ width: 150 }}
                            value={model['task_type_id'] as string}
                            onChange={(id: string) => setModel({ ...model, task_type_id: id ?? null })}
                        >
                            {types?.map((act: any) => <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>)}
                        </Select>
                        <Button className='btn-secondary' onClick={handleOpenTypesModal}>
                            <GrFormAdd />
                        </Button>

                    </Row>
                </div>
            </Col>
            <Col>
                <div>
                    <TaskTitle>Sprint</TaskTitle>
                    <Row justify='space-between' style={{ width: 210 }}>
                        <Select
                            placeholder='Select sprint'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            disabled={isDisableField}
                            style={{ width: 150 }}
                            value={model['sprint_id'] as string}
                            onChange={(id: string) => setModel({ ...model, sprint_id: id ?? null })}
                        >
                            {sprints?.map((act: any) => <Select.Option value={act.id} key={act.id}>{act.name}</Select.Option>)}
                        </Select>
                        <Button className='btn-secondary' onClick={handleOpenSprintsModal}>
                            <GrFormAdd />
                        </Button>

                    </Row>
                </div>
            </Col>
            <Col>
                <TaskTitle>Manhours</TaskTitle>
                <Input
                    disabled={isDisableField}
                    type='number'
                    placeholder='Enter manhours...'
                    style={{ width: 130 }}
                    value={model?.manhours}
                    onChange={handleInputChange}
                />
            </Col>
            <Col>
                <TaskTitle>Description</TaskTitle>
                <Input.TextArea
                    disabled={isDisableField}
                    placeholder='Enter description...'
                    style={{ width: 250, height: 60 }}
                    value={model?.description!}
                    onChange={handleTextAreaChange}
                />
            </Col>
            <Col>
                <Title level={5} style={{ textAlign: 'center' }}>Actions</Title>
                <Space>
                    <PopupConfirm
                        title='Remove Row'
                        description='Are you sure you want to remove this row?'
                        onConfirm={removeRow}
                        okText="Remove"
                        disabled={isDisableAction}
                    />
                </Space>
            </Col>
        </div>
        <Divider />
    </>
}

function TaskTitle({ children }: { children: ReactNode }) {
    return <Title level={5} style={{ textAlign: 'left' }}>{children}</Title>
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

    const key = 'error'
    function onFinish(values: ITasks) {
        setLoading(true)
        let { date, description, ...restValues } = values
        date = dayjs(date).format('YYYY/MM/DD') as any
        restValues = { ...restValues, user_id: selectedData ? selectedData.user_id : user?.id!, date, ...(description != undefined && { description }) } as any
        let result = PUT(TASKS.PUT + selectedData.id!, { ...restValues, id: selectedData.id });
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).catch((err) => {
            messageApi.open({
                key,
                type: 'error',
                content: err.response.data.message ?? err.response.data.error,
                duration: 5
            })
            setLoading(false)
        }).finally(() => {
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

function filterTasks(tasks: DataRow[]) {
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

function rowSeparatorIds(selectedRows: SelectedRow) {
    const ids = [] as string[]
    const idxs = [] as number[]
    for (let i = 0; i < selectedRows.length; i++) {
        const row = selectedRows[i]
        ids.push(row.id)
        idxs.push(row.idx)
    }
    return [ids, idxs] as const
}

type DataRow = {
    [key: string]: string | number | undefined;
}