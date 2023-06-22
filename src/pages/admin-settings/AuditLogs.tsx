import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Modal, Divider, Row, Typography, Form as AntDForm, Space, DatePicker, Skeleton, Tag } from 'antd'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import dayjs from 'dayjs'
import { useAuthContext } from '../../shared/contexts/Auth'
import { Table, Card, TabHeader } from "../../components"
import { useAxios } from '../../shared/lib/axios'
import { ADMINSETTINGSPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IAuditLogs, AuditLogsRes, TableParams } from '../../shared/interfaces'
import { firstLetterCapitalize } from '../../shared/utils/utilities'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET } = useAxios()
const [{ ADMINSETTINGS }] = useEndpoints()

export default function AuditLogs() {
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<IAuditLogs[]>([])
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [isModalDownload, setIsModalDownload] = useState(false)

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])
    useEffect(function () {
        if (!loadingUser && !codes['ic01']) return
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [loadingUser, codes])

    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['ic01']) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<IAuditLogs> = [
        {
            title: 'User',
            key: 'user_full_name',
            dataIndex: 'user_full_name',
            width: 120,
        },
        {
            title: 'Account Type',
            key: 'account_type',
            dataIndex: 'account_type',
            width: 120,
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
            width: 120,
            align: 'center'
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            render: (_, record) => {
                const action = record?.action.toLowerCase()
                const color = action == 'created' ? 'green' : action == 'updated' ? 'blue' : 'red'
                return <Tag color={color}>{firstLetterCapitalize(record?.action)}</Tag>
            },
            width: 120,
            align: 'center'
        },
        {
            title: 'Module',
            key: 'module_name',
            dataIndex: 'module_name',
            render: (_, record) => {
                const module = record?.module_name.split('\\')
                return module[module.length - 1]
            },
            width: 150,
            align: 'center'
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
            },
            align: 'center',
            width: 300,
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
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

    return (
        <Card title='Audit Logs'>
            <TabHeader
                handleSearch={handleSearch}
            >
                {/* <Button type='primary' onClick={() => setIsModalDownload(true)}>Download</Button> */}
            </TabHeader>
            <Table
                loading={loading}
                columns={columns}
                dataList={Object.values(data)}
                tableParams={tableParams}
                onChange={onChange}
            />
            <AuditLogDownload
                isModalDownload={isModalDownload}
                handleClose={() => setIsModalDownload(false)}
            />
        </Card>
    )
}
const { Item: FormItem, useForm } = AntDForm
const { Title } = Typography

const dateVal = [dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD'), dayjs(dayjs().format('YYYY-MM-DD'), 'YYYY-MM-DD')]

function AuditLogDownload({ isModalDownload, handleClose }: { isModalDownload: boolean; handleClose: () => void; }) {
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<any>(dateVal)

    function handleDownload() {
        setLoading(true)
        const from = dayjs(date[0]).format('YYYY-MM-DD')
        const to = dayjs(date[1]).format('YYYY-MM-DD')
        const link = document.createElement('a');
        link.href = `${ADMINSETTINGS.AUDITLOGS.DOWNLOAD}?from=${from}&to=${to}`;
        link.target = '_blank';

        // Trigger the download
        link.click();
        setLoading(false)

    }

    return (
        <Modal title='Download - Tasks' open={isModalDownload} onCancel={handleClose} footer={null} forceRender>
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
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button id='download' type="primary" loading={loading} disabled={loading} onClick={handleDownload}>
                        Download
                    </Button>
                    <Button id='cancel' type="primary" onClick={handleClose} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Modal>
    )
}