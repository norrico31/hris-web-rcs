import { useState, useEffect } from 'react'
import { Form as AntDForm, Input, Row, Col, Radio, DatePicker, Button } from 'antd'
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'
import { IArguments, IUser } from '../../shared/interfaces'
import dayjs from 'dayjs'

const { useForm, Item } = AntDForm

export default function UserProfileEmployee() {
    const { employeeId, employeeInfo } = useEmployeeId()
    const [form] = useForm<IUser>()
    const [loading, setLoading] = useState(true)

    useEffect(function fetchUserInfo() {
        form.setFieldsValue({ ...employeeInfo, birthday: dayjs(employeeInfo?.birthday, 'YYYY/MM/DD') })
    }, [employeeInfo])

    function onFinish(val: IUser) {
        setLoading(true)
        console.log(val)
        // do put route
        setLoading(false)
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
                            rules={[{ required: true, message: 'Please employee code!' }]}
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
                            rules={[{ required: true, message: 'Please last name!' }]}
                        >
                            <Input placeholder='Enter last name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={5} xl={5} >
                        <Item
                            label="First Name"
                            name="first_name"
                            required
                            rules={[{ required: true, message: 'Please first name!' }]}
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
                            rules={[{ required: true, message: 'Please gender!' }]}
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
                            name="status"
                            required
                            rules={[{ required: true, message: 'Please marital status!' }]}
                        >
                            <Radio.Group>
                                <Radio value="single">Single</Radio>
                                <Radio value="married">Married</Radio>
                                <Radio value="widow">Widow/Widower</Radio>
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
                            rules={[{ required: true, message: 'Please select date of birth!' }]}
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
                            rules={[{ required: true, message: 'Please enter address!' }]}
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
                            required
                            rules={[{ required: true, message: 'Please contact number!' }]}
                        >
                            <Input type='number' placeholder='Enter contact number...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={7} xl={7} >
                        <Item
                            label="Contact #2"
                            name="contact_number2"
                            required
                            rules={[{ required: true, message: 'Please contact number!' }]}
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
                <Row justify='end'>
                    <Button type='primary' htmlType='submit'>Submit</Button>
                </Row>
            </Form>
        </Card>
    )
}
