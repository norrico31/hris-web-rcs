import { useMemo } from 'react'
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../../shared/contexts/Auth'
import { Tabs } from '../../../components'
import { filterPaths } from '../../../components/layouts/Sidebar'
import { HRSETTINGSPATHS } from '../../../shared/constants'
import { Skeleton } from 'antd'

export default function HRSettings() {
    const { user, loading } = useAuthContext()
    const navigate = useNavigate()
    let { pathname } = useLocation()
    const hrPaths = useMemo(() => filterPaths(user?.role?.permissions!, HRSETTINGSPATHS), [user?.role?.permissions])

    // TODO PERMISSIONS
    // if (!loading && !hrPaths.length) return <Navigate  to=''/>

    const items = loading ? [] : [
        hrPaths.includes('bankdetails') && {
            label: 'Bank Details',
            key: '/hrsettings/bankdetails',
        },
        hrPaths.includes('benefits') && {
            label: 'Benefits',
            key: '/hrsettings/benefits',
        },
        hrPaths.includes('holidays') && {
            label: 'Holidays',
            key: '/hrsettings/holidays',
        },
        hrPaths.includes('holidaytypes') && {
            label: 'Holiday Types',
            key: '/hrsettings/holidaytypes',
        },
        hrPaths.includes('dailyrates') && {
            label: 'Daily Rates',
            key: '/hrsettings/dailyrates',
        },
        hrPaths.includes('employmentstatuses') && {
            label: 'Employee Statuses',
            key: '/hrsettings/employmentstatuses',
        },
        hrPaths.includes('departments') && {
            label: 'Departments',
            key: '/hrsettings/departments',
        },
        hrPaths.includes('teams') && {
            label: 'Teams',
            key: '/hrsettings/teams',
        },
        hrPaths.includes('positions') && {
            label: 'Positions',
            key: '/hrsettings/positions',
        },
        hrPaths.includes('leavestatuses') && {
            label: 'Leave Statuses',
            key: '/hrsettings/leavestatuses',
        },
        hrPaths.includes('leavedurations') && {
            label: 'Leave Durations',
            key: '/hrsettings/leavedurations',
        },
        hrPaths.includes('leavetypes') && {
            label: 'Leave Types',
            key: '/hrsettings/leavetypes',
        },
        hrPaths.includes('salaries') && {
            label: 'Salaries',
            key: '/hrsettings/salaries',
        },
        hrPaths.includes('schedules') && {
            label: 'Schedules',
            key: '/hrsettings/schedules',
        },
    ].map((paths) => {
        if (paths) return {
            label: paths.label,
            key: paths.key,
            children: <Outlet />
        }
    })

    const activeKey = pathname.slice(15, pathname.length)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return loading ? <Skeleton /> : <Tabs
        title='HR Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items as any}
    />
}