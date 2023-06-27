import { useState, useEffect, memo } from 'react'
import { Button, Descriptions, Input, Row, Form as AntDForm, Select, FormInstance } from 'antd'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card, Divider, Form } from '../../components'
import { useEndpoints } from '../../shared/constants'
import axiosClient, { useAxios } from '../../shared/lib/axios'
import { IBankDetails } from '../../shared/interfaces'

const [{ EMPLOYEE201: { PAYSCHEME }, SYSTEMSETTINGS: { HRSETTINGS: { BANKDETAILS: { LISTS } } } }] = useEndpoints()
const { PUT, POST } = useAxios()

const { Item: Item } = AntDForm

const initState = { account_number: '', bank_name: '', pay_scheme: '' }

export default function PayScheme() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [form] = AntDForm.useForm<Record<string, any>>()
    const [lists, setLists] = useState<IBankDetails[]>([])
    const [bankDetails, setBankDetails] = useState({ account_number: '', bank_name: '', pay_scheme: '' })

    const [loading, setLoading] = useState(false)
    console.log(employeeInfo?.bank_detail)
    useEffect(() => {
        if (employeeInfo?.bank_detail) {
            form.setFieldsValue({
                ...employeeInfo?.bank_detail
            })
            setBankDetails(employeeInfo?.bank_detail)
        } else {
            form.setFieldsValue(initState)
            setBankDetails(initState)
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
        let result = employeeInfo.bank_detail?.id ? PUT(PAYSCHEME.PUT + employeeInfo?.bank_detail?.id, { ...values, user_id: employeeInfo?.id }) : POST(PAYSCHEME.PUT, { ...values, user_id: employeeInfo?.id })
        result.then(fetchData)
        setLoading(false)
    }

    return (
        <Card title="Pay Scheme">
            <Divider />
            <Form form={form} onFinish={onFinish} disabled={loading}>
                <Descriptions
                    layout='vertical'
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                >
                    <Descriptions.Item label="Account Number">
                        <Item name="account_number" >
                            <Input placeholder='Enter account number...' value={bankDetails?.account_number} onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })} />
                        </Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bank Details">
                        <Item name="bank_name" >
                            <Select
                                placeholder='Select Bank details'
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                value={bankDetails?.bank_name}
                                onChange={(id) => setBankDetails({ ...bankDetails, bank_name: id })}
                            >
                                {lists.map((bank_detail) => (
                                    <Select.Option value={bank_detail.name} key={bank_detail.id}>{bank_detail.name}</Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Pay Scheme">
                        <Item name="pay_scheme" >
                            <Select
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                placeholder='Select pay scheme...'
                                value={bankDetails?.pay_scheme}
                                onChange={(id) => setBankDetails({ ...bankDetails, pay_scheme: id })}
                            >
                                <Select.Option value="cash" key='cash'>Cash</Select.Option>
                                <Select.Option value="bank_account" key='bank_account'>Bank Account</Select.Option>
                            </Select>
                        </Item>
                    </Descriptions.Item>
                </Descriptions>
                <Row justify='end'>
                    <Button type='primary' htmlType='submit' onClick={onFinish} disabled={!Object.values(bankDetails).some(Boolean)}>Update</Button>
                </Row>
            </Form>
        </Card>
    )
}