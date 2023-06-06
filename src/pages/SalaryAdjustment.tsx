import { useState, useEffect, useMemo } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuthContext } from "../shared/contexts/Auth"
import { Button, Col, DatePicker, Form as AntDForm, Input, Modal, Select, Space, Upload, Row, Radio, Skeleton } from "antd"
import dayjs from "dayjs"
import { PlusOutlined } from '@ant-design/icons'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import { AiOutlineCalendar } from 'react-icons/ai'
import useMessage from "antd/es/message/useMessage"
import { Action, MainHeader, Table, Form, TabHeader } from "../components"
import { renderTitle } from "../shared/utils/utilities"
import axiosClient, { useAxios } from "../shared/lib/axios"
import { ROOTPATHS, useEndpoints } from "../shared/constants"
import { IArguments, IEmployee, IExpenseType, ISalaryAdjustment, SalaryAdjustmentRes, TableParams } from "../shared/interfaces"
import { filterCodes, filterPaths } from "../components/layouts/Sidebar"

const { GET, POST, PUT, DELETE } = useAxios()
const [{ SYSTEMSETTINGS: { EXPENSESETTINGS: { EXPENSE, EXPENSETYPE } }, ADMINSETTINGS }] = useEndpoints()

export default function SalaryAdjustment() {
    renderTitle('Salary Adjustment')
    const { user, loading: loadingUser } = useAuthContext()
    const navigate = useNavigate()
    const [data, setData] = useState<ISalaryAdjustment[]>([])
    const [selectedData, setSelectedData] = useState<ISalaryAdjustment | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(function getData() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loadingUser) return <Skeleton />
    if (!loadingUser && ['h01', 'h02', 'h03', 'h04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />


    const columns: ColumnsType<ISalaryAdjustment> = [
        {
            title: 'Employee Name',
            key: 'employee_name',
            dataIndex: 'employee_name',
            render: (_, record) => record?.user?.full_name,
            width: 200,
        },
        {
            title: 'Adjustment Type',
            key: 'adjustment_type_id',
            dataIndex: 'adjustment_type_id',
            render: (_, record) => record?.expense_type?.name ?? '-',
            width: 200,
        },
        {
            title: 'Adjustment Date',
            key: 'expense_date',
            dataIndex: 'expense_date',
            width: 200
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
            align: 'center',
            width: 150
        },
        {
            title: 'Remarks',
            key: 'remarks',
            dataIndex: 'remarks',
            align: 'center',
            width: 200
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: ISalaryAdjustment) => <Action
                title='Tasks'
                name={record?.user?.full_name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />,
            width: 150
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<SalaryAdjustmentRes>(EXPENSE.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(EXPENSE.DELETE, id)
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
            <TabHeader handleModalArchive={() => navigate('/salaryadjustments/archives')} handleSearch={handleSearch} />
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
    const [messageApi, contextHolder] = useMessage()

    useEffect(() => {
        if (selectedData != undefined) {
            form.setFieldsValue({
                ...selectedData,
                expense_date: dayjs(selectedData.expense_date, 'YYYY/MM/DD') as any
            })
        } else form.resetFields(undefined)

        const controller = new AbortController();
        (async () => {
            try {
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

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        const formData = new FormData()
        const expenseDate = dayjs(values?.expense_date).format('YYYY/MM/DD')
        formData.append('user_id', values?.user_id)
        formData.append('expense_type_id', values?.expense_type_id)
        formData.append('amount', values?.amount)
        formData.append('expense_date', values?.expense_date ? expenseDate : '')
        formData.append('is_taxable', values?.is_taxable)
        formData.append('is_active', values?.is_active)
        formData.append('remarks', values?.remarks)
        formData.append('expense_description', values?.expense_description ? values?.expense_description : '')
        formData.append('receipt_attachment', values?.receipt_attachment ? values?.receipt_attachment[0]?.originFileObj : '')
        let result = selectedData ? PUT(EXPENSE.PUT + selectedData.id!, formData) : POST(EXPENSE.POST, formData)
        result.then(() => {
            form.resetFields()
            handleCancel()
        }).catch((err) => {
            messageApi.open({
                type: 'error',
                content: err.response.data.message ?? err.response.data.error,
                duration: 5
            })
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Modal title={`${title} - Adjustment`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender width={700}>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Row justify='space-between' wrap>
                <Col span={11}>
                    <FormItem
                        label="Employee Name"
                        name="user_id"
                        required
                        rules={[{ required: true, message: 'Required' }]}
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
                        rules={[{ required: true, message: 'Required' }]}
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
                        required rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input type='number' placeholder='Enter adjustment adjustment amount...' />
                    </FormItem>
                    <FormItem
                        label="Expense Date"
                        name="expense_date"
                        required
                        rules={[{ required: true, message: 'Required' }]}
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
                            rules={[{ required: true, message: 'Required' }]}
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
                            rules={[{ required: true, message: 'Required' }]}
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
                        label="Remarks"
                        name="remarks"
                        required
                        rules={[{ required: true, message: 'Required' }]}
                    >
                        <Input.TextArea placeholder='Enter remarks...' />
                    </FormItem>
                    <FormItem
                        label="Expense Description"
                        name="expense_description"
                    >
                        <Input.TextArea placeholder='Enter expense description...' />
                    </FormItem>
                    <FormItem
                        label='Receipt File'
                        name='receipt_attachment'
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload listType="picture-card" beforeUpload={() => false} accept=".png,.jpeg,.jpg">
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </FormItem>
                    <FormItem style={{ textAlign: 'right' }}>
                        <Space>
                            <Button id={selectedData != undefined ? 'Update' : 'Create'} type="primary" htmlType="submit" loading={loading}>
                                {selectedData != undefined ? 'Edit' : 'Create'}
                            </Button>
                            <Button id='cancel' type="primary" onClick={handleCancel} loading={loading}>
                                Cancel
                            </Button>
                        </Space>
                    </FormItem>
                </Col>
            </Row>
        </Form>
    </Modal >
}

const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
}