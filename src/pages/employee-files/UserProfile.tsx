import { useState, useEffect } from 'react'
import { Form as AntDForm, Input, Row, Col, Radio, DatePicker, Button, Select } from 'antd'
import dayjs from 'dayjs'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IArguments, IDepartment, IEmployeeStatus, ILineManager, IPosition, IRole, IUser } from '../../shared/interfaces'

const { useForm, Item } = AntDForm
const [{ EMPLOYEE201, SYSTEMSETTINGS: { HRSETTINGS }, ADMINSETTINGS }] = useEndpoints()
const { PUT } = useAxios()

export default function UserProfileEmployee() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = useForm<IUser>()
    const [lists, setLists] = useState<{ employeeStatus: IEmployeeStatus[]; positions: IPosition[]; roles: IRole[]; lineManagers: ILineManager[]; departments: IDepartment[] }>({
        employeeStatus: [],
        positions: [],
        roles: [],
        lineManagers: [],
        departments: []
    })

    useEffect(function fetchUserInfo() {
        console.log('employee info: ', employeeInfo)
        form.setFieldsValue({
            ...employeeInfo,
            birthday: dayjs(employeeInfo?.birthday, 'YYYY/MM/DD'),
            employment_status_id: employeeInfo?.employment_status?.id
        })
        const controller = new AbortController();
        (async () => {
            try {
                const employeeStatusPromise = axiosClient(HRSETTINGS.EMPLOYEESTATUS.LISTS, { signal: controller.signal })
                const positionsPromise = axiosClient(HRSETTINGS.POSITION.LISTS, { signal: controller.signal })
                const rolesPromise = axiosClient(ADMINSETTINGS.ROLES.LISTS, { signal: controller.signal })
                const lineManagerPromise = axiosClient(ADMINSETTINGS.ROLES.LINEMANAGERS, { signal: controller.signal })
                const departmentPromise = axiosClient(HRSETTINGS.DEPARTMENT.LISTS, { signal: controller.signal })
                const [employeeStatusRes, positionsRes, rolesRes, lineManagerRes, departmentRes] = await Promise.allSettled([employeeStatusPromise, positionsPromise, rolesPromise, lineManagerPromise, departmentPromise]) as any
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
    }, [employeeInfo])

    function onFinish(val: IUser) {
        PUT(EMPLOYEE201.PUT + employeeId, val)
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                console.log('Error: ', err)
            })
        // do put route
    }
    return (
        <Card title='Personal Information'>
            <Form form={form} onFinish={onFinish}>
                <Row>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5}>
                        <Item
                            label="Employee Code"
                            name="employee_code"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input placeholder='Enter employee code...' />
                        </Item>
                    </Col>
                </Row>
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5} >
                        <Item
                            label="Last Name"
                            name="last_name"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input placeholder='Enter last name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5} >
                        <Item
                            label="First Name"
                            name="first_name"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input placeholder='Enter first name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5} >
                        <Item
                            label="Middle Name"
                            name="middle_name"
                        >
                            <Input placeholder='Enter middle name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5} >
                        <Item
                            label="Suffix"
                            name="suffix"
                        >
                            <Input placeholder='Enter suffix...' />
                        </Item>
                    </Col>
                </Row>
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={9} lg={6} xl={6} >
                        <Item
                            label="Gender"
                            name="gender"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Radio.Group>
                                <Radio value="male">Male</Radio>
                                <Radio value="female">Female</Radio>
                            </Radio.Group>
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={11} >
                        <Item
                            label="Marital Status"
                            name="marital_status"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Radio.Group>
                                <Radio value="single">Single</Radio>
                                <Radio value="married">Married</Radio>
                                <Radio value="annulled">Annulled</Radio>
                                <Radio value="separated">Separated</Radio>
                                <Radio value="widow">Widow</Radio>
                            </Radio.Group>
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={8} xl={6} >
                        <Item
                            label="No. of Children"
                            name="no_of_children"
                        >
                            <Input placeholder='Enter no_of_children...' />
                        </Item>
                    </Col>
                </Row>
                <Row justify='space-between'>

                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Item
                            label="Date of Birth"
                            name="birthday"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format='YYYY/MM/DD'
                            />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={15} lg={16} xl={17} >
                        <Item
                            label="Current Address"
                            name="address"
                            required
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input placeholder='Enter address...' />
                        </Item>
                    </Col>
                </Row>
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={11} lg={7} xl={7} >
                        <Item
                            label="Contact #1"
                            name="contact_number1"
                        // required
                        // rules={[{ required: true, message: '' }]}
                        >
                            <Input type='number' placeholder='Enter contact number...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={7} xl={7} >
                        <Item
                            label="Contact #2"
                            name="contact_number2"
                        // required
                        // rules={[{ required: true, message: '' }]}
                        >
                            <Input type='number' placeholder='Enter contact number...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={7} xl={7} >
                        <Item
                            label="Email Address"
                            name="email"
                        >
                            <Input type='email' placeholder='Enter email address...' />
                        </Item>
                    </Col>
                </Row>
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5} >
                        <Item
                            label="Employee Status"
                            name="employment_status_id"
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
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={4} xl={4} >
                        <Item
                            label="Department"
                            name="department_id"
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
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={4} xl={4} >
                        <Item
                            label="Position"
                            name="position_id"
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
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={4} xl={4} >
                        <Item
                            label="Role"
                            name="role_id"
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
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={4} xl={4} >
                        <Item
                            label="Line Manager"
                            name="manager_id"
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
                        </Item>
                    </Col>
                </Row>
                <Row justify='end'>
                    <Button type='primary' htmlType='submit'>Update</Button>
                </Row>
            </Form>
        </Card>
    )
}
