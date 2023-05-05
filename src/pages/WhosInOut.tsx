import { useState, useEffect } from 'react'
import { Row, Space, Switch, Typography } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import { Card, TabHeader, Table } from '../components'
import { useEndpoints } from '../shared/constants'
import { useAxios } from '../shared/lib/axios'
import { renderTitle } from '../shared/utils/utilities'
import { IArguments, ITimeKeeping, TableParams, TimeKeepingRes } from '../shared/interfaces'

const [{ WHOSINOUT }] = useEndpoints()
const { GET } = useAxios()

export default function WhosInOut() {
    renderTitle("Who's In and Out")
    const [data, setData] = useState<Array<ITimeKeeping>>([])
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
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
            width: 150
        },
        {
            title: 'Time In',
            key: 'time_in',
            dataIndex: 'time_in',
            width: 150
        },
        {
            title: 'Time Out',
            key: 'time_out',
            dataIndex: 'time_out',
            render: (_, record) => record?.time_out ?? '-',
            width: 150
        },
        {
            title: 'Date',
            key: 'time_keeping_date',
            dataIndex: 'time_keeping_date',
            width: 150
        },
    ]
    // TODO
    const fetchData = ({ args, isIn }: { args?: IArguments; isIn?: boolean }) => {
        setLoading(true)
        const url = !isIn ? WHOSINOUT.IN : WHOSINOUT.OUT
        GET<TimeKeepingRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            }, isIn: isInOut
        })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, isIn: isInOut })

    return (
        <Card title="Who's In and Out">
            <Row justify='center'>
                <Space align='center'>
                    <Typography.Title level={2} style={{ margin: 0 }}>In</Typography.Title>
                    <Switch checked={isInOut} onChange={setIsInOut} />
                    <Typography.Title level={2} style={{ margin: 0 }}>Out</Typography.Title>
                </Space>
            </Row>
            <Row justify='center'>
                <Typography.Title level={4}>{dayjs(today).format('MMMM') + ''} {dayjs(today).format('D') + ''}, {dayjs(today).format('YYYY') + ''} - {dayjs(today).format('dddd')}</Typography.Title>
            </Row>
            <TabHeader
                name="who's in and out"
                handleSearch={handleSearch}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={Object.values(data)}
                tableParams={tableParams}
                onChange={onChange}
            />
        </Card>
    )
}