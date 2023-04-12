import React from 'react'
import { Descriptions } from 'antd'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card } from '../../components'

export default function PayScheme() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    return (
        <Card title="Pay Scheme">
            <Descriptions
                layout='vertical'
                bordered
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Account Number">{employeeInfo?.bank_detail.account_number ? employeeInfo?.bank_detail.account_number : 'NA'}</Descriptions.Item>
                <Descriptions.Item label="Bank Name">{employeeInfo?.bank_detail.bank_name ? employeeInfo?.bank_detail.bank_name : 'NA'}</Descriptions.Item>
                <Descriptions.Item label="Pay Scheme">{employeeInfo?.bank_detail.pay_scheme ? employeeInfo?.bank_detail.pay_scheme : 'NA'}</Descriptions.Item>
            </Descriptions>
        </Card>
    )
}
