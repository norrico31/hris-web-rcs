import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { DatePicker, Space, Button, Select, Row, Skeleton, Input, DatePickerProps } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { useAuthContext } from '../shared/contexts/Auth'
import { useSearchDebounce } from '../shared/hooks/useDebounce'
import { Table, Divider } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useAxios } from '../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments } from '../shared/interfaces'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { StyledRow } from './EmployeeEdit'
import dayjs, { Dayjs } from 'dayjs'

const { GET } = useAxios()
const [{ TASKS }] = useEndpoints()

interface IParams extends IArguments {
    user?: string
    date?: string
}

export default function MyTeamTask() {
    renderTitle('My Team Tasks')
    const { user, loading: loadingUser } = useAuthContext()
    let [data, setData] = useState<ITasks[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalDownload, setIsModalDownload] = useState(false)
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<Array<string>>([])
    const debounceSearch = useSearchDebounce(search)
    const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined)
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

    const columns = useMemo(renderColumns, [data])

    const controller = new AbortController();
    useEffect(() => {
        GET<any>('tasks/team_task/users', controller.signal)
            .then(setUsers);
        return () => {
            controller.abort()
        }
    }, [])

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

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['e01', 'e02', 'e03', 'e04'].every((c) => !codes[c])) {
        if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    function fetchData(args?: IParams) {
        setLoading(true)
        GET<TasksRes>(TASKS.TEAMTASKS, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize!, user: args?.user, date: args?.date })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, user: selectedUser, date: selectedDate })

    const handleDatePickerChange: DatePickerProps['onChange'] = (date, dateString) => {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'))
    }

    return <>
        <StyledRow justify='space-between' wrap align='middle'>
            <h1 className='color-white'>My Team Tasks</h1>
        </StyledRow>
        <Row justify='space-between'>
            <Button type='primary' onClick={() => setIsModalDownload(true)}>Download</Button>
            <Space>
                <Select placeholder='Select Employee...' optionFilterProp="children" allowClear showSearch style={{ width: 150 }} value={selectedUser} onChange={setSelectedUser}>
                    {users.map((user) => (
                        <Select.Option value={user} key={user} style={{ color: '#777777' }}>{user}</Select.Option>
                    ))}
                </Select>
                <DatePicker format='YYYY-MM-DD' onChange={handleDatePickerChange} />
                <Input.Search placeholder='Search...' value={search} onChange={(evt) => setSearch(evt.target.value)} />
            </Space>
        </Row>
        <Divider />
        <Table
            loading={loading}
            columns={columns}
            dataList={data}
            tableParams={tableParams}
            onChange={onChange}
        />
    </>
}

function renderColumns(): ColumnsType<ITasks> {
    return [
        {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
            render: (_, record) => record.user?.full_name,
            width: 130
        },
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
    ]
}