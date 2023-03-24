import { useState } from 'react'
import { useEmployeeId } from '../EmployeeEdit'

export default function UserProfileEmployee() {
    const employeeId = useEmployeeId()
    console.log(employeeId)
    return (
        <div>UserProfileEmployee</div>
    )
}
