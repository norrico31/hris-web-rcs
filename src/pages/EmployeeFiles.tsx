import { useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form as AntDForm, Input, DatePicker, Space, Button, Select, Steps, Row, Col, Divider } from 'antd'
import { LoadingOutlined, UserOutlined, CreditCardOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { ColumnsType, TablePaginationConfig } from "antd/es/table"
import Modal from 'antd/es/modal/Modal'
import dayjs, { Dayjs } from 'dayjs'
import { Action, TabHeader, Table, Form, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'
import { useEndpoints } from './../shared/constants/endpoints'
import axiosClient, { useAxios } from './../shared/lib/axios'
import { IArguments, TableParams, IEmployee, Employee201Res, IClient, IClientBranch, IEmployeeStatus, IPosition, IRole, IDepartment, ISalaryRates, ILineManager } from '../shared/interfaces'

const [{ EMPLOYEE201, SYSTEMSETTINGS: { CLIENTSETTINGS, HRSETTINGS }, ADMINSETTINGS }] = useEndpoints()
const { GET, POST, DELETE } = useAxios()

export default function EmployeeFiles() {
    renderTitle('Employee')
    const navigate = useNavigate()

    const [data, setData] = useState<IEmployee[]>([])
    const [selectedData, setSelectedData] = useState<IEmployee | undefined>(undefined)
    const [tableParams, setTableParams] = useState<TableParams | undefined>()
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    const columns: ColumnsType<IEmployee> = [
        {
            title: 'Employee No.',
            key: 'employee_code',
            dataIndex: 'employee_code',
            width: 130,
            align: 'center'
        },
        {
            title: 'Employee Name',
            key: 'full_name',
            dataIndex: 'full_name',
            width: 130,
            align: 'center'
        },
        {
            title: 'Position',
            key: 'position',
            dataIndex: 'position',
            width: 130,
        },
        {
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
            align: 'center',
            width: 130,
        },
        {
            title: 'Date Hired',
            key: 'date_hired',
            dataIndex: 'date_hired',
            align: 'center',
            width: 110,
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            width: 110,
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_, record: IEmployee) => <Action
                title='Employee'
                name={record.employee_name}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => navigate('/employee/edit/' + record.id + '/userprofile')}
            />,
            width: 200
        },
    ]

    function fetchData(args?: IArguments) {
        setLoading(true)
        GET<Employee201Res>(EMPLOYEE201.GET, args?.signal!, { page: args?.page!, search: args?.search!, limit: args?.pageSize! })
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
        DELETE(EMPLOYEE201.DELETE, id)
            .finally(fetchData)
    }

    function handleEdit(data: IEmployee) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleDownload() {
        console.log('dowwnload')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }

    return (
        <>
            <MainHeader>
                <h1 className='color-white'>Employees</h1>
            </MainHeader>
            <TabHeader
                name='Employee'
                handleSearch={handleSearch}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table loading={loading} tableParams={tableParams} columns={columns} dataList={data} onChange={onChange} />
            <EmployeeModal
                title={selectedData != undefined ? 'Update' : 'Create'}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
                fetchData={fetchData}
            />
        </>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    handleCancel: () => void
    fetchData(args?: IArguments): void
}

const { Item: FormItem, useForm } = AntDForm

function EmployeeModal({ title, fetchData, isModalOpen, handleCancel }: ModalProps) {
    const [current, setCurrent] = useState(0)
    const [stepOneInputs, setStepOneInputs] = useState<IStepOne | undefined>(undefined)
    const [stepTwoInputs, setStepTwoInputs] = useState<IStepTwo | undefined>(undefined)
    const [stepThreeInputs, setStepThreeInputs] = useState<IStepThree | undefined>(undefined)
    const [stepFourInputs, setStepFourInputs] = useState<IStepFour | undefined>(undefined)

    const payload = {
        ...stepOneInputs!,
        ...stepTwoInputs!,
        ...stepThreeInputs!,
    }

    function handleResetSteps() {
        setCurrent(0)
        setStepOneInputs(undefined)
        setStepTwoInputs(undefined)
        setStepThreeInputs(undefined)
        setStepFourInputs(undefined)
    }

    const renderStep = (current: number) => {
        const stepsComponent: { [k: number]: ReactNode } = {
            0: <StepOne
                stepOneInputs={stepOneInputs}
                setStepOneInputs={setStepOneInputs}
                stepOne={() => setCurrent(current + 1)}
            />,
            1: <StepTwo
                stepTwoInputs={stepTwoInputs}
                setStepTwoInputs={setStepTwoInputs}
                stepTwo={() => setCurrent(current + 1)}
                previousStep={(val: IStepTwo) => {
                    setCurrent(current - 1)
                    setStepTwoInputs(val)
                }}
            />,
            2: <StepThree
                stepThreeInputs={stepThreeInputs}
                setStepThreeInputs={setStepThreeInputs}
                stepThree={() => setCurrent(current + 1)}
                previousStep={(val: IStepThree) => {
                    setCurrent(current - 1)
                    setStepThreeInputs(val)
                }}
            />,
            3: <StepFour
                stepFourInputs={stepFourInputs}
                setStepFourInputs={setStepFourInputs}
                previousStep={(val: IStepFour) => {
                    setCurrent(current - 1)
                    setStepFourInputs(val)
                }}
                fetchData={fetchData}
                handleResetSteps={handleResetSteps}
                payload={payload}
            />
        }
        return stepsComponent[current]
    }

    return <Modal title={`${title} - Employee`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender width={850}>
        <Steps
            current={current}
            items={[
                {
                    title: 'Step 1',
                    description: 'Employee Info',
                    icon: current == 0 ? <LoadingOutlined /> : <UserOutlined />,
                },
                {
                    title: 'Step 2',
                    description: 'Client',
                    icon: current == 1 ? <LoadingOutlined /> : <UsergroupAddOutlined />,
                },
                {
                    title: 'Step 3',
                    description: 'Salary',
                    icon: current == 2 ? <LoadingOutlined /> : <CreditCardOutlined />,
                },
                {
                    title: 'Step 4',
                    description: 'Pay Scheme',
                    icon: current == 3 ? <LoadingOutlined /> : <CreditCardOutlined />,
                },
            ]}
        />
        <Divider />
        {renderStep(current)}
    </Modal>
}

interface IStepOne {
    employee_code: string
    first_name: string
    middle_name: string
    gender: string
    marital_status: string
    department_id: string
    birthday: string
    address: string
    mobile_number1: string
    position_id: string
    status: string
    role_id: string
    employment_id: string

    date_hired: string | Dayjs
    resignation_date: string | Dayjs
}

interface IStepOneProps {
    stepOneInputs: IStepOne | undefined
    setStepOneInputs: React.Dispatch<React.SetStateAction<IStepOne | undefined>>
    stepOne(): void
}

function StepOne({ setStepOneInputs, stepOneInputs, stepOne }: IStepOneProps) {
    const [form] = useForm<IStepOne>()

    useEffect(() => {
        if (stepOneInputs) form.setFieldsValue({ ...stepOneInputs })
    }, [stepOneInputs])

    const [lists, setLists] = useState<{ employeeStatus: IEmployeeStatus[]; positions: IPosition[]; roles: IRole[]; lineManagers: ILineManager[]; departments: IDepartment[] }>({
        employeeStatus: [],
        positions: [],
        roles: [],
        lineManagers: [],
        departments: []
    })

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const employeeStatusPromise = axiosClient(HRSETTINGS.EMPLOYEESTATUS.LISTS, { signal: controller.signal })
                const positionsPromise = axiosClient(HRSETTINGS.POSITION.LISTS, { signal: controller.signal })
                const rolesPromise = axiosClient(ADMINSETTINGS.ROLES.LISTS, { signal: controller.signal })
                const lineManagerPromise = axiosClient(ADMINSETTINGS.ROLES.LINEMANAGERS, { signal: controller.signal })
                const departmentPromise = axiosClient(HRSETTINGS.DEPARTMENT.LISTS, { signal: controller.signal })
                const [employeeStatusRes, positionsRes, rolesRes, lineManagerRes, departmentRes] = await Promise.allSettled([employeeStatusPromise, positionsPromise, rolesPromise, lineManagerPromise, departmentPromise]) as any
                console.log(employeeStatusRes?.value?.data)
                setLists({
                    employeeStatus: employeeStatusRes?.value?.data ?? [],
                    positions: positionsRes?.value?.data ?? [],
                    roles: rolesRes?.value?.data ?? [],
                    lineManagers: lineManagerRes?.value?.data ?? [],
                    departments: departmentRes?.value?.data ?? [],
                })
            } catch (error) {
                console.error('error fetching clients: ', error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [])

    function onFinish(values: Record<string, any>) {
        setStepOneInputs(formValues(values) as IStepOne)
        stepOne()
    }

    return <Form form={form} onFinish={onFinish}>
        <Row justify='space-around' gutter={[20, 20]} wrap>
            <Col span={8}>
                <FormItem
                    label="Employee No."
                    name="employee_code"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Input placeholder='Enter employee no...' />
                </FormItem>
                <FormItem
                    label="First Name"
                    name="first_name"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Input placeholder='Enter first name...' />
                </FormItem>
                <FormItem
                    label="Middle Name"
                    name="middle_name"
                >
                    <Input placeholder='Enter middle name...' />
                </FormItem>
                <FormItem
                    label="Last Name"
                    name="last_name"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Input placeholder='Enter last name...' />
                </FormItem>
                <FormItem name='gender' label="Gender" required rules={[{ required: true, message: '' }]}>
                    <Select
                        placeholder='Select gender...'
                        allowClear
                        showSearch
                    >
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    label="Marital Status"
                    name="marital_status"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select marital status...'
                    >
                        <Select.Option value="single">Single</Select.Option>
                        <Select.Option value="married">Married</Select.Option>
                        <Select.Option value="annulled">Annulled</Select.Option>
                        <Select.Option value="separated">Separated</Select.Option>
                        <Select.Option value="widow">Widow</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    label="Date of Birth"
                    name="birthday"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                        placeholder='Select date of birth'
                    />
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    label="Contact Number"
                    name="mobile_number1"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Input type='number' placeholder='Enter contact number...' />
                </FormItem>
                <FormItem
                    label="Contact Number 2"
                    name="mobile_number2"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Input type='number' placeholder='Enter contact number...' />
                </FormItem>
                <FormItem name='email' label="Email Address" required rules={[{ required: true, message: '' }]}>
                    <Input type='email' placeholder='Enter email address...' />
                </FormItem>
                <FormItem
                    label="Employee Status"
                    name="employee_status_id"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select employee status...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {lists?.employeeStatus.map((emp) => (
                            <Select.Option value={emp.id} key={emp.id} style={{ color: '#777777' }}>{emp.name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem
                    label="Department"
                    name="department_id"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select department...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {lists?.departments.map((dep) => (
                            <Select.Option value={dep.id} key={dep.id} style={{ color: '#777777' }}>{dep.name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem
                    label="Status"
                    name="status"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select status...'
                    >
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    label="Position"
                    name="position_id"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select position...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {lists?.positions.map((pos) => (
                            <Select.Option value={pos.id} key={pos.id} style={{ color: '#777777' }}>{pos.name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    label="Role"
                    name="role_id"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select role...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {lists?.roles.map((role) => (
                            <Select.Option value={role.id} key={role.id} style={{ color: '#777777' }}>{role.name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem
                    label="Line Manager"
                    name="position_type_id"
                >
                    <Select
                        placeholder='Select line manager...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                    >
                        {lists?.lineManagers.map((role) => (
                            <Select.Option value={role.id} key={role.id} style={{ color: '#777777' }}>{role.full_name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
                <FormItem
                    label="Date Hired"
                    name="date_hired"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                        placeholder='Select date hired'
                    />
                </FormItem>
                <FormItem
                    label="Date Resigned"
                    name="resignation_date"
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                        placeholder='Select date resigned'
                    />
                </FormItem>
                <FormItem
                    label="Current Address"
                    name="address"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Input.TextArea placeholder='Enter current address...' style={{ minHeight: 200 }} />
                </FormItem>
            </Col>
        </Row>
        <FormItem style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" htmlType="submit">
                    Next
                </Button>
            </Space>
        </FormItem>
    </Form>
}

interface IStepTwo {
    client_id: string
    client_branch_id: string
    start_date: string | Dayjs | null
    end_date: string | Dayjs | null
}

interface IStepTwoProps {
    setStepTwoInputs: React.Dispatch<React.SetStateAction<IStepTwo | undefined>>
    stepTwoInputs: IStepTwo | undefined
    stepTwo(): void
    previousStep: (val: IStepTwo) => void
}

function StepTwo({ setStepTwoInputs, stepTwoInputs, stepTwo, previousStep }: IStepTwoProps) {
    const [form] = useForm<IStepTwo>()
    const [clients, setClients] = useState<IClient[]>([])
    const [clientId, setClientId] = useState('')
    const [clientBranches, setClientBranches] = useState<IClientBranch[]>([])

    useEffect(() => {
        if (stepTwoInputs) {
            form.setFieldsValue({ ...stepTwoInputs })
            setClientId(stepTwoInputs.client_id)
            onChange(stepTwoInputs.client_id)
        }

        const controller = new AbortController();
        (async () => {
            try {
                const clientPromise = await axiosClient(CLIENTSETTINGS.CLIENT.LISTS, { signal: controller.signal })
                setClients(clientPromise?.data ?? [])
            } catch (error: any) {
                throw new Error(error)
            }
        })()
        return () => {
            controller.abort()
        }
    }, [stepTwoInputs])

    async function onChange(id: string) {
        setClientId(id)
        try {
            if (id == null || id == undefined || id == '') return
            const res = await axiosClient.get(CLIENTSETTINGS.CLIENTBRANCH.LISTS + '?client_id=' + id)
            setClientBranches(res?.data ?? [])
        } catch (error) {
            return Promise.reject(error)
        }
    }

    function onFinish(values: Record<string, any>) {
        setStepTwoInputs(formValues(values) as IStepTwo)
        setClientId('')
        stepTwo()
    }

    return <Form form={form} onFinish={onFinish}>
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col span={8}>
                <FormItem name='client_id' label="Client" required rules={[{ required: true, message: 'Please select client!' }]} >
                    <Select
                        placeholder='Select client...'
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        value={clientId}
                        onChange={onChange}
                    >
                        {clients.map((client) => (
                            <Select.Option value={client.id} key={client.id} style={{ color: '#777777' }}>{client.name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    name='client_branch_id'
                    label="Client Branch"
                    required
                    rules={[{ required: true, message: '' }]}
                >
                    <Select
                        placeholder='Select client branch...'
                        allowClear
                        showSearch
                        disabled={!clientBranches.length}
                        optionFilterProp="children"
                    >
                        {clientBranches.map((clientBranch) => (
                            <Select.Option value={clientBranch.id} key={clientBranch.id} style={{ color: '#777777' }}>{clientBranch.branch_name}</Select.Option>
                        ))}
                    </Select>
                </FormItem>
            </Col>
        </Row>
        <Divider />
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col span={8}>
                <FormItem
                    label="Start Date"
                    name="start_date"
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    label="End Date"
                    name="end_date"
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
            </Col>
        </Row>
        <FormItem style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" onClick={() => previousStep({ ...form.getFieldsValue() })}>
                    Previous Step
                </Button>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Space>
        </FormItem>
    </Form>
}

interface IStepThree {
    salary_rate: string
    basic_rate: string
}

interface IStepThreeProps {
    setStepThreeInputs: React.Dispatch<React.SetStateAction<IStepThree | undefined>>
    stepThreeInputs: IStepThree | undefined
    stepThree(): void
    previousStep: (val: IStepThree) => void
}

function StepThree({ setStepThreeInputs, stepThreeInputs, stepThree, previousStep }: IStepThreeProps) {
    const [form] = useForm<IStepThree>()
    const [salaryRates, setSalaryRates] = useState<ISalaryRates[]>([])

    useEffect(() => {
        if (stepThreeInputs) {
            form.setFieldsValue({ ...stepThreeInputs })
        }
        const controller = new AbortController();
        axiosClient(HRSETTINGS.SALARYRATES.LISTS, { signal: controller.signal })
            .then((res) => setSalaryRates(res?.data ?? []))
        return () => {
            controller.abort()
        }
    }, [stepThreeInputs])

    function onFinish(values: Record<string, any>) {
        setStepThreeInputs(formValues(values) as IStepThree)
        stepThree()
    }

    return <Form form={form} onFinish={onFinish}>
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col>
                <FormItem
                    name='salary_rate_id'
                    label="Salary Rate"
                // required 
                // rules={[{ required: true, message: '' }]}
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
                </FormItem>
                <FormItem name='basic_rate' label="Basic Rate" required rules={[{ required: true, message: '' }]}>
                    <Input type='number' placeholder='Enter basic rate...' />
                </FormItem>
            </Col>
        </Row>
        <FormItem style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" onClick={() => previousStep({ ...form.getFieldsValue() })}>
                    Previous Step
                </Button>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Space>
        </FormItem>
    </Form>
}

interface IStepFour {
    pay_scheme: string
    bank_name: string
    bank_account_number: number
}

type Payload = IStepOne & IStepTwo & IStepThree

interface IStepFourProps {
    setStepFourInputs: React.Dispatch<React.SetStateAction<IStepFour | undefined>>
    stepFourInputs: IStepFour | undefined
    previousStep: (val: IStepFour) => void
    handleResetSteps(): void
    payload: Payload
    fetchData(args?: IArguments): void
}

function StepFour({ setStepFourInputs, stepFourInputs, payload, previousStep, fetchData, handleResetSteps }: IStepFourProps) {
    const [form] = useForm<IStepFour>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (stepFourInputs) {
            form.setFieldsValue({ ...stepFourInputs })
        }
    }, [stepFourInputs])

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        let stepFourPayload = formValues(values) as IStepFour
        setStepFourInputs(stepFourPayload)
        payload = {
            ...payload,
            ...stepFourPayload,
            birthday: dayjs(payload?.birthday).format('YYYY-MM-DD'),
            date_hired: dayjs(payload?.date_hired).format('YYYY-MM-DD'),
            resignation_date: dayjs(payload?.resignation_date).format('YYYY-MM-DD'),
        }
        POST(EMPLOYEE201.POST, payload).then(() => {
            form.resetFields()
            handleResetSteps()
        }).finally(() => {
            fetchData()
            setLoading(false)
        })
    }

    return <Form form={form} onFinish={onFinish} disabled={loading}>
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col>
                <FormItem name='pay_scheme' label="Pay Scheme" required rules={[{ required: true, message: '' }]}>
                    <Select
                        placeholder='Select pay scheme...'
                    >
                        <Select.Option value="cash">Cash</Select.Option>
                        <Select.Option value="bank_account">Bank Account</Select.Option>
                    </Select>
                </FormItem>
                <FormItem name='bank_name' label="Bank Name" required rules={[{ required: true, message: '' }]}>
                    <Input type='text' placeholder='Enter bank name...' />
                </FormItem>
                <FormItem name='bank_account_number' label="Bank Account Number" required rules={[{ required: true, message: '' }]}>
                    <Input type='number' placeholder='Enter bank account number...' />
                </FormItem>
            </Col>
        </Row>
        <FormItem style={{ textAlign: 'right' }}>
            <Space>
                <Button type="primary" onClick={() => previousStep({ ...form.getFieldsValue() })} loading={loading} disabled={loading}>
                    Previous Step
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                    Submit
                </Button>
            </Space>
        </FormItem>
    </Form>
}

function formValues(values: Record<string, unknown>) {
    const payload: { [k: string]: unknown } = {}
    for (const val in values) {
        payload[val] = values[val] != undefined ? values[val] : null
    }
    return payload as unknown
    // let newValues = {}
    // for (const val in values) {
    //     newValues = { ...newValues, ...(values[val] == undefined ? { [val]: null } : { [val]: values[val] }) }
    // }
    // return newValues
}