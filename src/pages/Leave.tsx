import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Card as AntDCard, Typography, Select, Skeleton, Row, Col, TimePicker, Popconfirm } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { AiOutlineCalendar } from 'react-icons/ai'
import { FcApproval } from 'react-icons/fc'
import { RxCross2 } from 'react-icons/rx'
import { Form, Card, TabHeader, Table } from '../components'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { firstLetterCapitalize, renderTitle } from '../shared/utils/utilities'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { rootPaths, useEndpoints } from '../shared/constants'
import { IArguments, ILeave, ILeaveDuration, ILeaveType, LeaveRes, TableParams } from '../shared/interfaces'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'

const { GET, POST, PUT } = useAxios()
const [{ LEAVES, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function Leave() {
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
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, rootPaths), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['c01', 'c02', 'c03', 'c04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    const columns: ColumnsType<ILeave> = [
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
    ];
    (leaveType == 'all' || leaveType == 'approved' || leaveType == 'reject') && columns.push({
        title: 'Approved By',
        key: 'approved_by',
        dataIndex: 'approved_by',
        render: (_: any, record: ILeave) => record.actioned_by?.full_name,
        width: 150
    });
    (user?.role.name.toLowerCase() == 'manager' || user?.role.name.toLowerCase() == 'admin') && columns.push({
        title: 'Approval',
        key: 'approver',
        dataIndex: 'approver',
        align: 'center',
        render: (_: any, record: ILeave) => {
            return <Space>
                <Popconfirm
                    title={`Leave request by - ${record?.user?.full_name}`}
                    description={`Are you sure you want to approve ${record?.reason}?`}
                    onConfirm={() => leaveApproval(`approve/${record?.id}`)}
                    okText="Approve"
                    cancelText="Cancel"
                    disabled={record?.status.toLowerCase() == 'approved'}
                >
                    <Button id='approve' size='middle' disabled={record?.status.toLowerCase() == 'approved'} onClick={() => null} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                        <FcApproval />
                        Approve
                    </Button>
                </Popconfirm>
                <Popconfirm
                    title={`Leave request by - ${record?.user?.full_name}`}
                    description={`Are you sure you want to reject ${record?.reason}?`}
                    onConfirm={() => leaveApproval(`reject/${record?.id}`)}
                    okText="Reject"
                    cancelText="Cancel"
                    disabled={record?.status.toLowerCase() == 'approved'}
                >
                    <Button id='reject' size='middle' disabled={record?.status.toLowerCase() == 'approved'} onClick={() => null} style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                        <RxCross2 />
                        Reject
                    </Button>
                </Popconfirm>
            </Space>
        },
        width: 250
    })

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        let isManager: 'false' | 'true' = (user?.role.name.toLowerCase() == 'manager' || user?.role.name.toLowerCase() == 'admin') ? 'true' : 'false';
        const url = LEAVES.GET + isManager + status
        console.log('type: ', type)
        console.log('leaveType: ', leaveType)
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

    function leaveApproval(url: string) {
        setLoading(true)
        POST(LEAVES.POST + url, {})
            .then((res) => {
                console.log(res)
                alert('')
            })
            .catch((err) => console.log('error ng pag approval: ', err))
            .catch(() => {
                setLoading(false)
                fetchData({})
            })
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: leaveType })

    return (
        <>
            <AntDCard
                bordered={false}
                title={<Typography.Title level={2}>Leave</Typography.Title>}
                extra={<Button type='primary' size="large" onClick={() => setIsModalOpen(true)}>
                    <Space>
                        Request
                        <AiOutlineCalendar />
                    </Space>
                </Button>}
            >
                <TabHeader handleSearch={setSearch}>
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
                <Card title={`Leave - ${firstLetterCapitalize(leaveType)}`} level={5}>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataList={data}
                        tableParams={tableParams}
                        onChange={onChange}
                    />
                </Card>
            </AntDCard>
            <LeaveModal
                leaveType={leaveType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
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

function LeaveModal({ leaveType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<ILeave>()
    const [loading, setLoading] = useState(false)
    const [lists, setLists] = useState<{ leaveTypes: ILeaveType[]; leaveDurations: ILeaveDuration[] }>({ leaveTypes: [], leaveDurations: [] })

    useEffect(() => {
        if (selectedData) {
            form.setFieldsValue({ ...selectedData })
        } else form.resetFields()

        const controller = new AbortController();
        (async () => {
            try {
                const leaveTypePromise = axiosClient(HRSETTINGS.LEAVETYPE.LISTS, { signal: controller.signal })
                const leaveDurationPromise = axiosClient(HRSETTINGS.LEAVEDURATION.LISTS, { signal: controller.signal })
                const [leaveTypeRes, leaveDurationRes,] = await Promise.allSettled([leaveTypePromise, leaveDurationPromise]) as any
                setLists({
                    leaveTypes: leaveTypeRes?.value?.data ?? [],
                    leaveDurations: leaveDurationRes?.value?.data ?? [],
                })
            } catch (error) {
                console.error('error fetching clients: ', error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish({ date_end, date_start, ...restProps }: ILeave) {
        // let { date, description, ...restProps } = values
        date_start = dayjs(date_start).format('YYYY/MM/DD') as any
        date_end = dayjs(date_end).format('YYYY/MM/DD') as any
        restProps = { ...restProps, date_start, date_end } as any
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
                    {lists.leaveTypes.map((leave) => (
                        <Select.Option value={leave.id} key={leave.id} style={{ color: '#777777' }}>{leave?.type}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem
                label="Leave Duration"
                name="leave_duration_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select leave duration...' optionFilterProp="children" allowClear showSearch>
                    {lists.leaveDurations.map((leave) => (
                        <Select.Option value={leave.id} key={leave.id} style={{ color: '#777777' }}>{leave.name}</Select.Option>
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