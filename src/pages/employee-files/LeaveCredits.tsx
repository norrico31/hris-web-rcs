import { Descriptions } from 'antd'
import { useEmployeeCtx } from '../EmployeeEdit'

export default function LeaveCredits() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const { si_leaves, sick_leaves, vacation_leaves } = employeeInfo?.leave_credit ?? {}
    return (
        <div>
            <Descriptions
                title="Leave Credits"
                layout='vertical'
                bordered
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Service Incentive Leave">{si_leaves}</Descriptions.Item>
                <Descriptions.Item label="Sick Leave">{sick_leaves}</Descriptions.Item>
                <Descriptions.Item label="Vacation Leave">{vacation_leaves}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}
