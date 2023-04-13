import { useState } from 'react';
import { Button, Col, Row, Form as AntDForm, Divider, Calendar, Modal, Space, Input, DatePicker } from 'antd'
import { MainHeader, Form, Box } from '../components'
import { AiOutlineCalendar } from 'react-icons/ai'
import { Col2 } from './TimeKeeping'
import dayjs from 'dayjs'
import styled from 'styled-components'
import { renderTitle } from '../shared/utils/utilities';

interface ILeave extends Partial<{ id: string }> {
    task_activity: string[]
    task_type: string[]
    sprint_name: string[]
    manhours: string
    date: string
    description: string;
}

export default function Leave() {
    renderTitle('Leave')
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        <>
            <MainHeader>
                <Col>
                    <h1 className='color-white'>Leave</h1>
                </Col>
                <Col>
                    <Button className="btn-timeinout" size="large" onClick={() => setIsModalOpen(true)}>
                        Request
                        <AiOutlineCalendar />
                    </Button>
                </Col>
            </MainHeader>
            <Row justify='space-around' wrap>
                <Col1 xs={24} sm={24} md={14} lg={14} xl={15}>
                    <h2 style={{ color: '#ABABAB' }}>Leave Requests</h2>
                    <Divider />
                    <Box title="Vacation Leave">
                        <p><b>Date</b>: March 22</p>
                        <p>Start time: 06:44 AM</p>
                        <p>End time: 05:44 PM</p>
                        <p><b>Reason</b>: Lorem shit dolor</p>
                    </Box>
                    <Divider />
                    <Box title="Sick Leave">
                        <p><b>Date</b>: March 22</p>
                        <p>Start time: 06:44 AM</p>
                        <p>End time: 05:44 PM</p>
                        <p><b>Reason</b>: Lorem shit dolor</p>
                    </Box>

                </Col1>
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
                    <Button type="primary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}

const Col1 = styled(Col)`
    border: '1px solid #E5E5E5';
    border-radius: '8px';
    padding: '2rem';
    max-height: 700; 
    overflow-x: 'auto';
`