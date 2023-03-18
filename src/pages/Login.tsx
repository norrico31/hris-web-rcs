import { useState } from 'react'
import { Form, Input, Checkbox, Button, Row, Col } from 'antd'
import { Navigate } from 'react-router-dom'
import axiosClient from '../shared/utils/axios'
import { useAuthContext } from '../shared/contexts/Auth'

export default function Login() {
    const { token, setToken } = useAuthContext()
    const [error, setError] = useState<string | undefined>(undefined)

    if (token != undefined) {
        return <Navigate to='/' />
    }

    const onFinish = async (values: any) => {
        setError(undefined)
        try {
            const res = await axiosClient.post('/login', values)
            localStorage.setItem('t', JSON.stringify(res.data.token))
            setToken(res.data.token)
        } catch (error: any) {
            setError(error.response.data.message ?? error.response.data.error)
            return error
        } finally {
            setTimeout(() => setError(undefined), 5000)
        }
    }

    return (
        <Row justify='center' style={{ minHeight: '100vh', width: '100%', }} align='middle'>
            <Col xs={18} sm={18} md={18} lg={18} xl={11} style={{ outline: '1px solid lime', height: 630 }} >
                {error}
                <Form
                    autoComplete='off'
                    layout='vertical'
                    onFinish={onFinish}
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