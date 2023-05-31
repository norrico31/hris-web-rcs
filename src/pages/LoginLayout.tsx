import { useEffect } from 'react'
import { Form, Row, Col } from 'antd'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuthContext } from '../shared/contexts/Auth'
import { useAxios } from '../shared/lib/axios'
import ImgBG from '../shared/assets/bg-login.png'
import { renderTitle } from '../shared/utils/utilities'
import { useEndpoints } from '../shared/constants'
import useMessage from 'antd/es/message/useMessage'

const { POST } = useAxios()
const [{ AUTH: { LOGIN, FORGOTPASSWORD } }] = useEndpoints()

export default function Login() {
    renderTitle('Login')
    const { token, setToken, setUser, setLoading } = useAuthContext()
    if (token != undefined) return <Navigate to='/dashboard' />

    const { pathname } = useLocation()
    const [messageApi, contextHolder] = useMessage()
    const [form] = Form.useForm()

    useEffect(() => {
        if (pathname == '/login' || pathname == '/forgotpassword') form.resetFields()
    }, [pathname])

    const key = 'error'
    const onFinish = async (values: Record<string, string>) => {
        try {
            let url = pathname === '/forgotpassword' ? FORGOTPASSWORD : LOGIN
            const res = await POST(url, values)
            if (url === '/login') {
                setUser(res?.data?.data?.user)
                setToken(res?.data?.data?.token)
                setLoading(false)
                localStorage.setItem('t', JSON.stringify(res?.data?.data?.token))
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
        }
    }

    return (
        <div>
            {contextHolder}
            <img src={ImgBG} className='login-bg' />
            <Row justify='center' style={{ minHeight: '100vh' }} align='middle'>
                <ColContainer xs={18} sm={18} md={18} lg={18} xl={11}>
                    <Form form={form} autoComplete='off' layout='vertical' onFinish={onFinish}>
                        <Outlet />
                    </Form>
                </ColContainer>
            </Row>
        </div>
    )
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
`