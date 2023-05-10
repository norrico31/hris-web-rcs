import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm, Select, TimePicker, Row } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { useAxios } from '../../../shared/lib/axios'
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useEndpoints } from '../../../shared/constants'
import { IArguments, TableParams, ISchedules, SchedulesRes, IDepartment } from '../../../shared/interfaces'
import { Alert } from '../../../shared/lib/alert'

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS: { SCHEDULES } } }] = useEndpoints()

export default function Schedules() {
    const [data, setData] = useState<ISchedules[]>([])
    const [selectedData, setSelectedData] = useState<ISchedules | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<ISchedules> = [
        {
            title: 'Schedules',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Time In',
            key: 'time_in',
            dataIndex: 'time_in',
        },
        {
            title: 'Time Out',
            key: 'time_out',
            dataIndex: 'time_out',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: ISchedules) => <Action
                title='Activity'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<SchedulesRes>(SCHEDULES.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
            search: str,
            page: tableParams?.pagination?.current ?? 1,
            pageSize: tableParams?.pagination?.pageSize
        })
    }

    const handleChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(SCHEDULES.DELETE, id)
            .catch(err => Alert.warning('Delete Unsuccessful', err?.response?.data?.message))
            .finally(fetchData)
    }

    function handleEdit(data: ISchedules) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Schedules'>
            <TabHeader
                name='schedule'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={handleChange}
            />
            <ScheduleModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        </Card>
    )
}

interface ModalProps {
    title: string
    isModalOpen: boolean
    selectedData?: ISchedules
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: FormItem, useForm } = AntDForm

dayjs.extend(LocalizedFormat)
dayjs().format('L LT')

function ScheduleModal({ title, selectedData, isModalOpen, fetchData, handleCancel }: ModalProps) {
    const [form] = useForm<ISchedules>()
    const [departments, setDepartments] = useState<IDepartment[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                time_in: dayjs(selectedData.time_in, 'HH:mm:ss'),
                time_out: dayjs(selectedData.time_out, 'HH:mm:ss')
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ISchedules) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, time_in: dayjs(restValues.time_in).format('LTS'), time_out: dayjs(restValues.time_out).format('LTS'), ...(description != undefined && { description }) }
        console.log(restValues)
        let result = selectedData ? PUT(SCHEDULES.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(SCHEDULES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Schedules`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Schedule Name"
                name="name"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter team name...' />
            </FormItem>
            <Row justify='space-around' wrap>
                <FormItem
                    label="Time In"
                    name="time_in"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <TimePicker />
                </FormItem>
                <FormItem
                    label="Time Out"
                    name="time_out"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <TimePicker />
                </FormItem>
            </Row>
            <FormItem name="description" label="Description">
                <Input placeholder='Enter Description...' />
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