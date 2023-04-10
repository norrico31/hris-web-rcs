import { useState, useEffect } from 'react'
import { Form as AntDForm } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from './../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IClientSchedule, ClientScheduleRes } from '../../shared/interfaces'

const { useForm, Item } = AntDForm

const [{ EMPLOYEE201 }] = useEndpoints()
const { GET } = useAxios()

export default function ClientAndSchedule() {
    const { employeeId } = useEmployeeId()
    const [form] = useForm()

    const [data, setData] = useState<IClientSchedule[]>([])
    const [selectedData, setSelectedData] = useState<IClientSchedule | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IClientSchedule> = [
        {
            title: 'Client',
            key: 'client',
            dataIndex: 'client',
        },
        {
            title: 'Client Branch',
            key: 'client_branch',
            dataIndex: 'client_branch',
        },
        {
            title: 'Schedule',
            key: 'schedule',
            dataIndex: 'schedule',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
    ]

    function fetchData(args?: IArguments) {
        GET<ClientScheduleRes>(EMPLOYEE201.CLIENTSCHEDULE.GET + employeeId, args?.signal!, { page: args?.page!, search: args?.search! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({ search: str, page: 1 })
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Client and Schedule'>
            <TabHeader
                name='client and schedule'
                handleSearchData={handleSearch}
                handleDownload={handleDownload}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={(pagination: TablePaginationConfig) => {
                    fetchData({ page: pagination?.current, search })
                }}
            />
        </Card>
    )
}
