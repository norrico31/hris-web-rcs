import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { DatePicker, Space, Button, Select, Row, Col, Modal, Popconfirm, Skeleton, Input } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import axios from 'axios'
import dayjs from 'dayjs'
import { GrFormAdd } from 'react-icons/gr'
import { useAuthContext } from '../shared/contexts/Auth'
import { TabHeader, Table, Divider, debounce } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useAxios } from '../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments } from '../shared/interfaces'
import { Alert } from '../shared/lib/alert'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { StyledRow } from './EmployeeEdit'

const { GET } = useAxios()
const [{ TASKS, }] = useEndpoints()

export default function MyTeamTask() {
    renderTitle('My Team Tasks')
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


    const columns = useMemo(renderColumns, [data])
    data = useMemo(() => data, [data])

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }
    const debouncedSearch = useCallback(debounce((handleSearch), 500), [])

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
        GET<TasksRes>(TASKS.TEAMTASKS, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    return <>
        <StyledRow justify='space-between' wrap align='middle'>
            <h1 className='color-white'>My Team Tasks</h1>
        </StyledRow>
        <Row justify='space-between'>
            <Button type='primary' onClick={() => setIsModalDownload(true)}>Download</Button>
            <Space>
                <Select placeholder='Select Employee...' optionFilterProp="children" allowClear showSearch>
                    {/* {lists?.holidayTypes.map((holiday) => (
                        <Select.Option value={holiday.id} key={holiday.id} style={{ color: '#777777' }}>{holiday.name}</Select.Option>
                    ))} */}
                </Select>
                <DatePicker />
                <Input.Search placeholder='Search...' value={search} onChange={(evt) => {
                    const searchTerm = evt.target.value
                    setSearch(searchTerm)
                    debouncedSearch(searchTerm)
                }} />
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
            // render: (_, record) => record.task_activity?.name,
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