import { useState } from 'react'
import { Form, Input, Checkbox, Button, Row, Col } from 'antd'

export default function Login() {
    const onFinish = (values: string[]) => {
        console.log("Success:", values);
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    }

    return (
        <Row justify='center' style={{ minHeight: '100vh', width: '100%', }} align='middle'>
            <Col xs={18} sm={18} md={18} lg={18} xl={11} style={{ outline: '1px solid lime', height: 630 }} >
                <Form
                    autoComplete='off'
                    name="basic"
                    initialValues={{
                        remember: true,
                    }}
                    layout='vertical'
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Please input your email!",
                            },
                        ]}
                    >
                        <Input type='email' placeholder='Enter email' />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"

                        rules={[
                            {
                                required: true,
                                message: "Please input your password!",
                            },
                        ]}
                    >
                        <Input.Password type='password' placeholder='Enter password' />
                    </Form.Item>
                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'center' }}>
                        <Button type="primary" htmlType="submit">
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
}