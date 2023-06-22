import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom"
import { Button, Row, Modal, Space, Popconfirm, TablePaginationConfig, DatePicker, DatePickerProps, Skeleton, Switch, Typography, Form as AntDForm, TimePicker, Select } from "antd"
import dayjs, { Dayjs } from "dayjs"
import { AiOutlineEdit } from "react-icons/ai";
import { BsFillTrashFill } from "react-icons/bs";
import { ColumnsType } from "antd/es/table"
import localizedFormat from 'dayjs/plugin/localizedFormat'
import useMessage from "antd/es/message/useMessage";
import { useAuthContext } from "../../shared/contexts/Auth"
import useWindowSize from "../../shared/hooks/useWindowSize";
import { Divider, Form, Table } from "../../components"
import { renderTitle } from "../../shared/utils/utilities"
import axiosClient, { useAxios } from '.././../shared/lib/axios'
import { ADMINSETTINGSPATHS, useEndpoints } from "../../shared/constants"
import { IArguments, ITimeKeeping, IUser, TimeKeepingRes } from "../../shared/interfaces"
import { filterCodes, filterPaths } from "../../components/layouts/Sidebar"

const [{ TIMEKEEPING, ADMINSETTINGS: { USERS } }] = useEndpoints()
const { GET, POST, PUT, DELETE } = useAxios()

dayjs.extend(localizedFormat);
const { Title } = Typography

export default function TimeKeeping() {
    renderTitle('Timekeeping Management')
    const { user, loading: loadingUser } = useAuthContext()
    const [data, setData] = useState<Array<ITimeKeeping>>([])
    const [selectedData, setSelectedData] = useState<ITimeKeeping | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [today] = useState(dayjs().format('YYYY-MM-DD'))
    const [selectedDate, setSelectedDate] = useState(today)
    const { width } = useWindowSize()

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && !codes['r01']) return <Navigate to={'/' + paths[0]} />

    useEffect(() => {
        const controller = new AbortController();
        if (user) fetchData({ date: today, args: { signal: controller.signal } })
    }, [user, today])

    const fetchData = ({ args, date = dayjs().format('YYYY-MM-DD') }: { args?: IArguments; date?: Dayjs | string }) => {
        setLoading(true)
        const query = date === 'Invalid Date' ? '' : ('?from=' + date + '&to=' + date)
        GET<TimeKeepingRes>(TIMEKEEPING.HRMANAGEMENTLISTS + query, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => setData(res?.data ?? [])).finally(() => setLoading(false))
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, pageSize: pagination?.pageSize! }, date: today })

    function handleDelete(id: string) {
        setLoading(true)
        DELETE(TIMEKEEPING.HRMANAGEMENTDELETE, id)
            .finally(() => {
                handleClose()
                fetchData({ date: today })
                setLoading(false)
            })
    }

    function handleEdit(data: ITimeKeeping) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const handleDatePickerChange: DatePickerProps['onChange'] = (date, dateString) => {
        fetchData({ date: dayjs(date).format('YYYY-MM-DD') })
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'))
    }

    function handleClose() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <>
            <Title level={2} style={{ textAlign: width < 500 ? 'center' : 'initial' }}>Timekeeping Management</Title>
            <Row wrap justify='space-between'>
                <DatePicker format='YYYY-MM-DD' defaultValue={dayjs()} onChange={handleDatePickerChange} />
                <Button type='primary' size="large" onClick={() => setIsModalOpen(true)}>
                    Time In/Out
                </Button>
            </Row>
            <Divider />
            <Table
                loading={loading}
                columns={width > 500 ? renderColumns({ handleDelete, handleEdit }) : mobileCol}
                dataList={data}
                isSizeChanger={false}
                onChange={onChange}
            />

            <TimeKeepingModal
                fetchData={fetchData}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleClose={handleClose}
            />
        </>
    )
}

type ModalProps = {
    fetchData: ({ args, date }: {
        args?: IArguments | undefined;
        date?: string | dayjs.Dayjs | undefined;
    }) => void
    selectedData?: ITimeKeeping
    isModalOpen: boolean
    handleClose: () => void
}

const { Item: FormItem, useForm } = AntDForm

