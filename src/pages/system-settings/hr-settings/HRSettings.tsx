import { useMemo } from 'react'
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../../shared/contexts/Auth'
import { Tabs } from '../../../components'
import { filterPaths } from '../../../components/layouts/Sidebar'
import { hrSettingsPaths } from '../../../shared/constants'
import { Skeleton } from 'antd'

export default function HRSettings() {
    const { user, loading } = useAuthContext()
    const navigate = useNavigate()
    let { pathname } = useLocation()
    const hrPaths = useMemo(() => filterPaths(user?.role?.permissions!, hrSettingsPaths), [user?.role?.permissions])

    // TODO
    // if (!loading && !hrPaths.length) return <Navigate  to=''/>

    const items = useMemo(() => {
        return [
            !loading && hrPaths.includes('bankdetails') && {
                label: 'Bank Details',
                key: '/hrsettings/bankdetails',
            },
            !loading && hrPaths.includes('benefits') && {
                label: 'Benefits',
                key: '/hrsettings/benefits',
            },
            !loading && hrPaths.includes('holidays') && {
                label: 'Holidays',
                key: '/hrsettings/holidays',
            },
            !loading && hrPaths.includes('holidaytypes') && {
                label: 'Holiday Types',
                key: '/hrsettings/holidaytypes',
            },
            !loading && hrPaths.includes('dailyrates') && {
                label: 'Daily Rates',
                key: '/hrsettings/dailyrates',
            },
            !loading && hrPaths.includes('employmentstatuses') && {
                label: 'Employee Statuses',
                key: '/hrsettings/employmentstatuses',
            },
            !loading && hrPaths.includes('departments') && {
                label: 'Departments',
                key: '/hrsettings/departments',
            },
            !loading && hrPaths.includes('teams') && {
                label: 'Teams',
                key: '/hrsettings/teams',
            },
            !loading && hrPaths.includes('positions') && {
                label: 'Positions',
                key: '/hrsettings/positions',
            },
            !loading && hrPaths.includes('leavestatuses') && {
                label: 'Leave Statuses',
                key: '/hrsettings/leavestatuses',
            },
            !loading && hrPaths.includes('leavedurations') && {
                label: 'Leave Durations',
                key: '/hrsettings/leavedurations',
            },
            !loading && hrPaths.includes('leavetypes') && {
                label: 'Leave Types',
                key: '/hrsettings/leavetypes',
            },
            !loading && hrPaths.includes('salaries') && {
                label: 'Salaries',
                key: '/hrsettings/salaries',
            },
            !loading && hrPaths.includes('schedules') && {
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
    }, [user, loading])

    const activeKey = pathname.slice(15, pathname.length)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return loading ? <Skeleton /> : <Tabs
        title='HR Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items as any}
    />
}