import { useState, useEffect } from 'react'
import { Space, Button, Input, Form as AntDForm } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { Action, Table, Card, TabHeader, Form } from "../../../components"
import { useAxios } from '../../../shared/lib/axios'
import { useEndpoints } from '../../../shared/constants'
import { IArguments, ISalaryRates, SalaryRatesRes, TableParams } from '../../../shared/interfaces'

const { GET, DELETE, POST, PUT } = useAxios()
const [{ SYSTEMSETTINGS: { HRSETTINGS } }] = useEndpoints()

export default function SalaryRates() {
    const [data, setData] = useState<ISalaryRates[]>([])
    const [selectedData, setSelectedData] = useState<ISalaryRates | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<ISalaryRates> = [
        {
            title: 'Salary Rates',
            key: 'rate',
            dataIndex: 'rate',
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
            render: (_: any, record: ISalaryRates) => <Action
                title='SalaryRates'
                name={record.rate}
                onConfirm={() => handleDelete(record.id)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<SalaryRatesRes>(HRSETTINGS.SALARYRATES.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(HRSETTINGS.SALARYRATES.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ISalaryRates) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Salary Rates'>
            <TabHeader
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
            <SalaryRatesModal
                title={selectedData != undefined ? 'Update' : 'Create'}
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
    selectedData?: ISalaryRates
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function SalaryRatesModal({ title, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<ISalaryRates>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData })
        } else {
            form.resetFields(undefined)
        }
    }, [selectedData])

    function onFinish(values: ISalaryRates) {
        setLoading(true)
        let { description, ...restValues } = values
        restValues = { ...restValues, ...(description != undefined && { description }) }
        let result = selectedData ? PUT(HRSETTINGS.SALARYRATES.PUT + selectedData?.id, { ...restValues, id: selectedData.id }) : POST(HRSETTINGS.SALARYRATES.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Salary Rates`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label="Salary Rate"
                name="rate"
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input placeholder='Enter salary rate...' />
            </FormItem>
            <FormItem
                name="description"
                label="Description"
            >
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