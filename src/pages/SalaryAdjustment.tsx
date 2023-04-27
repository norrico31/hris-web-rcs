import { useState, useEffect } from "react"
import { Button, Col, DatePicker, Form as AntDForm, Input, Modal, Select, Space, Switch, Upload, Row, Radio } from "antd"
import { PlusOutlined } from '@ant-design/icons'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { AiOutlineCalendar } from 'react-icons/ai'
import { Action, MainHeader, Table, Form, TabHeader } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import dayjs from "dayjs"
import axiosClient, { useAxios } from "../shared/lib/axios"
import { useEndpoints } from "../shared/constants"
import { IArguments, IEmployee, IExpenseType, TableParams } from "../shared/interfaces"

interface ISalaryAdjustment extends Partial<{ id: string }> {
    task_activity: string[]
    task_type: string[]
    sprint_name: string[]
    manhours: string
    expense_date: string
    description: string;
}

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SALARYADJUSTMENT, EMPLOYEE201, SYSTEMSETTINGS: { EXPENSESETTINGS: { EXPENSETYPE } }, ADMINSETTINGS }] = useEndpoints()

export default function SalaryAdjustment() {
    renderTitle('Salary Adjustment')
    const [data, setData] = useState<ISalaryAdjustment[]>([])
    const [selectedData, setSelectedData] = useState<ISalaryAdjustment | undefined>(undefined)
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

    const columns: ColumnsType<ISalaryAdjustment> = [
        {
            title: 'Employee Name',
            key: 'employee_name',
            dataIndex: 'employee_name',
        },
        {
            title: 'Adjustment Type',
            key: 'adjustment_type_id',
            dataIndex: 'adjustment_type_id',
        },
        {
            title: 'Adjustment Date',
            key: 'adjustment_date',
            dataIndex: 'adjustment_date',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
            align: 'center',
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            align: 'center',
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
            render: (_, record: ISalaryAdjustment) => <Action
                title='Tasks'
                name={record.task_activity[0]}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },
    ]

    const fetchData = (args?: IArguments) => {
        setLoading(true)
        GET<any>(SALARYADJUSTMENT.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(SALARYADJUSTMENT.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: ISalaryAdjustment) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <>
            <MainHeader>
                <Col>
                    <h1 className='color-white'>Salary Adjustment</h1>
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        Create
                        <AiOutlineCalendar />
                    </Button>
                </Col>
            </MainHeader>
            <TabHeader
                name="salary adjustments"
                handleSearch={handleSearch}
            />
            <Table
                loading={loading}
                columns={columns}
                dataList={data}
                tableParams={tableParams}
                onChange={onChange}
            />
            <SalaryAdjustmentModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                fetchData={fetchData}
                handleCancel={handleCloseModal}
            />
        </>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: ISalaryAdjustment
    fetchData: (args?: IArguments) => void
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function SalaryAdjustmentModal({ title, fetchData, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ISalaryAdjustment>()
    const [loading, setLoading] = useState(false)
    const [lists, setLists] = useState<{ employee: Array<IEmployee>; expenseTypes: Array<IExpenseType> }>({ employee: [], expenseTypes: [] })

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                expense_date: dayjs(selectedData.expense_date, 'YYYY/MM/DD') as any
            })
        } else {
            form.resetFields(undefined)
        }

        const controller = new AbortController();
        (async () => {
            try {
                // const employeePromise = axiosClient(EMPLOYEE201.LISTS, { signal: controller.signal })
                const employeePromise = axiosClient(ADMINSETTINGS.USERS.LISTS, { signal: controller.signal })
                const expenseTypePromise = axiosClient(EXPENSETYPE.LISTS, { signal: controller.signal })
                const [employeeRes, expenseTypeRes,] = await Promise.allSettled([employeePromise, expenseTypePromise]) as any
                setLists({
                    employee: employeeRes?.value?.data ?? [],
                    expenseTypes: expenseTypeRes?.value?.data ?? [],
                })
            } catch (error) {
                console.error('error fetching clients: ', error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [selectedData])

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    }

    function onFinish(values: ISalaryAdjustment) {
        setLoading(true)
        let { expense_date, description, ...restValues } = values
        expense_date = dayjs(expense_date, 'YYYY/MM/DD') as any
        restValues = { ...restValues, expense_date, ...(description != undefined && { description }) } as any
        let result = selectedData ? PUT(SALARYADJUSTMENT.PUT + selectedData.id!, { ...restValues, id: selectedData.id }) : POST(SALARYADJUSTMENT.POST, restValues)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Adjustment`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender width={700}>
        <Form form={form} onFinish={onFinish}>
            <Row justify='space-between' wrap>
                <Col span={11}>
                    <FormItem
                        label="Employee Name"
                        name="user_id"
                        required
                        rules={[{ required: true, message: 'Please select employee!' }]}
                    >
                        <Select
                            placeholder='Select employee'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {lists.employee?.map((emp) => (
                                <Select.Option value={emp.id} key={emp.id}>{emp.full_name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                    <FormItem
                        label="Expense Type"
                        name="expense_type_id"
                        required
                        rules={[{ required: true, message: 'Please select expense type!' }]}
                    >
                        <Select
                            placeholder='Select expense type'
                            allowClear
                            showSearch
                            optionFilterProp="children"
                        >
                            {lists.expenseTypes?.map((exp) => (
                                <Select.Option value={exp.id} key={exp.id}>{exp.name}</Select.Option>
                            ))}
                        </Select>
                    </FormItem>
                    <FormItem
                        label="Salary Adjustment Amount"
                        name='amount'
                        required rules={[{ required: true, message: 'Please enter adjustment adjustment amount!' }]}
                    >
                        <Input type='number' placeholder='Enter adjustment adjustment amount...' />
                    </FormItem>
                    <FormItem
                        label="Expense Date"
                        name="expense_date"
                        required
                        rules={[{ required: true, message: 'Please select adjustment date!' }]}
                    >
                        <DatePicker
                            format='YYYY/MM/DD'
                            style={{ width: '100%' }}
                            placeholder="Select expense date"
                        />
                    </FormItem>
                    <Row justify='space-between' wrap>
                        <FormItem
                            label="Taxable"
                            name="is_taxable"
                            required
                            rules={[{ required: true, message: 'Please select if taxable!' }]}
                        >
                            <Radio.Group>
                                <Radio value="no">No</Radio>
                                <Radio value="yes">Yes</Radio>
                            </Radio.Group>
                        </FormItem>
                        <FormItem
                            label="Active"
                            name="is_active"
                            required
                            rules={[{ required: true, message: 'Please select if active!' }]}
                        >
                            <Radio.Group>
                                <Radio value="no">No</Radio>
                                <Radio value="yes">Yes</Radio>
                            </Radio.Group>
                        </FormItem>
                    </Row>
                </Col>
                <Col span={11}>
                    <FormItem
                        name="remarks"
                        label="Remarks"
                        required
                        rules={[{ required: true, message: 'Please enter remarks!' }]}
                    >
                        <Input.TextArea placeholder='Enter remarks...' />
                    </FormItem>
                    <FormItem
                        label="Expense Description"
                        name="expense_description"
                        required
                        rules={[{ required: true, message: 'Please expense description!' }]}
                    >
                        <Input.TextArea placeholder='Enter expense description...' />
                    </FormItem>

                    <FormItem
                        label='Receipt File'
                        name='receipt_attachment'
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        required
                        rules={[{ required: true, message: 'Please receip file!' }]}
                    >
                        <Upload listType="picture-card" beforeUpload={() => false}>
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </FormItem>
                    <FormItem style={{ textAlign: 'right' }}>
                        <Space>
                            <Button id={selectedData != undefined ? 'Update' : 'Create'} type="primary" htmlType="submit">
                                {selectedData != undefined ? 'Edit' : 'Create'}
                            </Button>
                            <Button id='cancel' type="primary" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Space>
                    </FormItem>
                </Col>
            </Row>
        </Form>
    </Modal >
}