function TimeKeepingModal({ selectedData, isModalOpen, handleClose, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const [users, setUsers] = useState<IUser[]>([])
    const key = 'error'
    console.log(selectedData)
    useEffect(() => {
        if (selectedData !== undefined) {
            form.setFieldsValue({
                ...selectedData,
                time_keeping_date: selectedData?.time_keeping_date !== null ? dayjs(selectedData?.time_keeping_date, 'YYYY-MM-DD') : null,
                time_keeping_time: selectedData?.time_keeping_time !== null ? dayjs(selectedData?.time_keeping_time, 'H:i:s') : null,
                is_client_site: selectedData.is_client_site === 1 ? true : false,
                user_id: selectedData.user_id
            })
        } else form.resetFields()
        const controller = new AbortController();
        axiosClient.get(USERS.LISTS, { signal: controller.signal })
            .then((res) => {
                setUsers(res.data)
            })
    }, [selectedData])

    async function onFinish(values: Record<string, any>) {
        setLoading(true)
        const timeKeepingDate = dayjs(values.time_keeping_date).format('YYYY-MM-DD')
        const timeKeepingTime = dayjs(values.time_keeping_time).format('LT')
        const payload = {
            ...values,
            time_keeping_date: timeKeepingDate,
            time_keeping_time: timeKeepingTime,
            is_client_site: values.is_client_site ? '1' : '0',
        }
        try {
            let result = selectedData ? PUT(TIMEKEEPING.HRMANAGEMENTPUT + selectedData?.id, payload) : POST(TIMEKEEPING.HRMANAGEMENTPOST, payload)
            const res = await result
            console.log(res)
            form.resetFields()
            handleClose()
        } catch (err: any) {
            messageApi.open({
                key,
                type: 'error',
                content: err?.response?.data?.message,
                duration: 5
            })
            setLoading(false)
        } finally {
            fetchData({ date: dayjs().format('YYYY-MM-DD') })
            setLoading(false)
        }
    }

    return <Modal title='Timekeeping Request' open={isModalOpen} onCancel={handleClose} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Employee"
                name="user_id"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Select placeholder='Select leave type...' optionFilterProp="children" allowClear showSearch>
                    {users.map((user) => (
                        <Select.Option value={user.id} key={user.id} style={{ color: '#777777' }}>{user?.full_name}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem
                label="Time Type"
                name="type"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Select placeholder='Select time type...' optionFilterProp="children" allowClear showSearch>
                    <Select.Option value='TIME_IN' key='TIME_IN' style={{ color: '#777777' }}>TIME IN</Select.Option>
                    <Select.Option value='TIME_OUT' key='TIME_OUT' style={{ color: '#777777' }}>TIME OUT</Select.Option>
                </Select>
            </FormItem>
            <Row justify='space-around'>
                <FormItem
                    label="Date"
                    name="time_keeping_date"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
                <FormItem
                    label="Time"
                    name="time_keeping_time"
                    required
                    rules={[{ required: true, message: 'Required' }]}
                >
                    <TimePicker value={dayjs('00:00:00', 'HH:mm')} format="h:mm A" />
                </FormItem>
            </Row>
            <Row justify='center'>
                <FormItem
                    label="Client Site"
                    name="is_client_site"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Client Site" unCheckedChildren="WFH" />
                </FormItem>
            </Row>
            <Row justify='end'>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData ? 'Save' : 'Submit'} Request
                    </Button>
                </Space>
            </Row>
        </Form>
    </Modal>
}

const renderColumns = ({ handleEdit, handleDelete }: { handleEdit: (ot: ITimeKeeping) => void; handleDelete: (id: string) => void; }): ColumnsType<ITimeKeeping> => [
    {
        title: 'Employee',
        key: 'user',
        dataIndex: 'user',
        render: (_, record) => record.user?.full_name,
        width: 150
    },
    {
        title: 'Date',
        key: 'time_keeping_date',
        dataIndex: 'time_keeping_date',
        width: 150
    },
    {
        title: 'Schedule',
        key: 'schedule',
        dataIndex: 'schedule',
        width: 150,
        render: (_, record) => record.schedule?.name
    },
    {
        title: 'Time',
        key: 'time_keeping_time',
        dataIndex: 'time_keeping_time',
        width: 150
    },
    {
        title: 'Time Type',
        key: 'type',
        dataIndex: 'type',
        render: (_, record) => record?.type.split('_').join(' ') ?? '-',
        width: 150
    },
    {
        title: 'Client Site',
        key: 'is_client_site',
        dataIndex: 'is_client_site',
        render: (_, record) => record?.is_client_site === 1 ? 'Yes' : 'No',
        width: 150
    },
    {
        title: 'Action',
        key: 'action',
        dataIndex: 'action',
        align: 'center',
        render: (_, record: ITimeKeeping) => <Space>
            <Button id='edit' type='default' size='middle' onClick={() => handleEdit(record)} className='btn-edit' >
                <AiOutlineEdit color='white' />
            </Button>
            <Popconfirm
                title='Delete the selected data?'
                description={`Are you sure you want to delete ${record.time_keeping_date}?`}
                onConfirm={() => handleDelete(record.id!)}
                okText="Delete"
                cancelText="Cancel"
            >
                <Button id='delete' type='primary' size='middle' onClick={() => null}>
                    <BsFillTrashFill />
                </Button>
            </Popconfirm>
        </Space>,
        width: 150
    },
]

const mobileCol: ColumnsType<ITimeKeeping> = [
    {
        title: 'Employee',
        key: 'user',
        dataIndex: 'user',
        render: (_, record) => record?.user.full_name,
        width: 150
    },
    {
        title: 'Date',
        key: 'time_keeping_date',
        dataIndex: 'time_keeping_date',
        width: 150,
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