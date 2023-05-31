import { Form, Input, Button, Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import RcsLogo from '../shared/assets/logo.png'
import { renderTitle } from '../shared/utils/utilities'
import { Divider } from '../components'

export default function ForgotPassword() {
    renderTitle('Forgot Password')
    return <>
        <Row justify='center' align='middle'>
            <Col>
                <div className='center' style={style}>
                    <img src={RcsLogo} alt='logo' />
                    <h1 className='color-primary'>Forgot Password</h1>
                </div>
            </Col>
        </Row>
        <Divider />
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "", },]}>
            <Input type='email' placeholder='Enter email' />
        </Form.Item>
        <Divider />
        <Form.Item style={{ textAlign: 'right' }}>
            <Link to='/login' className='link-forgotpassword color-white'>Login</Link>
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" className='btn-primary'>
                Submit
            </Button>
        </Form.Item>
    </>
}


const style: Record<string, string> = {
    '--gap': '1rem'
}