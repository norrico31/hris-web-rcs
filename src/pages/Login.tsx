import { useState } from 'react'
import { Form, Input, Checkbox, Button, Row, Col, Typography } from 'antd'
import { Navigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuthContext } from '../shared/contexts/Auth'
import axiosClient from '../shared/utils/axios'
import ImgBG from '../shared/assets/bg-login.png'
import RcsLogo from '../shared/assets/logo.png'

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
        <div>
            <img src={ImgBG} className='login-bg' />
            <Row justify='center' style={{ minHeight: '100vh', width: '100%', }} align='middle'>
                <ColContainer xs={18} sm={18} md={18} lg={18} xl={11}>
                    {error}
                    <Form
                        autoComplete='off'
                        layout='vertical'
                        onFinish={onFinish}
                    >
                        <Row justify='center' align='middle'>
                            <Col>
                                <div className='center' style={style}>
                                    <img src={RcsLogo} alt='logo' />
                                    <h1 className='color-primary'>Login</h1>
                                </div>
                            </Col>
                        </Row>
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
                        <Form.Item style={{ textAlign: 'right' }}>
                            <Link to='#' className='link-forgotpassword'>Forgot Password</Link>
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'center' }}>
                            <Button type="primary" htmlType="submit" className='btn-primary'>
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </ColContainer>
            </Row>
        </div>
    );
}

const style: Record<string, string> = {
    '--gap': '1rem'
}

const ColContainer = styled(Col)`
    height: 630px;
    display: grid;
    place-items: center;
    grid-template-columns: auto;
    
    &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: #fff;
        opacity: .3;
        z-index: 0;
    }
`;