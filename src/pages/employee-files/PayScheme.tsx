import { useState, useEffect } from 'react'
import { Button, Descriptions, Input, Row, Skeleton, Form as AntDForm, Select } from 'antd'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card, Divider, Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IBankDetails } from '../../shared/interfaces'

const [{ EMPLOYEE201: { PAYSCHEME }, SYSTEMSETTINGS: { HRSETTINGS: { BANKDETAILS: { LISTS } } } }] = useEndpoints()
const { PUT, POST } = useAxios()

const { Item: Item, useForm } = AntDForm

export default function PayScheme() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = useForm<Record<string, any>>()
    const [lists, setLists] = useState<IBankDetails[]>([])

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (employeeInfo) {
            form.setFieldsValue({
                ...employeeInfo?.bank_detail
            })
        }
        const controller = new AbortController();
        axiosClient(LISTS, { signal: controller.signal })
            .then((res) => {
                setLists(res?.data ?? [])
            })
        return () => {
            controller.abort()
        }
    }, [employeeInfo])

    function onFinish(values: Record<string, any>) {
        setLoading(true)
        let result = employeeInfo.bank_detail?.id ? PUT(PAYSCHEME.PUT + employeeInfo?.bank_detail?.id, { ...values, user_id: employeeInfo?.id }) : POST(PAYSCHEME.PUT, values)
        result.then(() => fetchData())
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
                        <Descriptions.Item label="Bank Details">
                            <Item name="bank_name" >
                                <Select
                                    placeholder='Select Bank details'
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    <Select.Option value="">Select Bank Details</Select.Option>
                                    {lists.map((bank_detail) => (
                                        <Select.Option value={bank_detail.name} key={bank_detail.id}>{bank_detail.name}</Select.Option>
                                    ))}
                                </Select>
                            </Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="Pay Scheme">
                            <Item name="pay_scheme" >
                                <Select
                                    placeholder='Select pay scheme...'
                                >
                                    <Select.Option value="cash">Cash</Select.Option>
                                    <Select.Option value="bank_account">Bank Account</Select.Option>
                                </Select>
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
