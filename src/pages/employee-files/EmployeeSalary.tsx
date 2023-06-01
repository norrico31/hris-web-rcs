import { useState, useEffect } from 'react'
import { Button, Form as AntDForm, Input, Modal, Select, Space, Upload, InputNumber } from 'antd'
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Action, Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table, Form } from '../../components'
import { IArguments, TableParams, IEmployeeSalary, EmployeeSalaryRes, ISalaryRates } from '../../shared/interfaces'
import { useEndpoints } from '../../shared/constants/endpoints'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import useMessage from 'antd/es/message/useMessage';

const [{ EMPLOYEE201: { EMPLOYEESALARY }, SYSTEMSETTINGS: { HRSETTINGS: { SALARYRATES } } }] = useEndpoints()
const { GET, POST, DELETE, PUT } = useAxios()

export default function EmployeeSalary() {
    const { employeeId } = useEmployeeCtx()
    const [data, setData] = useState<IEmployeeSalary[]>([])
    const [selectedData, setSelectedData] = useState<IEmployeeSalary | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IEmployeeSalary> = [
        {
            title: 'Salary',
            key: 'gross_salary',
            dataIndex: 'gross_salary',
        },
        {
            title: 'Salary Rate',
            key: 'salary_rate',
            dataIndex: 'salary_rate',
            render: (salaryRate) => salaryRate?.rate,
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
            render: (_, record: IEmployeeSalary) => <Action
                title='Tasks'
                name={record?.gross_salary + ''}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<EmployeeSalaryRes>(EMPLOYEESALARY.GET + '?user_id=' + employeeId, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
            .then((res) => {
                setData(res?.data ?? [])
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams?.pagination,
                        total: res?.total,
                        current: res?.current_page,
                    },
                })
            }).finally(() => setLoading(false))
    }

    function handleDelete(id: string) {
        DELETE(EMPLOYEESALARY.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployeeSalary) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    const onChange = (pagination: TablePaginationConfig) => fetchData({ page: pagination?.current, search, pageSize: pagination?.pageSize! })

    const handleSearch = (str: string) => {
        setSearch(str)
        fetchData({ search: str, page: 1 })
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <Card title='Salary'>
            <TabHeader
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <EmployeeSalaryModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                employeeId={employeeId}
                fetchData={fetchData}
            />
        </Card>
    )
}

type ModalProps = {
    title: string
    employeeId: string
    isModalOpen: boolean
    selectedData?: IEmployeeSalary
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function EmployeeSalaryModal({ title, employeeId, selectedData, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [salaryRates, setSalaryRates] = useState<Array<ISalaryRates>>([])

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({ ...selectedData, })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        (async () => {
            try {
                const clientPromise = await axiosClient(SALARYRATES.LISTS, { signal: controller.signal })
                setSalaryRates(clientPromise?.data ?? [])
            } catch (error: any) {
                throw new Error(error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [selectedData])

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        const editUrl = selectedData != undefined ? EMPLOYEESALARY.PUT + selectedData?.id : EMPLOYEESALARY.PUT + employeeId
        let result = selectedData ? PUT(editUrl, { ...values, user_id: employeeId }) : POST(EMPLOYEESALARY.POST, { ...values, user_id: employeeId })
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Salary`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Gross Salary"
                name="gross_salary"
                required
                rules={[{ required: true, message: 'Required' }]}
            >
                <InputNumber
                    placeholder='Enter gross salary...'
                    style={{ width: '100%' }}
                />
            </Item>
            <Item
                label="Salary Rate"
                name="salary_rate_id"
                required
                rules={[{ required: true, message: 'Required' }]}
            >

                <Select
                    placeholder='Select salary rate...'
                    allowClear
                    showSearch
                    optionFilterProp="children"
                >
                    {salaryRates.map((salary) => (
                        <Select.Option value={salary.id} key={salary.id} style={{ color: '#777777' }}>{salary.rate}</Select.Option>
                    ))}
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
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {selectedData != undefined ? 'Update' : 'Create'}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}