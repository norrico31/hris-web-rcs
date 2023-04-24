import { useState, useEffect } from 'react'
import { Form as AntDForm, Modal, Input, DatePicker, Space, Button, Select } from 'antd'
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs'
import { TabHeader, Table, Form, Card, Action } from '../../../components'
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { BenefitsRes, IArguments, IBenefits, TableParams } from '../../../shared/interfaces'

const { GET, DELETE, PUT, POST } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function Benefits() {
    const [data, setData] = useState<IBenefits[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IBenefits | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IBenefits> = [
        {
            title: 'Benefit',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Payrol Calculation',
            key: 'for_payroll_calculation',
            dataIndex: 'for_payroll_calculation',
        },
        {
            title: 'Status',
            key: 'is_active',
            dataIndex: 'is_active',
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
            render: (_: any, record: IBenefits) => <Action
                title='Bank Details'
                name={record.name}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    function handleDelete(id: string) {
        DELETE(HRSETTINGS.BENEFITS.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IBenefits) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<BenefitsRes>(HRSETTINGS.BENEFITS.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Benefits'>
            <TabHeader
                name='benefits'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                tableParams={tableParams}
                dataList={data}
                onChange={onChange}
            />
            <BenefitsModal
                title={selectedData != undefined ? 'Edit' : 'Create'}
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
    selectedData?: IBenefits
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: Item, useForm } = AntDForm

function BenefitsModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<IBenefits>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            // let date = [dayjs(selectedData?.start_date, 'YYYY/MM/DD'), dayjs(selectedData?.end_date, 'YYYY/MM/DD')]
            form.setFieldsValue({
                ...selectedData,
                // date: date
            })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: IBenefits) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.BENEFITS.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.BENEFITS.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Benefit`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Benefit"
                name="name"
                required
                rules={[{ required: true, message: 'Please enter benefit!' }]}
            >
                <Input placeholder='Enter benefit...' />
            </Item>
            {/* TODO: radio button (true/false) */}
            <Item
                label="Payroll Calculation"
                name="for_payroll_calculation"
                required
                rules={[{ required: true, message: 'Please payment calculation!' }]}
            >
                <Input type='number' placeholder='Enter payment calculation...' />
            </Item>
            <Item
                label="Status"
                name="is_active"
                required
                rules={[{ required: true, message: 'Please select status!' }]}
            >
                <Select
                    placeholder='Select status...'
                >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                </Select>
            </Item>
            <Item
                name="description"
                label="Description"
            >
                <Input placeholder='Enter description...' />
            </Item>
            <Item style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Edit' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}