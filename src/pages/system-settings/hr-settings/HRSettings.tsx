import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components'

export default function HRSettings() {
    const navigate = useNavigate()
    let { pathname } = useLocation()

    const items = useMemo(() => [
        {
            label: 'Bank Details',
            key: '/hrsettings/bank_details',
        },
        {
            label: 'Benefits',
            key: '/hrsettings/benefits',
        },
        {
            label: 'Holidays',
            key: '/hrsettings/holidays',
        },
        {
            label: 'Holiday Types',
            key: '/hrsettings/holiday_types',
        },
        {
            label: 'Daily Rates',
            key: '/hrsettings/daily_rates',
        },
        {
            label: 'Employee Statuses',
            key: '/hrsettings/employment_statuses',
        },
        {
            label: 'Departments',
            key: '/hrsettings/departments',
        },
        {
            label: 'Teams',
            key: '/hrsettings/teams',
        },
        {
            label: 'Positions',
            key: '/hrsettings/positions',
        },
        {
            label: 'Leave Statuses',
            key: '/hrsettings/leave_statuses',
        },
        {
            label: 'Leave Durations',
            key: '/hrsettings/leave_durations',
        },
        {
            label: 'Leave Types',
            key: '/hrsettings/leave_types',
        },
        {
            label: 'Salaries',
            key: '/hrsettings/salaries',
        },
        {
            label: 'Schedules',
            key: '/hrsettings/schedules',
        },
    ].map(({ label, key }) => ({
        label,
        key,
        children: <Outlet />
    })), [])

    const activeKey = pathname.slice(15, pathname.length)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return <Tabs
        title='HR Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items}
    />
}