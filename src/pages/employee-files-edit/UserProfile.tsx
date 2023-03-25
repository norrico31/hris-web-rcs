import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'

export default function UserProfileEmployee() {
    const employeeId = useEmployeeId()
    return (
        <Card title='Personal Information'>UserProfileEmployee</Card>
    )
}
