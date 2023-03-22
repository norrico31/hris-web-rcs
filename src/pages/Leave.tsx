import { useState } from 'react';
import { Button, Col, Row, Form as AntDForm, Divider, Card, Calendar, Modal, Space, Input, DatePicker, Select } from 'antd'
import { MainHeader, Form } from '../components'
import { AiOutlineCalendar } from 'react-icons/ai'
import { Col2 } from './TimeKeeping'
import dayjs from 'dayjs';

interface ILeave extends Partial<{ id: string }> {
    task_activity: string[]
    task_type: string[]
    sprint_name: string[]
    manhours: string
    date: string
    description: string;
}

export default function Leave() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        <>
            <MainHeader>
                <Col>
                    <h2 className='color-secondary'>Leave</h2>
                    <h1 className='color-secondary'>File Leave</h1>
                    {/* <h3>{currentDay}</h3> */}
                    {/* <h2>{currentDate}</h2> */}
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        Request
                        <AiOutlineCalendar />
                    </Button>
                </Col>
            </MainHeader>
            <Row justify='space-around' wrap>
                <Col xs={24} sm={24} md={14} lg={14} xl={15} style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '2rem', maxHeight: 700, overflowX: 'auto' }}>
                    <h2 style={{ color: '#ABABAB' }}>Leave Requests</h2>
                    <Divider />
                    <Card title="Vacation Leave" bordered={false} style={{ width: '100%' }}>
                        <p><b>Date</b>: March 22</p>
                        <p>Start time: 06:44 AM</p>
                        <p>End time: 05:44 PM</p>
                        <p><b>Reason</b>: Lorem shit dolor</p>
                    </Card>
                    <Divider />
                    <Card title="Sick Leave" bordered={false} style={{ width: '100%' }}>
                        <p><b>Date</b>: March 22</p>
                        <p>Start time: 06:44 AM</p>
                        <p>End time: 05:44 PM</p>
                        <p><b>Reason</b>: Lorem shit dolor</p>
                    </Card>

                </Col>
                <Col2 xs={24} sm={24} md={9} lg={9} xl={8} height={350}>
                    <Calendar fullscreen={false} />
                </Col2>
            </Row>
            <LeaveModal
                isModalOpen={isModalOpen}
                handleCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}


type ModalProps = {
    isModalOpen: boolean
    handleCancel: () => void
}
const { Item: FormItem, useForm } = AntDForm

function LeaveModal({ isModalOpen, handleCancel }: ModalProps) {
    const [form] = useForm<ILeave>()

    function onFinish(values: ILeave) {
        // payload (name: loginUser.name, leave_status: 'PENDING')

        // if success
        let { date, description, ...restProps } = values
        date = dayjs(date, 'YYYY/MM/DD') as any
        restProps = { ...restProps, date, ...(description != undefined && { description }) } as any
        console.log(restProps)
        form.resetFields()
        handleCancel()
    }

    return <Modal title='Request a Leave' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish}>
            <FormItem
                label="Leave Type"
                name="leave_type_id"
                required
                rules={[{ required: true, message: 'Please enter types name!' }]}
            >
                <Input placeholder='Enter type name...' />
            </FormItem>
            <FormItem
                label="Start Date"
                name="start_date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem
                label="End Date"
                name="end_date"
                required
                rules={[{ required: true, message: 'Please select date!' }]}
            >
                <DatePicker
                    format='YYYY/MM/DD'
                    style={{ width: '100%' }}
                />
            </FormItem>
            <FormItem
                label="Reason"
                name="reason"
                required
                rules={[{ required: true, message: 'Please enter your reason for leave!' }]}
            >
                <Input.TextArea placeholder='Enter reason...' />
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit">
                        Submit Request
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}