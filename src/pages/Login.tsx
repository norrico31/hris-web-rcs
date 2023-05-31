import { Form, Input, Button, Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import RcsLogo from '../shared/assets/logo.png'
import { renderTitle } from '../shared/utils/utilities'

export default function Login() {
    renderTitle('Login')

    return <>
        <Row justify='center' align='middle'>
            <Col>
                <div className='center' style={style}>
                    <img src={RcsLogo} alt='logo' />
                    <h1 className='color-primary'>Login</h1>
                </div>
            </Col>
        </Row>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "", },]}>
            <Input type='email' placeholder='Enter email' />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: "", },]}>
            <Input.Password type='password' placeholder='Enter password' />
        </Form.Item>
        <Form.Item style={{ textAlign: 'right' }}>
            <Link to='/forgotpassword' className='link-forgotpassword color-white'>Forgot Password</Link>
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" className='btn-primary'>
                Login
            </Button>
        </Form.Item></>
}

const style: Record<string, string> = {
    '--gap': '1rem'
}