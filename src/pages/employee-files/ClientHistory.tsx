import { useState, useEffect } from 'react'
import { Form as AntDForm } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table } from '../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, TableParams, IEmployeeClients, ClientScheduleRes } from '../../shared/interfaces'

const { useForm, Item } = AntDForm

const [{ EMPLOYEE201 }] = useEndpoints()
const { GET } = useAxios()
// TODO
export default function ClientHistory() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [form] = useForm()
    const [data, setData] = useState<IEmployeeClients[]>([])
    const [selectedData, setSelectedData] = useState<IEmployeeClients | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const columns: ColumnsType<IEmployeeClients> = [
        {
            title: 'Client',
            key: 'client',
            dataIndex: 'client',
            render: (_, record) => record?.client.name
        },
        {
            title: 'Client Branch',
            key: 'client_branch',
            dataIndex: 'client_branch',
            render: (_, record) => record?.branch_name.branch_name
        },
        {
            title: 'Start Date',
            key: 'client_start_date',
            dataIndex: 'client_start_date',
        },
        {
            title: 'End Date',
            key: 'client_end_date',
            dataIndex: 'client_end_date',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
    ]

    const handleSearch = (str: string) => {
        setSearch(str)
        // fetchData({ search: str, page: 1 })
    }

    function handleDownload() {
        alert('download')
    }
    // TODO: FORM LIKE IN THE USERPROFILE NOT TABLE
    return (
        <Card title='Client and Schedule'>
            <TabHeader
                name='client and schedule'
                handleSearch={handleSearch}
                handleDownload={handleDownload}
            />
            <Table
                columns={columns}
                dataList={employeeInfo?.employee_clients ?? []}
                tableParams={tableParams}
                onChange={(pagination: TablePaginationConfig) => {
                    // fetchData({ page: pagination?.current, search })
                }}
            />
        </Card>
    )
}
