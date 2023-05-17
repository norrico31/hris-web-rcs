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
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { IArguments, IOvertime, OvertimeRes, TableParams } from '../shared/interfaces'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'

const { GET, POST, PUT } = useAxios()
const [{ OVERTIME, SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function Overtime() {
    renderTitle('Overtime')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [OvertimeType, setOvertimeType] = useState('all')
    const [data, setData] = useState<IOvertime[]>([])
    const [selectedData, setSelectedData] = useState<IOvertime | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['c01', 'c02', 'c03', 'c04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    // TODO: add actions for edit delete
    const columns: ColumnsType<IOvertime> = [
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        // {
        //     title: 'Overtime Type',
        //     key: 'Overtime_type',
        //     dataIndex: 'Overtime_type',
        //     width: 120,
        //     render: (_, record) => record.Overtime_type?.name ?? '-',
        //     align: 'center'
        // },
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
    (OvertimeType == 'all' || OvertimeType == 'approved' || OvertimeType == 'reject') && columns.push({
        title: 'Approver',
        key: 'approved_by',
        dataIndex: 'approved_by',
        render: (_: any, record: IOvertime) => record.actioned_by?.full_name,
        width: 150
    });
    (user?.role.name.toLowerCase() == 'manager' || user?.role.name.toLowerCase() == 'admin') && columns.push({
        title: 'For Approval',
        key: 'approver',
        dataIndex: 'approver',
        align: 'center',
        render: (_: any, record: IOvertime) => {
            return <Space>
                <Popconfirm
                    title={`Overtime request by - ${record?.user?.full_name}`}
                    description={`Are you sure you want to approve ${record?.reason}?`}
                    onConfirm={() => OvertimeApproval(`approve/${record?.id}`)}
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
                    title={`Overtime request by - ${record?.user?.full_name}`}
                    description={`Are you sure you want to reject ${record?.reason}?`}
                    onConfirm={() => OvertimeApproval(`reject/${record?.id}`)}
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

    function fetchData(args: IArguments) {
        setLoading(true)
        GET<OvertimeRes>(OVERTIME.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                console.log(res)
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

    function OvertimeApproval(url: string) {
        setLoading(true)
        POST(OVERTIME.POST + url, {})
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    return (
        <>
            <AntDCard
                bordered={false}
                title={<Typography.Title level={2}>Overtime</Typography.Title>}
                extra={<Button type='primary' size="large" onClick={() => setIsModalOpen(true)}>
                    <Space>
                        Request
                        <AiOutlineCalendar />
                    </Space>
                </Button>}
            >
                <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                />
            </AntDCard>
            <OvertimeModal
                OvertimeType={OvertimeType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}


type ModalProps = {
    OvertimeType: string
    fetchData(args?: IArguments): void
    selectedData?: IOvertime
    isModalOpen: boolean
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function OvertimeModal({ OvertimeType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IOvertime>()
    const [loading, setLoading] = useState(false)
    // const [lists, setLists] = useState<{ OvertimeTypes: IOvertimeType[]; OvertimeDurations: IOvertimeDuration[] }>({ OvertimeTypes: [], OvertimeDurations: [] })

    // useEffect(() => {
    //     if (selectedData) {
    //         form.setFieldsValue({ ...selectedData })
    //     } else form.resetFields()

    //     const controller = new AbortController();
    //     (async () => {
    //         try {
    //             const OvertimeTypePromise = axiosClient(HRSETTINGS.OvertimeTYPE.LISTS, { signal: controller.signal })
    //             const OvertimeDurationPromise = axiosClient(HRSETTINGS.OvertimeDURATION.LISTS, { signal: controller.signal })
    //             const [OvertimeTypeRes, OvertimeDurationRes,] = await Promise.allSettled([OvertimeTypePromise, OvertimeDurationPromise]) as any
    //             setLists({
    //                 OvertimeTypes: OvertimeTypeRes?.value?.data ?? [],
    //                 OvertimeDurations: OvertimeDurationRes?.value?.data ?? [],
    //             })
    //         } catch (error) {
    //             console.error('error fetching clients: ', error)
    //         }
    //     })()
    //     return () => {
    //         controller.abort()
    //     }
    // }, [selectedData])

    function onFinish({ date_end, date_start, ...restProps }: IOvertime) {
        date_start = dayjs(date_start).format('YYYY/MM/DD') as any
        date_end = dayjs(date_end).format('YYYY/MM/DD') as any
        restProps = { ...restProps, date_start, date_end } as any
        let result = selectedData ? PUT(OVERTIME.PUT + selectedData?.id, { ...restProps, id: selectedData.id }) : POST(OVERTIME.POST, restProps)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title='Request a Overtime' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            {/* <FormItem
                label="Overtime Type"
                name="Overtime_type_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select Overtime type...' optionFilterProp="children" allowClear showSearch>
                    {lists.OvertimeTypes.map((Overtime) => (
                        <Select.Option value={Overtime.id} key={Overtime.id} style={{ color: '#777777' }}>{Overtime?.type}</Select.Option>
                    ))}
                </Select>
            </FormItem>
            <FormItem
                label="Overtime Duration"
                name="Overtime_duration_id"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select placeholder='Select Overtime duration...' optionFilterProp="children" allowClear showSearch>
                    {lists.OvertimeDurations.map((Overtime) => (
                        <Select.Option value={Overtime.id} key={Overtime.id} style={{ color: '#777777' }}>{Overtime.name}</Select.Option>
                    ))}
                </Select>
            </FormItem> */}
            <Row justify='space-around'>
                <FormItem
                    label="Start Date"
                    name="date"
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
                    name="planned_ot_start"
                    required
                    rules={[{ required: true, message: '' }]}
                >

                    <TimePicker value={dayjs('00:00:00', 'HH:mm:ss')} />
                </FormItem>
                <FormItem
                    label="End Time"
                    name="planned_ot_end"
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