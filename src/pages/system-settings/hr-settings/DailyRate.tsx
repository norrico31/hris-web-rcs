import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Switch } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
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

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IDailyRate> = [
        {
            title: 'Daily Rate Code',
            key: 'daily_rate_code',
            dataIndex: 'daily_rate_code',
        },
        {
            title: 'Daily Rate Name',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Daily rate per Hour',
            key: 'daily_rate_per_hour',
            dataIndex: 'daily_rate_per_hour',
        },
        {
            title: 'Overtime Rate per Hour',
            key: 'overtime_rate_per_hour',
            dataIndex: 'overtime_rate_per_hour',
        },
        {
            title: 'Night Differential Rate per Hour',
            key: 'night_diff_rate_per_hour',
            dataIndex: 'night_diff_rate_per_hour',
        },
        {
            title: 'Night Differential Rate per Hour (OVERTIME)',
            key: 'night_diff_rate_per_hour',
            dataIndex: 'night_diff_rate_per_hour',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Active',
            key: 'is_active',
            dataIndex: 'is_active',
            render: (_, record) => record?.is_active ? 'ACTIVE' : 'INACTIVE'
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: IDailyRate) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<DailyRateRes>(HRSETTINGS.DAILYRATE.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.DAILYRATE.DELETE, id)
            .finally(fetchData)
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
        <Card title='Daily Rates'>
            <TabHeader
                name='daily rate'
                handleSearchData={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <DailyRateModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
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

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, is_active: Number(selectedData.is_active) })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IDailyRate) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.DAILYRATE.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.DAILYRATE.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Daily Rate`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Daily Rate Code"
                name="daily_rate_code"
                required
                rules={[{ required: true, message: 'Please enter code!' }]}
            >
                <Input placeholder='Enter code...' />
            </FormItem>
            <FormItem
                label="Daily Rate Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter daily rate name!' }]}
            >
                <Input placeholder='Enter daily rate name...' />
            </FormItem>

            <FormItem
                label="Daily rate per Hour"
                name="daily_rate_per_hour"
            >
                <Input type='number' placeholder='Enter rate...' />
            </FormItem>
            <FormItem
                label="Overtime Rate per Hour"
                name="overtime_rate_per_hour"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                label="Night Differential Rate per Hour"
                name="night_diff_rate_per_hour"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
            </FormItem>
            <FormItem
                label="Night Differential Overtime Rate per Hour"
                name="night_diff_ot_rate_per_hour"
            >
                <Input type='number' placeholder='Enter overtime rate hour...' />
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
                    <Button type="primary" htmlType="submit">
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}