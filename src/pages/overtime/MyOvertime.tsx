import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Form as AntDForm, Modal, Space, Input, DatePicker, Select, Skeleton, Row, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Form, Card, TabHeader, Table } from '../../components'
import { firstLetterCapitalize, renderTitle } from '../../shared/utils/utilities'
import { useAxios } from '../../shared/lib/axios'
import { ROOTPATHS, useEndpoints } from '../../shared/constants'
import { IArguments, IOvertime, OvertimeRes, TableParams } from '../../shared/interfaces'
import { useAuthContext } from '../../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../../components/layouts/Sidebar'

const { GET, POST, PUT } = useAxios()
const [{ OVERTIME }] = useEndpoints()

dayjs.extend(localizedFormat)

export default function MyOvertime() {
    renderTitle('Overtime')
    const { user, loading: loadingUser } = useAuthContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [overtimeType, setOvertimeType] = useState('all')
    const [data, setData] = useState<IOvertime[]>([])
    const [selectedData, setSelectedData] = useState<IOvertime | undefined>(undefined)
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
            type: overtimeType
        })
        return () => {
            controller.abort()
        }
    }, [user, search])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['f01', 'f02', 'f03', 'f04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />

    // TODO: add actions for edit delete
    const columns: ColumnsType<IOvertime> = [
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 120,
        },
        {
            title: 'Date Start',
            key: 'date_start',
            dataIndex: 'date_start',
            width: 200,
            render: (_, record) => `${dayjs(record?.date_start).format('MMMM')} ${dayjs(record?.date_start).format('D')}, ${dayjs(record?.date_start).format('YYYY')}`
        },
        {
            title: 'Date End',
            key: 'date_end',
            dataIndex: 'date_end',
            width: 200,
            render: (_, record) => `${dayjs(record?.date_end).format('MMMM')} ${dayjs(record?.date_end).format('D')}, ${dayjs(record?.date_end).format('YYYY')}`
        },
        {
            title: 'Time Start',
            key: 'planned_ot_start',
            dataIndex: 'planned_ot_start',
            width: 150
        },
        {
            title: 'Time End',
            key: 'planned_ot_end',
            dataIndex: 'planned_ot_end',
            width: 150
        },
        {
            title: 'Reason',
            key: 'reason',
            dataIndex: 'reason',
            width: 250,
            align: 'center'
        },
    ];
    // (overtimeType == 'all' || overtimeType == 'approved' || overtimeType == 'reject') && columns.push({
    //     title: 'Approver',
    //     key: 'approved_by',
    //     dataIndex: 'approved_by',
    //     render: (_: any, record: IOvertime) => record.actioned_by?.full_name,
    //     width: 150
    // });

    function fetchData({ type, args }: { args?: IArguments; type?: string }) {
        setLoading(true)
        const status = (type !== 'all') ? `&status=${type?.toUpperCase()}` : ''
        const url = OVERTIME.GET + 'false' + status
        GET<OvertimeRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ args: { page: pagination?.current, search, pageSize: pagination?.pageSize! }, type: overtimeType })

    return (
        <>
            <TabHeader handleSearch={setSearch} handleCreate={() => setIsModalOpen(true)} isRequest>
                <Select value={overtimeType} allowClear showSearch optionFilterProp='children' onChange={(str) => {
                    setOvertimeType((str == undefined || str == '') ? 'all' : str)
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
            <Card title={`My Overtimes - ${firstLetterCapitalize(overtimeType)}`} level={5}>
                <Table
                    loading={loading}
                    columns={columns}
                    dataList={data}
                    tableParams={tableParams}
                    onChange={onChange}
                />
            </Card>
            <OvertimeModal
                overtimeType={overtimeType}
                fetchData={fetchData}
                isModalOpen={isModalOpen}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}

type ModalProps = {
    overtimeType: string
    fetchData({ type, args }: {
        args?: IArguments | undefined;
        type?: string | undefined;
    }): void
    selectedData?: IOvertime
    isModalOpen: boolean
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

export function OvertimeModal({ overtimeType, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IOvertime>()
    const [loading, setLoading] = useState(false)

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

    function onFinish({ date, planned_ot_start,
        planned_ot_end, ...restProps }: IOvertime) {
        date = dayjs(date).format('YYYY-MM-DD')
        planned_ot_start = dayjs(planned_ot_start).format('LT')
        planned_ot_end = dayjs(planned_ot_end).format('LT')
        restProps = { ...restProps } as any
        let result = selectedData ? PUT(OVERTIME.PUT + selectedData?.id, { ...restProps, date, id: selectedData.id, planned_ot_start, planned_ot_end }) : POST(OVERTIME.POST, { ...restProps, date, planned_ot_start, planned_ot_end })
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData({ type: overtimeType })
            setLoading(false)
        })
    }

    return <Modal title='Request a Overtime' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
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