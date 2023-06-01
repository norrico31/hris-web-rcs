import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Space, Button, Popconfirm } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import { TabHeader, Table, MainHeader, } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useAxios } from '../shared/lib/axios'
import { useEndpoints } from '../shared/constants'
import { TableParams, ITasks, TasksRes, IArguments } from '../shared/interfaces'

const { GET } = useAxios()
const [{ TASKS }] = useEndpoints()

export default function MyTaskArvhices() {
    renderTitle('My Tasks - Archives')
    const [data, setData] = useState<ITasks[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

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
        // {
        //     title: 'Department',
        //     key: 'department_id',
        //     dataIndex: 'department_id',
        //     render: (_, record) => record.department?.name,
        //     width: 130
        // },
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
        }
    ]

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

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    return <>
        <MainHeader>
            <h1 className='color-white' style={{ margin: 0 }}>Tasks - Archives</h1>
        </MainHeader>
        <TabHeader handleSearch={handleSearch}>
            <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
        </TabHeader>
        <Table
            loading={loading}
            columns={columns}
            dataList={data}
            tableParams={tableParams}
            onChange={onChange}
        />
    </>
}