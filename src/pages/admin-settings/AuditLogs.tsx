import { useState, useEffect } from 'react'
import { Tag } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Table, Card, TabHeader } from "../../components"
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, IAuditLogs, AuditLogsRes, TableParams } from '../../shared/interfaces'
import { firstLetterCapitalize } from '../../shared/utils/utilities'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function AuditLogs() {
    const [data, setData] = useState<IAuditLogs[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IAuditLogs> = [
        {
            title: 'User',
            key: 'user_full_name',
            dataIndex: 'user_full_name',
        },
        {
            title: 'Account Type',
            key: 'account_type',
            dataIndex: 'account_type',
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            render: (_, record) => {
                const action = record?.action.toLowerCase()
                const color = action == 'created' ? 'green' : action == 'updated' ? 'blue' : 'red'
                return <Tag color={color}>{firstLetterCapitalize(record?.action)}</Tag>
            }
        },
        {
            title: 'Module',
            key: 'module_name',
            dataIndex: 'module_name',
            render: (_, record) => {
                const module = record?.module_name.split('\\')
                return module[module.length - 1]
            }
        },
        {
            title: 'Payload',
            key: 'payload',
            dataIndex: 'payload',
            render: (_, record) => {
                const payloadLists = []
                const payload = Object.entries(record?.payload)
                for (let i = 0; i < payload?.length; i++) {
                    const [k, v] = payload[i] as any
                    payloadLists.push(
                        <div key={k + v} style={{ display: 'flex', gap: 5 }}>
                            <b>{firstLetterCapitalize(k)}</b>:
                            <div>{v}</div>
                        </div>
                    )
                }
                return payloadLists
            }
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<AuditLogsRes>(ADMINSETTINGS.AUDITLOGS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            })
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

    return (
        <Card title='Audit Logs'>
            <TabHeader
                name='audit logs'
                handleSearch={handleSearch}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
        </Card>
    )
}
