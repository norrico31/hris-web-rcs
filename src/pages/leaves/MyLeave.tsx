import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Select, Skeleton, Row, TimePicker, Popconfirm } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { Form, Card, TabHeader, Table, Action } from '../../components'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, ILeaveDuration, ILeaveType, LeaveRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ LEAVES, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function MyLeave() {
    renderTitle('Leave')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [leaveType, setLeaveType] = useState('all')
    const [data, setData] = useState<ILeave[]>([])
    const [selectedData, setSelectedData] = useState<ILeave | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        if (user != undefined) fetchData({
            args: {
                signal: controller.signal, search,
                page: tableParams?.pagination?.current,
                pageSize: tableParams?.pagination?.pageSize,
            },
            type: leaveType
        })
        return () => {
            controller.abort()
        }
    }, [user, search])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['c01', 'c02', 'c03', 'c04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<ILeave> = [
        // {
        //     title: 'Name',
        //     key: 'full_nam,e',
        //     dataIndex: 'full_nam,e',
        //     render: (_, record) => record?.user?.full_name ?? '-',
        //     width: 150,
        // },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Leave Type',
            key: 'leave_type',
            dataIndex: 'leave_type',
            width: 120,
            render: (_, record) => record.leave_type?.name ?? '-',
            align: 'center'
        },
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 120,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Date End',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 120,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        {
            title: 'Time Start',
            key: 'time_start',
            dataIndex: 'time_start',
            width: 120
        },
        {
            title: 'Time End',
            key: 'time_end',
            dataIndex: 'time_end',
            width: 120
        },
        {
            title: 'Reason',
            key: 'reason',
            dataIndex: 'reason',
            width: 250,
            align: 'center'
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: ILeave) => <Action
                title='Tasks'
                name={record?.user?.full_name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />,
            width: 150
        },
    ];
    // (leaveType == 'all' || leaveType == 'approved' || leaveType == 'reject') && columns.push({
    //     title: 'Approver',
    //     key: 'approved_by',
    //     dataIndex: 'approved_by',
    //     render: (_: any, record: ILeave) => record.actioned_by?.full_name,
    //     width: 150
    // });

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = LEAVES.GET + 'false' + status
        GET<LeaveRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    function handleDelete(id: string) {
        DELETE(LEAVES.DELETE, id)
            .finally(() => fetchData({ type: leaveType }))
    }

    function handleEdit(data: ILeave) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: leaveType })

    return (
        <>
            <TabHeader handleSearch={setSearch} handleCreate={() => setIsModalOpen(true)}>
                <Select value={leaveType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
                    setLeaveType((str == undefined || str == '') ? 'all' : str)
                    fetchData({
                        args: {
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize
                        },
                        type: (str == undefined || str == '') ? 'all' : str
                    })
                }} style={{ width: 150 }}>
                    <Select.Option value='all'>All</Select.Option>
                    <Select.Option value='pending'>Pending</Select.Option>
                    <Select.Option value='approved'>Approved</Select.Option>
                    <Select.Option value='reject'>Rejected</Select.Option>
                </Select>
            </TabHeader>
            <Card title={`My Leaves - ${firstLetterCapitalize(leaveType)}`} level={5}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                />
            </Card>
            <LeaveModal
                leaveType={leaveType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                selectedData={selectedData}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}

type ModalProps = {
    leaveType: string
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
    selectedData?: ILeave
    isModalOpen: boolean
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

export function LeaveModal({ leaveType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<ILeave>()
    const [loading, setLoading] = useState(false)
    const [lists, setLists] = useState<ILeaveType[]>([])

    useEffect(() => {
        if (selectedData) {
            form.setFieldsValue({ ...selectedData })
        } else form.resetFields()

        const controller = new AbortController();
        axiosClient(HRSETTINGS.LEAVETYPE.LISTS, { signal: controller.signal })
            .then((res) => setLists(res?.data ?? []))
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish({ date_end, date_start, time_start, time_end, ...restProps }: ILeave) {
        date_start = dayjs(date_start).format('YYYY/MM/DD') as any
        date_end = dayjs(date_end).format('YYYY/MM/DD') as any
        time_start = dayjs(time_start).format('HH:MM')
        time_end = dayjs(time_end).format('HH:MM')
        restProps = { ...restProps, date_start, date_end, time_start, time_end } as any
        let result = selectedData ? PUT(LEAVES.PUT + selectedData?.id, { ...restProps, id: selectedData.id }) : POST(LEAVES.POST, restProps)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData({ type: leaveType })
            setLoading(false)
        })
    }

    return <Modal title='Request a Leave' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Leave Type"
                name="leave_type_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select leave type...' optionFilterProp="children" allowClear showSearch>
                    {lists.map((leave) => (
                        <Select.Option value={leave.id} key={leave.id} style={{ color: '#777777' }}>{leave?.type}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <Row justify='space-around'>
                <FormItem
                    label="Start Date"
                    name="start_date"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
                <FormItem
                    label="End Date"
                    name="end_date"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
            </Row>
            <Row justify='space-around'>
                <FormItem
                    label="Start Time"
                    name="time_start"
                    required
                    rules={[{ required: true, message: '' }]}
                >

                    <TimePicker value={dayjs('00:00:00', 'HH:mm:ss')} />
                </FormItem>
                <FormItem
                    label="End Time"
                    name="time_end"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <TimePicker value={dayjs('00:00:00', 'HH:mm:ss')} />
                </FormItem>
            </Row>
            <FormItem
                label="Reason"
                name="reason"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input.TextArea placeholder='Enter reason...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        Submit Request
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}