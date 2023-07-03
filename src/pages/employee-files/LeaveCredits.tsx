import { useState } from 'react'
import { Descriptions, Input, Button, Form as AntDForm, Modal, InputNumber, Space, Switch } from 'antd'
import dayjs from 'dayjs'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card, Form } from '../../components'
import { useAxios } from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import { IArguments, ILeaveCredits } from '../../shared/interfaces'

const [{ EMPLOYEE201: { EMPLOYEESALARY }, SYSTEMSETTINGS: { HRSETTINGS: { SALARYRATES } } }] = useEndpoints()
const { GET, POST, DELETE, PUT } = useAxios()

export default function LeaveCredits() {
    const { employeeInfo, fetchData } = useEmployeeCtx()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const latestVl = employeeInfo?.latest_vl
    const latestSL = employeeInfo?.latest_sl

    return (
        <Card title="Leave Credits">
            <Descriptions
                layout='vertical'
                bordered
                column={{ xxl: 4, xl: 4, lg: 4, md: 4, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Type">
                    {latestVl?.type}
                </Descriptions.Item>
                <Descriptions.Item label="Credit">
                    {latestVl?.credit}
                </Descriptions.Item>
                <Descriptions.Item label="Debit">
                    {latestVl?.debit}
                </Descriptions.Item>
                <Descriptions.Item label="Balance">
                    {latestVl?.balance}
                </Descriptions.Item>
                <Descriptions.Item>
                    {latestSL?.type}
                </Descriptions.Item>
                <Descriptions.Item >
                    {latestSL?.credit}
                </Descriptions.Item>
                <Descriptions.Item >
                    {latestSL?.debit}
                </Descriptions.Item>
                <Descriptions.Item >
                    {latestSL?.balance}
                </Descriptions.Item>
            </Descriptions>
            <div style={{ textAlign: 'right', margin: 10 }}>
                <Button type='primary' onClick={() => setIsModalOpen(true)}>Update</Button>
                <LeaveCreditsAdjustment
                    isModalOpen={isModalOpen}
                    handleCancel={() => setIsModalOpen(false)}
                    fetchData={fetchData}
                    latestSL={latestSL}
                    latestVL={latestVl}
                />
            </div>
        </Card>
    )
}

type ModalProps = {
    latestVL: ILeaveCredits
    latestSL: ILeaveCredits
    isModalOpen: boolean
    fetchData: (args?: IArguments | undefined) => void
    handleCancel: () => void
}

const { Item: Item, useForm } = AntDForm

function LeaveCreditsAdjustment({ latestVL, latestSL, isModalOpen, handleCancel, fetchData }: ModalProps) {
    const [form] = useForm<Record<string, any>>()
    const [loading, setLoading] = useState(false)
    const [isVl, setIsVl] = useState(false)

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        const date = dayjs().format('YYYY-MM-DD')
        const payload = {
            ...values,
            id: isVl ? latestVL?.id : latestSL?.id,
            type: isVl ? 'VL' : 'SL',
            balance: isVl ? latestVL?.balance : latestSL?.balance,
            credit: values.credit === undefined ? 0 : values.credit,
            debit: values.debit === undefined ? 0 : values.debit,
            date
        }
        POST('/leave_credits', payload)
            .then(() => {
                form.resetFields()
                handleCancel()
            }).finally(() => {
                fetchData()
                setLoading(false)
            })
    }

    return <Modal title='Leave Credits - Adjustments' open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <Item
                label="Type SL / VL"
            >
                <Switch checkedChildren="VL" unCheckedChildren="SL" checked={isVl} onChange={() => setIsVl(!isVl)} />
            </Item>
            <Item
                label="Credit"
                name="credit"
            >
                <Input type='number' placeholder='Enter Credit...' />
            </Item>
            <Item
                label="Debit"
                name="debit"
            >
                <Input type='number' placeholder='Enter Debit...' />
            </Item>
            <Descriptions
                bordered
                layout='vertical'
            >
                <Descriptions.Item label={`Balance - ${isVl ? 'VL' : 'SL'}`}>
                    {!isVl ? latestSL?.balance : latestVL?.balance}
                </Descriptions.Item>
            </Descriptions>
            <Item style={{ textAlign: 'right', margin: '20px 0' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading}>
                        Cancel
                    </Button>
                </Space>
            </Item>
        </Form>
    </Modal>
}