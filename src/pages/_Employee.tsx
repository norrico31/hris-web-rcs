import { useState, useEffect, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form as AntDForm, Input, DatePicker, Space, Button, Select, Steps, Row, Col, Divider } from 'antd'
import { LoadingOutlined, UserOutlined, CreditCardOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { ColumnsType } from "antd/es/table"
import Modal from 'antd/es/modal/Modal'
import dayjs from 'dayjs'
import { Card, Action, TabHeader, Table, Form, MainHeader } from '../components'
import { renderTitle } from '../shared/utils/utilities'

interface IEmployee extends Partial<{ id: string }> {
    employee_no: string
    employee_name: string
    position: string
    department: string
    date_hired: string
    status: string
}

export default function Employee() {
    renderTitle('Employee')
    const { employeeId } = useParams()
    const navigate = useNavigate()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<IEmployee | undefined>(undefined)

    const columns: ColumnsType<IEmployee> = [
        {
            title: 'Employee No.',
            key: 'employee_no',
            dataIndex: 'employee_no',
        },
        {
            title: 'Employee Name',
            key: 'employee_name',
            dataIndex: 'employee_name',
        },
        {
            title: 'Position',
            key: 'position',
            dataIndex: 'position',
        },
        {
            title: 'Department',
            key: 'department',
            dataIndex: 'department',
            align: 'center',
        },
        {
            title: 'Date Hired',
            key: 'date_hired',
            dataIndex: 'date_hired',
            align: 'center',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
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
                onClick={() => navigate('/employee/edit/' + record.id)}
            />
        },

    ];

    const data: IEmployee[] = [
        {
            id: '1',
            employee_no: '1',
            employee_name: 'John Brown',
            department: 'hr',
            date_hired: '2023/03/20',
            position: 'manager',
            status: 'probi'
        },
        {
            id: '2',
            employee_no: '1',
            employee_name: 'John Brown',
            department: 'hr',
            date_hired: '2023/03/22',
            position: 'manager',
            status: 'probi'
        },
        {
            id: '3',
            employee_no: '1',
            employee_name: 'John Brown',
            department: 'hr',
            date_hired: '2023/03/28',
            position: 'manager',
            status: 'probi'
        },
        {
            id: '4',
            employee_no: '1',
            employee_name: 'John Brown',
            department: 'hr',
            date_hired: '2023/04/09',
            position: 'manager',
            status: 'probi'
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }


    function handleDelete(id: string) {
        console.log(id)
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
                <h1 className='color-white'>Employee</h1>
            </MainHeader>
            <TabHeader
                handleSearch={fetchData}
                handleCreate={() => setIsModalOpen(true)}
            />
            <Table columns={columns} dataList={data} />
            <EmployeeModal
                title={`${selectedData != undefined ? 'Edit' : 'Create'}`}
                selectedData={selectedData}
                isModalOpen={isModalOpen}
                handleCancel={handleCloseModal}
            />
        </>
    )
}

type ModalProps = {
    title: string
    isModalOpen: boolean
    selectedData?: IEmployee
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function EmployeeModal({ title, selectedData, isModalOpen, handleCancel }: ModalProps) {
    const [current, setCurrent] = useState(0)
    const [stepOneInputs, setStepOneInputs] = useState<IStepOne | undefined>(undefined)
    const [stepTwoInputs, setStepTwoInputs] = useState<IStepTwo | undefined>(undefined)
    const [stepThreeInputs, setStepThreeInputs] = useState<IStepThree | undefined>(undefined)
    const [stepFourInputs, setStepFourInputs] = useState<IStepFour | undefined>(undefined)

    // useEffect when selected data

    const payload = {
        ...stepOneInputs,
        ...stepTwoInputs,
        ...stepThreeInputs,
    }

    function handleResetSteps() {
        setCurrent(0)
        setStepOneInputs(undefined)
        setStepTwoInputs(undefined)
        setStepThreeInputs(undefined)
        setStepFourInputs(undefined)
    }

    const renderStepComponent = (current: number) => {
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
                handleResetSteps={handleResetSteps}
                payload={payload}
            />
        }
        return stepsComponent[current]
    }

    return <Modal title={`${title} - Employee`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender width={850}>
        <Steps
            current={current}
            // onChange={onChange}
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
        {renderStepComponent(current)}
    </Modal>
}

interface IStepOne {
    employee_code: string
    first_name: string
    middle_name: string
    gender: string
    marital_status: string
    birthday: string
    address: string
    mobile_number1: string
    employee_status: string
    position_id: string
    status: string
}

interface IStepOneProps {
    stepOneInputs: IStepOne | undefined
    setStepOneInputs: React.Dispatch<React.SetStateAction<IStepOne | undefined>>
    stepOne(): void
}

function StepOne({ setStepOneInputs, stepOneInputs, stepOne }: IStepOneProps) {
    const [form] = useForm<IStepOne>()

    useEffect(() => {
        if (stepOneInputs) {
            form.setFieldsValue({ ...stepOneInputs })
        }
    }, [stepOneInputs])

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
                    rules={[{ required: true, message: 'Please enter employee no.!' }]}
                >
                    <Input placeholder='Enter employee no...' />
                </FormItem>
                <FormItem
                    label="First Name"
                    name="first_name"
                    required
                    rules={[{ required: true, message: 'Please enter first name!' }]}
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
                    rules={[{ required: true, message: 'Please enter last name!' }]}
                >
                    <Input placeholder='Enter last name...' />
                </FormItem>
                <FormItem name='gender' label="Gender" required rules={[{ required: true, message: 'Please select gender!' }]}>
                    <Select
                        placeholder='Select gender...'
                        allowClear
                        showSearch
                    >
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                    </Select>
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    label="Marital Status"
                    name="marital_status"
                    required
                    rules={[{ required: true, message: 'Please select marital status!' }]}
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
                    rules={[{ required: true, message: 'Please select date of birth!' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>

                <FormItem
                    label="Contact Number"
                    name="mobile_number1"
                    required
                    rules={[{ required: true, message: 'Please enter contact number!' }]}
                >
                    <Input type='number' placeholder='Enter contact number...' />
                </FormItem>
                <FormItem name='email' label="Email Address" required rules={[{ required: true, message: 'Please enter email address!' }]}>
                    <Input type='email' placeholder='Enter email address...' />
                </FormItem>
                <FormItem
                    label="Employee Status"
                    name="employee_status"
                    required
                    rules={[{ required: true, message: 'Please enter employee status!' }]}
                >
                    <Input placeholder='Enter employee status..' />
                </FormItem>
            </Col>
            <Col span={8}>
                {/* <FormItem
                    label="Department"
                    name="department"
                    required
                    rules={[{ required: true, message: 'Please select department!' }]}
                >
                    <Select
                        placeholder='Select department...'
                    >
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                </FormItem> */}
                <FormItem
                    label="Position"
                    name="position_id"
                    required
                    rules={[{ required: true, message: 'Please enter position!' }]}
                >
                    <Select
                        placeholder='Select position...'
                    >
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    label="Status"
                    name="status"
                    required
                    rules={[{ required: true, message: 'Please select status!' }]}
                >
                    <Select
                        placeholder='Select status...'
                    >
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    label="Current Address"
                    name="address"
                    required
                    rules={[{ required: true, message: 'Please enter address!' }]}
                >
                    <Input.TextArea placeholder='Enter middle name...' style={{ minHeight: 190 }} />
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
    date_hired: string
    resignation_date: string
}

interface IStepTwoProps {
    setStepTwoInputs: React.Dispatch<React.SetStateAction<IStepTwo | undefined>>
    stepTwoInputs: IStepTwo | undefined
    stepTwo(): void
    previousStep: (val: IStepTwo) => void
}

function StepTwo({ setStepTwoInputs, stepTwoInputs, stepTwo, previousStep }: IStepTwoProps) {
    const [form] = useForm<IStepTwo>()

    useEffect(() => {
        if (stepTwoInputs) {
            form.setFieldsValue({ ...stepTwoInputs })
        }
    }, [stepTwoInputs])

    function onFinish(values: Record<string, any>) {
        setStepTwoInputs(formValues(values) as IStepTwo)
        stepTwo()
    }

    return <Form form={form} onFinish={onFinish}>
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col span={8}>
                <FormItem name='client_id' label="Client" required rules={[{ required: true, message: 'Please select client!' }]}>
                    {/* dropdown /options/clients */}
                    <Select
                        placeholder='Select client...'
                    >
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                    </Select>
                </FormItem>
                <FormItem name='client_branch_id' label="Client Branch" required rules={[{ required: true, message: 'Please select client branch!' }]}>
                    {/* dropdown /options/client_branches */}
                    <Select
                        placeholder='Select client branch...'
                    >
                        <Select.Option value="male">Male</Select.Option>
                        <Select.Option value="female">Female</Select.Option>
                    </Select>
                </FormItem>
            </Col>
            <Col span={8}>
                <FormItem
                    label="Date Hired"
                    name="date_hired"
                    required
                    rules={[{ required: true, message: 'Please select date hired!' }]}
                >
                    <DatePicker
                        format='YYYY/MM/DD'
                        style={{ width: '100%' }}
                    />
                </FormItem>
                <FormItem
                    label="Date Resigned"
                    name="resignation_date"
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
    client_id: string
    client_branch_id: string
    date_hired: string
    resignation_date: string
}

interface IStepThreeProps {
    setStepThreeInputs: React.Dispatch<React.SetStateAction<IStepThree | undefined>>
    stepThreeInputs: IStepThree | undefined
    stepThree(): void
    previousStep: (val: IStepThree) => void
}

function StepThree({ setStepThreeInputs, stepThreeInputs, stepThree, previousStep }: IStepThreeProps) {
    const [form] = useForm<IStepThree>()

    useEffect(() => {
        if (stepThreeInputs) {
            form.setFieldsValue({ ...stepThreeInputs })
        }
    }, [stepThreeInputs])

    function onFinish(values: Record<string, any>) {
        setStepThreeInputs(formValues(values) as IStepThree)
        stepThree()
    }

    return <Form form={form} onFinish={onFinish}>
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col>
                <FormItem name='salary_rate_id' label="Salary Rate" required rules={[{ required: true, message: 'Please enter salary rate!' }]}>
                    {/* dropdown /options/salary_rates */}
                    <Input type='number' placeholder='Enter salary rate...' />
                </FormItem>
                <FormItem name='basic_rate' label="Basic Rate" required rules={[{ required: true, message: 'Please select basic rate!' }]}>
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

interface IStepFourProps {
    setStepFourInputs: React.Dispatch<React.SetStateAction<IStepFour | undefined>>
    stepFourInputs: IStepFour | undefined
    previousStep: (val: IStepFour) => void
    handleResetSteps(): void
    payload: any
}

function StepFour({ setStepFourInputs, stepFourInputs, payload, previousStep, handleResetSteps }: IStepFourProps) {
    const [form] = useForm<IStepFour>()

    useEffect(() => {
        if (stepFourInputs) {
            form.setFieldsValue({ ...stepFourInputs })
        }
    }, [stepFourInputs])

    function onFinish(values: Record<string, any>) {
        let stepFourPayload = formValues(values) as IStepFour
        // for (const val in values) {
        //     if (values[val] == undefined) {
        //         stepFourPayload = { ...stepFourPayload, [val]: null }
        //     } else {
        //         stepFourPayload = { ...stepFourPayload, [val]: values[val] }
        //     }
        // }
        setStepFourInputs(stepFourPayload)
        payload = { ...payload, ...stepFourPayload }
        console.log(payload)
        // if success hit handleResetSteps()
    }

    return <Form form={form} onFinish={onFinish}>
        <Row justify='space-around' style={{ margin: 'auto', width: '80%' }}>
            <Col>
                <FormItem name='pay_scheme' label="Pay Scheme" required rules={[{ required: true, message: 'Please select pay scheme!' }]}>
                    <Select
                        placeholder='Select pay scheme...'
                    >
                        <Select.Option value="cash">Cash</Select.Option>
                        <Select.Option value="bank_account">Bank Account</Select.Option>
                    </Select>
                </FormItem>
                <FormItem name='bank_name' label="Bank Name" required rules={[{ required: true, message: 'Please enter bank name!' }]}>
                    <Input type='text' placeholder='Enter bank name...' />
                </FormItem>
                <FormItem name='bank_account_number' label="Bank Account Number" required rules={[{ required: true, message: 'Please select bank account number!' }]}>
                    <Input type='number' placeholder='Enter bank account number...' />
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

function formValues(values: Record<string, any>) {
    let newValues = {}
    for (const val in values) {
        newValues = { ...newValues, ...(values[val] == undefined ? { [val]: null } : { [val]: values[val] }) }
    }
    return newValues
}