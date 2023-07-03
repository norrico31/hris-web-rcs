import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { DatePicker, Space, Button, Select, Row, Skeleton, Input, DatePickerProps, Modal, Typography, Col } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axios from 'axios'
import { useAuthContext } from '../shared/contexts/Auth'
import { useSearchDebounce } from '../shared/hooks/useDebounce'
import { Table, Divider } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useAxios } from '../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments } from '../shared/interfaces'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { StyledRow } from './EmployeeEdit'
import dayjs from 'dayjs'
import { Alert } from '../shared/lib/alert'

const { GET } = useAxios()
const [{ TASKS, TEAMTASKS }] = useEndpoints()

interface IParams extends IArguments {
    user?: string
    date?: string
}

export default function MyTeamTask() {
    renderTitle('My Team Tasks')
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<ITasks[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalDownload, setIsModalDownload] = useState(false)
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Array<{ id: string; full_name: string }>>([])
    const debounceSearch = useSearchDebounce(search)
    const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined)
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

    const columns = useMemo(renderColumns, [data])
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

    const controller = new AbortController();
    useEffect(() => {
        if (!loadingUser && !codes['md01']) return
        if (user) GET<any>('tasks/team_task/users', controller.signal)
            .then((data) => setUsers(data ?? []));
        return () => {
            controller.abort()
        }
    }, [user])

    useEffect(function fetch() {
        fetchData({
            search: debounceSearch,
            signal: controller.signal,
            date: selectedDate,
            user: selectedUser,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
        return () => {
            controller.abort()
        }
    }, [selectedDate, selectedUser, debounceSearch])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['md01']) {
        if (paths?.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    function fetchData(args?: IParams) {
        setLoading(true)
        const date = args?.date !== 'Invalid Date' && args?.date
        GET<TasksRes>(TASKS.TEAMTASKS, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize!, user: args?.user, date: date as string })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search: debounceSearch, pageSize: pagination?.pageSize!, user: selectedUser, date: selectedDate })

    const handleDatePickerChange: DatePickerProps['onChange'] = (date, dateString) => {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'))
    }

    return <>
        <StyledRow justify='space-between' wrap align='middle'>
            <h1 className='color-white'>My Team Tasks</h1>
        </StyledRow>
        <Row justify='space-between' gutter={[0, 12]}>
            <Col>
                <Space>
                    <Select placeholder='Select Employee...' optionFilterProp="children" allowClear showSearch style={{ width: 150 }} value={selectedUser} onChange={setSelectedUser}>
                        {users?.map((user) => (
                            <Select.Option value={user.full_name} key={user.id} style={{ color: '#777777' }}>{user.full_name}</Select.Option>
                        ))}
                    </Select>
                    <DatePicker format='YYYY-MM-DD' onChange={handleDatePickerChange} />
                </Space>
            </Col>
            <Col>
                <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
            </Col>
        </Row>
        <Divider />
        <Table
            loading={loading}
            columns={columns}
            dataList={data}
            tableParams={tableParams}
            onChange={onChange}
        />
        <ModalDownload
            users={users!}
            isModalDownload={isModalDownload}
            handleClose={() => setIsModalDownload(false)}
        />
    </>
}

const { Title } = Typography

const dateVal = [dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD'), dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD')]

function ModalDownload({ users, isModalDownload, handleClose }: { users: Array<{ id: string; full_name: string }>; isModalDownload: boolean; handleClose: () => void; }) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<any>(dateVal)
    const [selectedUser, setSelectedUser] = useState<Array<string>>([])

    function handleDownload() {
        setLoading(true)
        const start_date = dayjs(date[0]).format('YYYY-MM-DD')
        const end_date = dayjs(date[1]).format('YYYY-MM-DD')
        const userIds = users.map((user) => user.id).join(',')
        axios.post(TEAMTASKS.DOWNLOAD, JSON.stringify({
            start_date,
            end_date,
            user_id: userIds
        }), {
            headers: {
                'Content-Disposition': "attachment; filename=task_report.xlsx",
                "Content-Type": "application/json",
            },
            responseType: 'arraybuffer'
        })
            .then((res: any) => {
                Alert.success('Download Success', 'Team Tasks Download Successfully!')
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `Tasks ${dayjs(start_date).format('YYYY-MM-DD')} - ${dayjs(end_date).format('YYYY-MM-DD')}.xlsx`)
                document.body.appendChild(link)
                link.click()
                handleClose()
                setSelectedUser([])
            })
            .catch(err => err)
            .finally(() => {
                setLoading(false)
                setDate(dateVal)
            })
    }

    return (
        <Modal title='Download - Team Tasks' open={isModalDownload} onCancel={handleClose} footer={null} forceRender>
            <Divider />
            <Row justify='space-between'>
                <Title level={5}>Select Employee: </Title>
                <Select placeholder='Select Employee...' mode='multiple' optionFilterProp="children" allowClear showSearch style={{ width: 288 }} value={selectedUser} onChange={setSelectedUser}>
                    {users?.map((user) => (
                        <Select.Option value={user.id} key={user.id} style={{ color: '#777777' }}>{user.full_name}</Select.Option>
                    ))}
                </Select>
            </Row>
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
            <div style={{ textAlign: 'right' }}>
                <Space>
                    <Button id='download' type="primary" loading={loading} disabled={loading} onClick={handleDownload}>
                        Download
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </div>
        </Modal>
    )
}

function renderColumns(): ColumnsType<ITasks> {
    return [
        {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
            render: (_, record) => record?.user?.full_name,
            width: 130
        },
        {
            title: 'Task Activity',
            key: 'task_activity',
            dataIndex: 'task_activity',
            render: (_, record) => record?.task_activity?.name,
            width: 130
        },
        {
            title: 'Task Type',
            key: 'task_type',
            dataIndex: 'task_type',
            render: (_, record) => record?.task_type?.name,
            width: 130
        },
        {
            title: 'Sprint',
            key: 'sprint_name',
            dataIndex: 'sprint_name',
            render: (_, record) => record?.sprint?.name,
            width: 130
        },
        {
            title: 'Team',
            key: 'team_id',
            dataIndex: 'team_id',
            render: (_, record) => record?.team?.name,
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
    ]
}