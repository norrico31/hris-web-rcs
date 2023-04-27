import { useState, useEffect } from 'react'
import { List, Row, Space, Switch, Typography, Divider } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { useAuthContext } from '../shared/contexts/Auth'
import { Card, TabHeader, Table } from '../components'
import { useEndpoints } from '../shared/constants'
import { useAxios } from '../shared/lib/axios'
import { renderTitle } from '../shared/utils/utilities'
import { IArguments, ITimeKeeping, TableParams, TimeKeepingRes } from '../shared/interfaces'

const [{ WHOSINOUT }] = useEndpoints()
const { GET, POST, DELETE } = useAxios()

export default function WhosInOut() {
    renderTitle("Who's In and Out")
    const { user } = useAuthContext()
    const [data, setData] = useState<Array<ITimeKeeping>>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [today] = useState(dayjs().format('YYYY-MM-DD'))
    const [isInOut, setIsInOut] = useState(false)

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ args: { signal: controller.signal }, isIn: isInOut })
        return () => {
            controller.abort()
        }
    }, [isInOut])

    const columns: ColumnsType<ITimeKeeping> = [
        {
            title: 'Name',
            key: 'full_name',
            dataIndex: 'full_name',
            width: 150
        },
        {
            title: !isInOut ? 'Time In' : 'Time Out',
            key: !isInOut ? 'time_in' : 'time_out',
            dataIndex: !isInOut ? 'time_in' : 'time_out',
            width: 150
        },
        {
            title: 'Date',
            key: 'time_keeping_date',
            dataIndex: 'time_keeping_date',
            width: 150
        },
    ]

    const fetchData = ({ args, isIn }: { args?: IArguments; isIn?: boolean }) => {
        setLoading(true)
        console.log('bat walang date', today)
        const url = !isIn ? WHOSINOUT.IN : WHOSINOUT.OUT
        GET<TimeKeepingRes>(url + today, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            args: {
                search: str,
                page: tableParams?.pagination?.current ?? 1,
                pageSize: tableParams?.pagination?.pageSize
            }
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! } })

    return (
        <Card title="Who's In and Out">
            <Row justify='center'>
                <Space align='center'>
                    <Typography.Title level={2} style={{ margin: 0 }}>In</Typography.Title>
                    <Switch checked={isInOut} onChange={setIsInOut} />
                    <Typography.Title level={2} style={{ margin: 0 }}>Out</Typography.Title>
                </Space>
            </Row>
            {/* <Divider /> */}
            {/* <TabHeader
                name="who's in and out"
                handleSearch={handleSearch}
            /> */}
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
        </Card>
    )
}

// const data = [
//     {
//         title: 'Title 1',
//     },
//     {
//         title: 'Title 2',
//     },
//     {
//         title: 'Title 3',
//     },
//     {
//         title: 'Title 4',
//     },
//     {
//         title: 'Title 5',
//     },
//     {
//         title: 'Title 6',
//     },
//     {
//         title: 'Title 7',
//     },
//     {
//         title: 'Title 8',
//     },
//     {
//         title: 'Title 9',
//     },
//     {
//         title: 'Title 10',
//     },
// ];