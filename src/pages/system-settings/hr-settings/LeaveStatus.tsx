import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, ILeaveStatuses, LeaveStatusesRes, TableParams } from '../../../shared/interfaces'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function LeaveStatuses() {
    const [data, setData] = useState<ILeaveStatuses[]>([])
    const [selectedData, setSelectedData] = useState<ILeaveStatuses | undefined>(undefined)
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

    const columns: ColumnsType<ILeaveStatuses> = [
        {
            title: 'Leave Status',
            key: 'name',
            dataIndex: 'name',
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
            render: (_: any, record: ILeaveStatuses) => <Action
                title='leave status'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        GET<LeaveStatusesRes>(HRSETTINGS.LEAVESTATUSES.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const handleChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.LEAVESTATUSES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ILeaveStatuses) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Leave Status'>
            <TabHeader
                name='status'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={handleChange}
            />
            <LeaveStatusesModal
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
    selectedData?: ILeaveStatuses
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function LeaveStatusesModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<ILeaveStatuses>()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ILeaveStatuses) {
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.LEAVESTATUSES.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.LEAVESTATUSES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Leave Status`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Leave Status Name"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter leave status name!' }]}
            >
                <Input placeholder='Enter leave status name...' />
            </FormItem>

            <FormItem
                name="description"
                label="Description"
                required
                rules={[{ required: true, message: 'Please enter description!' }]}
            >
                <Input placeholder='Enter Description...' />
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