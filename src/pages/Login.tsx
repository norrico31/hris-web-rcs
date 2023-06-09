import { useState } from 'react'
import { Form, Input, Button, Row, Col } from 'antd'
import { Navigate, Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuthContext } from '../shared/contexts/Auth'
import { useAxios } from '../shared/lib/axios'
import ImgBG from '../shared/assets/bg-login.png'
import RcsLogo from '../shared/assets/logo.png'
import { renderTitle } from '../shared/utils/utilities'
import { useEndpoints } from '../shared/constants'
import useMessage from 'antd/es/message/useMessage'

const { POST } = useAxios()
const [{ AUTH: { LOGIN, FORGOTPASSWORD } }] = useEndpoints()

export default function Login() {
    renderTitle('Login')
    const { token, setToken, setUser, setLoading } = useAuthContext()
    const { pathname } = useLocation()
    const [messageApi, contextHolder] = useMessage()
    const [form] = Form.useForm()
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [loginLoading, setLoginLoading] = useState(false)

    if (token != undefined) return <Navigate to='/' />

    const key = 'error'
    const onFinish = async (values: Record<string, string>) => {
        setLoginLoading(true)
        try {
            let url = isForgotPassword ? FORGOTPASSWORD : LOGIN
            const res = await POST(url, values)
            if (!isForgotPassword) {
                setUser(res?.data?.data?.user)
                setToken(res?.data?.data?.token)
                setLoading(false)
                localStorage.setItem('t', JSON.stringify(res?.data?.data?.token))
                localStorage.setItem('pathname', JSON.stringify('/login/AEDkj90'))
            } else {
                // do something when success to change the password
            }
        } catch (error: any) {
            messageApi.open({
                key,
                type: 'error',
                content: error.response.data.message ?? error.response.data.error,
                duration: 3
            })
            return error
        } finally {
            setLoginLoading(false)
            setLoading(false)
        }
    }

    return (
        <div>
            {contextHolder}
            <img src={ImgBG} className='login-bg' />
            <Row justify='center' style={{ minHeight: '100vh', width: '100%', }} align='middle'>
                <ColContainer xs={18} sm={18} md={18} lg={18} xl={11}>
                    <Form form={form} autoComplete='off' layout='vertical' onFinish={onFinish} disabled={loginLoading}>
                        <Row justify='center' align='middle'>
                            <Col>
                                <div className='center' style={style}>
                                    <img src={RcsLogo} alt='logo' />
                                    <h1 className='color-primary'>{isForgotPassword ? 'Forgot Password' : 'Login'}</h1>
                                </div>
                            </Col>
                        </Row>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Required", },]}>
                            <Input type='email' placeholder='Enter email' />
                        </Form.Item>
                        {!isForgotPassword && (
                            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Required", },]}>
                                <Input.Password type='password' placeholder='Enter password' />
                            </Form.Item>
                        )}
                        <Form.Item style={{ textAlign: 'right' }}>
                            {!loginLoading && <Link to='#' className='link-forgotpassword color-white' onClick={() => setIsForgotPassword(!isForgotPassword)}>{isForgotPassword ? 'Login' : 'Forgot Password'}</Link>}
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'center' }}>
                            <Button type="primary" htmlType="submit" className='btn-primary' loading={loginLoading} disabled={loginLoading}>
                                {isForgotPassword ? 'Send' : 'Login'}
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