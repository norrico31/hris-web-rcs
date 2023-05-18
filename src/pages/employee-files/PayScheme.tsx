import { useState, useEffect } from 'react'
import { Button, Descriptions, Input, Row, Skeleton, Form as AntDForm } from 'antd'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card, Divider, Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import { useAxios } from '../../shared/lib/axios'

const [{ EMPLOYEE201: { PAYSCHEME } }] = useEndpoints()
const { PUT } = useAxios()

const { Item: Item, useForm } = AntDForm

export default function PayScheme() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = useForm<Record<string, any>>()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        form.setFieldsValue({
            ...employeeInfo?.bank_detail
        })
    }, [employeeInfo, fetchData])

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        PUT(PAYSCHEME.PUT + employeeInfo?.bank_detail?.id, { ...values, user_id: employeeInfo?.id })
            .catch(() => {
                fetchData()
            })
        setLoading(false)
    }

    return (
        <Card title="Pay Scheme">
            <Divider />
            {loading ? (<Skeleton />) : (
                <Form form={form} onFinish={onFinish} disabled={loading}>
                    <Descriptions
                        layout='vertical'
                        bordered
                        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    >
                        <Descriptions.Item label="Account Number">
                            <Item name="account_number" >
                                <Input placeholder='Enter account number...' />
                            </Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Bank Name">
                            <Item name="bank_name" >
                                <Input placeholder='Enter bank name...' />
                            </Item>
                            {/* <Input placeholder='Enter bank name...' /> */}
                        </Descriptions.Item>
                        <Descriptions.Item label="Pay Scheme">
                            <Item name="pay_scheme" >
                                <Input placeholder='Enter pay scheme...' />
                            </Item>
                            {/* <Input placeholder='Enter pay scheme...' /> */}
                        </Descriptions.Item>
                    </Descriptions>
                    <Row justify='end'>
                        <Button type='primary' htmlType='submit' onClick={onFinish}>Update</Button>
                    </Row>
                </Form>
            )}
        </Card>
    )
}
