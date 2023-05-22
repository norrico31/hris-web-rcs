import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs'
import { Action, Card, Form, TabHeader, Table } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { EmployeeBenefitsRes, IArguments, IBenefits, IEmployeeBenefits, TableParams } from '../../shared/interfaces'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'

const [{ EMPLOYEE201, SYSTEMSETTINGS }] = useEndpoints()
const { GET, PUT, DELETE, POST } = useAxios()

export default function EmployeeBenefits() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployeeBenefits | undefined>(undefined)
    const [data, setData] = useState<IEmployeeBenefits[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tableParams, setTableParams] = useState<TableParams | undefined>()

    useEffect(function fetch() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IEmployeeBenefits> = [
        {
            title: 'Benefit',
            key: 'benefit',
            dataIndex: 'benefit',
            render: (_, record) => record?.benefit.name
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
        },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
        },
        // {
        //     title: 'Description',
        //     key: 'description',
        //     dataIndex: 'description',
        // },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IEmployeeBenefits) => <Action
                title='Activity'
                name={record?.benefit.name}
                onConfirm={() => handleDelete(record?.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<EmployeeBenefitsRes>(EMPLOYEE201.BENEFITS.GET + '?user_id=' + employeeId, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    function handleDelete(id: string) {
        DELETE(EMPLOYEE201.BENEFITS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeBenefits) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Benefits'>
            <TabHeader
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                onChange={onChange}
            />
            <EmployeeBenefitsModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: IEmployeeBenefits
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function EmployeeBenefitsModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const { employeeId } = useEmployeeCtx()
    const [form] = useForm<Record<string, any>>()
    const [lists, setLists] = useState<IBenefits[]>([])

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
            })
        } else {
            form.resetFields(undefined)
        }
        const controller = new AbortController();
        axiosClient(SYSTEMSETTINGS.HRSETTINGS.BENEFITS.LISTS, { signal: controller.signal })
            .then((res) => {
                setLists(res?.data ?? [])
            })

        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: Record<string, string>) {
        let { date, description, ...restValues } = values
        // restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(EMPLOYEE201.BENEFITS.PUT + selectedData?.id, { ...restValues, id: selectedData.id, user_id: employeeId }) : POST(EMPLOYEE201.BENEFITS.POST, { ...restValues, user_id: employeeId })
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(fetchData)
    }

    return <Modal title={`${title} - Benefit`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Benefit"
                name="benefit_id"
                required
                rules={[{ required: true, message: '' }]}
            ><Select
                placeholder='Select Benefit'
                allowClear
                showSearch
                optionFilterProp="children"
            >
                    {lists.map((benefit) => (
                        <Select.Option value={benefit.id} key={benefit.id}>{benefit.name}</Select.Option>
                    ))}
                </Select>
            </Item>
            <Item
                label="Amount"
                name="amount"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input type='number' placeholder='Enter amount...' />
            </Item>
            <Item
                label="Status"
                name="is_active"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Select
                    placeholder='Select status...'
                >
                    <Select.Option value="activate">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
            </Item>
            <Item style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}