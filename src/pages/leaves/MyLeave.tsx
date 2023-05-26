import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Select, Skeleton, Row, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import useMessage from 'antd/es/message/useMessage'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Form, Card, TabHeader, Table, Action } from '../../components'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, ILeave, ILeaveType, LeaveRes, TableParams } from '../../shared/interfaces'
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

        {
            title: 'Submitted On',
            key: 'created_at',
            dataIndex: 'created_at',
            render: (_, record) => new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
            width: 150,
            align: 'center'
        },
        {
            title: 'Leave Type',
            key: 'leave_type',
            dataIndex: 'leave_type',
            width: 150,
            render: (_, record) => record.leave_type?.type ?? '-',
            align: 'center'
        },
        {
            title: 'Leave Start Requested',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 300,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Leave End Requested',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 300,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        // {
        //     title: 'Time Start',
        //     key: 'time_start',
        //     dataIndex: 'time_start',
        //     width: 120
        // },
        // {
        //     title: 'Time End',
        //     key: 'time_end',
        //     dataIndex: 'time_end',
        //     width: 120
        // },
        {
            title: 'Requested Leave Duration',
            key: 'leave_duration',
            dataIndex: 'leave_duration',
            render: (_, record) => record?.leave_durations?.name,
            width: 250,
            align: 'center'
        },
        // {
        //     title: 'Reason',
        //     key: 'reason',
        //     dataIndex: 'reason',
        //     width: 250,
        //     align: 'center'
        // },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
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
                isDisable={record?.status.toLowerCase() === 'approved' || record?.status.toLowerCase() === 'rejected'}
            />,
            width: 150
        },
    ]

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

    function closeModal() {
        setIsModalOpen(false)
        setSelectedData(undefined)
    }

    return (
        <>
            <TabHeader handleSearch={setSearch} handleCreate={() => setIsModalOpen(true)} isRequest>
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
                handleCancel={closeModal}
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
    const [messageApi, contextHolder] = useMessage()
    const key = 'error'

    useEffect(() => {
        if (selectedData) {
            const timeStart = selectedData?.time_start?.toString()?.split(' ')[0]
            const timeEnd = selectedData?.time_end?.toString()?.split(' ')[0]
            form.setFieldsValue({
                ...selectedData,
                date_start: selectedData?.date_start ? dayjs(selectedData?.date_start, 'YYYY/MM/DD') : null,
                date_end: selectedData?.date_end ? dayjs(selectedData?.date_end, 'YYYY/MM/DD') : null,
                time_start: selectedData?.time_start ? dayjs(timeStart, 'HH:mm') : null,
                time_end: selectedData?.time_end ? dayjs(timeEnd, 'HH:mm') : null,
            })
        } else form.resetFields()

        const controller = new AbortController();
        axiosClient(HRSETTINGS.LEAVETYPE.LISTS, { signal: controller.signal })
            .then((res) => setLists(res?.data ?? []))
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function cancelRequest() {
        setLoading(true)
        GET(LEAVES.CANCEL + selectedData?.id)
            .then((res) => {
                form.resetFields()
                handleCancel()
            })
            .finally(() => {
                fetchData({ type: leaveType })
                setLoading(false)
            })
    }

    function onFinish({ date_end, date_start, time_start, time_end, ...restProps }: ILeave) {
        setLoading(true)
        date_start = dayjs(date_start).format('YYYY/MM/DD') as any
        date_end = dayjs(date_end).format('YYYY/MM/DD') as any
        time_start = dayjs(time_start).format('LT')
        time_end = dayjs(time_end).format('LT')
        restProps = { ...restProps, date_start, date_end, time_start, time_end } as any
        setLoading(true)
        let result = selectedData ? PUT(LEAVES.PUT + selectedData?.id, { ...restProps, id: selectedData.id }) : POST(LEAVES.POST, restProps)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).catch((err) => messageApi.open({
            key,
            type: 'error',
            content: err?.response?.data?.message,
            duration: 5
        })).finally(() => {
            fetchData({ type: leaveType })
            setLoading(false)
        })
    }

    return <Modal title='Request a Leave' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
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
                    name="date_start"
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
                    name="date_end"
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

                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format="h:mm a" />
                </FormItem>
                <FormItem
                    label="End Time"
                    name="time_end"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format="h:mm a" />
                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format='h:mm a' />
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
            <Row justify={selectedData ? 'space-between' : 'end'}>
                {selectedData && (
                    <Button className='btn-secondary' loading={loading} disabled={loading} onClick={cancelRequest}>
                        Cancel Request
                    </Button>
                )}
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        Submit Request
                    </Button>
                    {/* <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button> */}
                </Space>
            </Row>
        </Form>
    </Modal>
}