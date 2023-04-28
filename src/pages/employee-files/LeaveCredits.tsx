import { Descriptions } from 'antd'
import { useEmployeeCtx } from '../EmployeeEdit'
import { Card } from '../../components'

// TODO: PUT method

export default function LeaveCredits() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const { si_leaves, sick_leaves, vacation_leaves } = employeeInfo?.leave_credit ?? {}

    return (
        <Card title="Leave Credits">
            <Descriptions
                layout='vertical'
                bordered
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Service Incentive Leave">{si_leaves}</Descriptions.Item>
                <Descriptions.Item label="Sick Leave">{sick_leaves}</Descriptions.Item>
                <Descriptions.Item label="Vacation Leave">{vacation_leaves}</Descriptions.Item>
            </Descriptions>
        </Card>
    )
}
