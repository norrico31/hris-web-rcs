import { useState, useEffect } from 'react';
import { Button, Col, Form as AntDForm, Modal, Space, Input, DatePicker, Tabs as AntDTabs, Card as AntDCard, Typography, Select } from 'antd'
import { Form, Card, TabHeader, Table } from '../components'
import { AiOutlineCalendar } from 'react-icons/ai'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import styled from 'styled-components'
import { firstLetterCapitalize, renderTitle } from '../shared/utils/utilities'
import axiosClient, { useAxios } from '../shared/lib/axios'
import { useEndpoints } from '../shared/constants'
import { IArguments, ILeave, ILeaveDuration, ILeaveType, LeaveRes, TableParams } from '../shared/interfaces'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useAuthContext } from '../shared/contexts/Auth';


const { GET, POST, PUT, DELETE } = useAxios()
const [{ LEAVES, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function Leave() {
    renderTitle('Leave')
    const { user } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [leaveType, setLeaveType] = useState('all')
    const [data, setData] = useState<ILeave[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ args: { signal: controller.signal }, type: leaveType })
        return () => {
            controller.abort()
        }
    }, [])

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
            render: (_, record) => record.leave_type?.name
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
    })

    const fetchData = ({ type, args }: { args?: IArguments; type?: string }) => {
        setLoading(true)
        // TODO
        let isManager: 'false' | 'true' = (user?.role.name.toLowerCase() == 'manager' || user?.role.name.toLowerCase() == 'admin') ? 'true' : 'false'
        const status = (type !== 'all') ? `&status=${type}` : ''
        const url = LEAVES.GET + isManager + status
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

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({
            args: {
                search: str,
                page: tableParams?.pagination?.current ?? 1,
                pageSize: tableParams?.pagination?.pageSize
            }, type: leaveType
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
                <TabHeader handleSearch={handleSearch}>
                    <Select value={leaveType} onChange={(str) => {
                        setLeaveType(str)
                        fetchData({
                            args: {
                                search,
                                page: tableParams?.pagination?.current ?? 1,
                                pageSize: tableParams?.pagination?.pageSize
                            },
                            type: str
                        })
                    }} style={{ width: 150 }}>
                        <Select.Option value='all'>All</Select.Option>
                        <Select.Option value='pending'>Pending</Select.Option>
                        <Select.Option value='approve'>Approved</Select.Option>
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
                isModalOpen={isModalOpen}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}


type ModalProps = {
    isModalOpen: boolean
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function LeaveModal({ isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ILeave>()
    const [lists, setLists] = useState<{ leaveTypes: ILeaveType[]; leaveDurations: ILeaveDuration[] }>({ leaveTypes: [], leaveDurations: [] })

    useEffect(() => {
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
    }, [])

    function onFinish(values: ILeave) {
        // payload (name: loginUser.name, leave_status: 'PENDING')

        // if success
        alert('create not yet done')
        // let { date, description, ...restProps } = values
        // date = dayjs(date, 'YYYY/MM/DD') as any
        // restProps = { ...restProps, date, ...(description != undefined && { description }) } as any
        // console.log(restProps)
        // form.resetFields()
        // handleCancel()
    }

    return <Modal title='Request a Leave' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Leave Type"
                name="leave_type_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select leave type...' optionFilterProp="children" allowClear showSearch>
                    {lists.leaveTypes.map((leave) => (
                        <Select.Option value={leave.id} key={leave.id} style={{ color: '#777777' }}>{leave.name}</Select.Option>
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
                    <Button type="primary" htmlType="submit">
                        Submit Request
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}

function LeaveAdmin() { }
function LeaveEmployee() { }