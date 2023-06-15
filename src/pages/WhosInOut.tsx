import { useState, useEffect } from 'react'
import { Row, Space, Switch, Typography } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import useWindowSize from '../shared/hooks/useWindowSize'
import { TabHeader, Table } from '../components'
import { useEndpoints } from '../shared/constants'
import { useAxios } from '../shared/lib/axios'
import { renderTitle } from '../shared/utils/utilities'
import { IArguments, ITimeKeeping, TableParams, TimeKeepingRes } from '../shared/interfaces'

const [{ WHOSINOUT }] = useEndpoints()
const { GET } = useAxios()
const { Title } = Typography

export default function WhosInOut() {
    renderTitle("Who's In and Out")
    const [data, setData] = useState<Array<ITimeKeeping>>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [today] = useState(dayjs().format('YYYY-MM-DD'))
    const [isInOut, setIsInOut] = useState(false)
    const { width } = useWindowSize()

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ args: { signal: controller.signal }, isIn: isInOut })
        return () => {
            controller.abort()
        }
    }, [isInOut])

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
        <>
            <Title level={2} style={{ textAlign: width < 500 ? 'center' : 'initial' }}>Who's In / Out</Title>
            <Row justify='center'>
                <Space align='center'>
                    <Typography.Title level={2} style={{ margin: 0 }}>In</Typography.Title>
                    <Switch checkedChildren="Out" unCheckedChildren="In" checked={isInOut} onChange={setIsInOut} />
                    <Typography.Title level={2} style={{ margin: 0 }}>Out</Typography.Title>
                </Space>
            </Row>
            <Row justify='center'>
                <Typography.Title level={4}>{dayjs(today).format('MMMM') + ''} {dayjs(today).format('D') + ''}, {dayjs(today).format('YYYY') + ''} - {dayjs(today).format('dddd')}</Typography.Title>
            </Row>
            <TabHeader
                handleSearch={handleSearch}
            />
            <Table
                loading={loading}
                columns={width > 500 ? renderColumns(isInOut) : mobileCol}
                dataList={Object.values(data)}
                tableParams={tableParams}
                onChange={onChange}
            />
        </>
    )
}

const renderColumns = (isInOut: boolean): ColumnsType<ITimeKeeping> => [
    {
        title: 'Name',
        key: 'full_name',
        dataIndex: 'full_name',
        width: 150,
        render: (_, record) => record?.user?.full_name
    },
    {
        title: 'Schedule',
        key: 'client_schedule',
        dataIndex: 'client_schedule',
        width: 150,
        render: (_, record) => record?.schedule?.name
    },
    {
        title: 'Department',
        key: 'department',
        dataIndex: 'department',
        width: 150,
        render: (_, record) => record?.user?.department?.name
    },
    {
        title: !isInOut ? 'Time In' : 'Time Out',
        key: 'time_keeping_time',
        dataIndex: 'time_keeping_time',
        width: 150
    },
    {
        title: 'Client Site',
        key: 'is_client_site',
        dataIndex: 'is_client_site',
        render: (_, record) => record?.is_client_site === 1 ? 'Yes' : 'No',
        width: 150
    },
]

const mobileCol: ColumnsType<ITimeKeeping> = [
    {
        title: 'Name',
        key: 'full_name',
        dataIndex: 'full_name',
        width: 150,
        render: (_, record) => record?.user?.full_name,
        align: 'center'
    },
    {
        title: 'Time',
        key: 'time_keeping_time',
        dataIndex: 'time_keeping_time',
        width: 150,
        align: 'center'
    },
]