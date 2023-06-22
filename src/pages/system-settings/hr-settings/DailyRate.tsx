import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Switch, Popconfirm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { BiRefresh } from 'react-icons/bi'
import useMessage from 'antd/es/message/useMessage'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { DailyRateRes, IArguments, IDailyRate, TableParams } from '../../../shared/interfaces'
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function DailyRate() {
    const [data, setData] = useState<IDailyRate[]>([])
    const [selectedData, setSelectedData] = useState<IDailyRate | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isArchive, setIsArchive] = useState(false)
    const [messageApi, contextHolder] = useMessage()
    const key = 'error'

    useEffect(function () {
        const controller = new AbortController();
        fetchData({
            signal: controller.signal,
            search,
            page: isArchive ? 1 : (tableParams?.pagination?.current ?? 1),
            pageSize: tableParams?.pagination?.pageSize,
            isArchive
        })
        return () => {
            controller.abort()
        }
    }, [isArchive, search])

    const columns: ColumnsType<IDailyRate> = [
        {
            title: 'Daily Rate Code',
            key: 'daily_rate_code',
            dataIndex: 'daily_rate_code',
            width: 120
        },
        {
            title: 'Daily Rate Name',
            key: 'name',
            dataIndex: 'name',
            width: 200
        },
        {
            title: 'Daily rate per Hour',
            key: 'daily_rate_per_hour',
            dataIndex: 'daily_rate_per_hour',
            width: 200
        },
        {
            title: 'Overtime Rate per Hour',
            key: 'overtime_rate_per_hour',
            dataIndex: 'overtime_rate_per_hour',
            width: 200
        },
        {
            title: 'Night Differential Rate per Hour',
            key: 'night_diff_rate_per_hour',
            dataIndex: 'night_diff_rate_per_hour',
            width: 200
        },
        {
            title: 'Night Differential Rate per Hour (OVERTIME)',
            key: 'night_diff_ot_rate_per_hour',
            dataIndex: 'night_diff_ot_rate_per_hour',
            width: 200
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
            width: 120
        },
        {
            title: 'Active',
            key: 'is_active',
            dataIndex: 'is_active',
            render: (_, record) => Number(record?.is_active) ? 'ACTIVE' : 'INACTIVE',
            width: 120
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: IDailyRate) => !isArchive ? <Action
                title='daily rate'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            /> : <Popconfirm
                title={`Restore daily rate`}
                description={`Are you sure you want to restore ${record?.name}?`}
                onConfirm={() => {
                    GET(HRSETTINGS.DAILYRATE.RESTORE + record?.id)
                        .then((res) => console.log(res))
                        .finally(() => fetchData({
                            search,
                            page: tableParams?.pagination?.current ?? 1,
                            pageSize: tableParams?.pagination?.pageSize,
                            isArchive
                        }))
                }}
                okText="Restore"
                cancelText="Cancel"
            >
                <Button id='restore' type='primary' size='middle' onClick={() => null}>
                    <Space align='center'>
                        <BiRefresh />
                        Restore
                    </Space>
                </Button>
            </Popconfirm>,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        let url = args?.isArchive ? (HRSETTINGS.DAILYRATE.GET + '/archives') : HRSETTINGS.DAILYRATE.GET;
        GET<DailyRateRes>(url, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize!, isArchive })

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.DAILYRATE.DELETE, id)
            .catch((err) => {
                messageApi.open({
                    key,
                    type: 'error',
                    content: err?.response?.data?.message,
                    duration: 3
                })
            })
            .finally(() => fetchData({
                search,
                page: tableParams?.pagination?.current ?? 1,
                pageSize: tableParams?.pagination?.pageSize,
                isArchive
            }))
    }

    function handleEdit(data: IDailyRate) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title={`Daily Rates ${isArchive ? '- Archives' : ''}`}>
            {contextHolder}
            <TabHeader
                handleSearch={setSearch}
                handleCreate={!isArchive ? () => setIsModalOpen(true) : undefined}
                handleModalArchive={!isArchive ? () => setIsArchive(true) : undefined}
            >
                {isArchive ? <Button onClick={() => setIsArchive(false)}>Back to daily rates</Button> : null}
            </TabHeader>
            {!isArchive ? (
                <>
                    <Table
                        loading={loading}
                        columns={columns}
                        dataList={data}
                        tableParams={tableParams}
                        onChange={onChange}
                    />
                    <DailyRateModal
                        title={selectedData != undefined ? 'Update' : 'Create'}
                        selectedData={selectedData}
                        isModalOpen={isModalOpen}
                        handleCancel={handleCloseModal}
                        fetchData={fetchData}
                    />
                </>
            ) : (<Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />)}
        </Card>
    )
}


interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: IDailyRate
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function DailyRateModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IDailyRate>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IDailyRate) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.DAILYRATE.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.DAILYRATE.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Daily Rate`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Daily Rate Code"
                name="daily_rate_code"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter code...' />
            </FormItem>
            <FormItem
                label="Daily Rate Name"
                name="name"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input placeholder='Enter daily rate name...' />
            </FormItem>
            <FormItem
                label="Daily rate per Hour"
                name="daily_rate_per_hour"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input type='number' placeholder='Enter daily rate per hour...' />
            </FormItem>
            <FormItem
                label="Overtime Rate per Hour"
                name="overtime_rate_per_hour"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                label="Night Differential Rate per Hour"
                name="night_diff_rate_per_hour"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input type='number' placeholder='Enter night differential rate per hour...' />
            </FormItem>
            <FormItem
                label="Night Differential Overtime Rate per Hour"
                name="night_diff_ot_rate_per_hour"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <Input type='number' placeholder='Enter night differential overtime rate per hour...' />
            </FormItem>
            <FormItem
                label="Active"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
            >
                <Switch />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
                <Input.TextArea placeholder='Enter Description...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}