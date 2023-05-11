import { useState, useEffect } from 'react'
import { Col, Row, Input, Form as AntDForm, Button } from 'antd'
import { Card, Form } from '../components'
import { IUser } from '../shared/interfaces'
import { useAuthContext } from '../shared/contexts/Auth'

const { useForm, Item } = AntDForm


// TODO

export default function Profile() {
    const [form] = useForm<IUser>()
    const [loading, setLoading] = useState(false)
    const { user } = useAuthContext()
    console.log(user)

    useEffect(() => {
        form.setFieldsValue({ ...user })
    }, [])

    const onFinish = (val: IUser) => {
        alert('aha')
        console.log(val)
    }
    return (
        <Card title='Profile'>
            <Form form={form} onFinish={onFinish} disabled={loading}>
                <Row justify='space-between'>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="First Name"
                            name="first_name"
                        >
                            <Input placeholder='Enter first name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Last Name"
                            name="last_name"
                        >
                            <Input placeholder='Enter last name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Middle Name"
                            name="middle_name"
                        >
                            <Input placeholder='Enter middle name...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Email"
                            name="email"
                        >
                            <Input type='email' placeholder='Enter email...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Department"
                            name="department_name" // to be change
                        >
                            <Input placeholder='Enter department...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Position"
                            name="position_name" // to be change
                        >
                            <Input placeholder='Enter position...' />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Username"
                            name="username" // to be change
                        >
                            <Input disabled />
                        </Item>
                    </Col>
                    <Col xs={24} sm={24} md={11} lg={10} xl={10} >
                        <Item
                            label="Password"
                            name="password" // to be change
                        >
                            <Input type='password' placeholder='Change password' />
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
