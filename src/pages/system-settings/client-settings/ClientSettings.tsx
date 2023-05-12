import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Skeleton } from 'antd'
import { Tabs } from '../../../components'
import { filterPaths } from '../../../components/layouts/Sidebar'
import { useAuthContext } from '../../../shared/contexts/Auth'
import { clientSettingsPaths } from '../../../shared/constants'

export default function ClientSettings() {
    const { user, loading } = useAuthContext()
    const navigate = useNavigate()
    let { pathname } = useLocation()
    const clientPaths = useMemo(() => filterPaths(user?.role?.permissions!, clientSettingsPaths), [user?.role?.permissions])

    const items = useMemo(() => {
        return [
            clientPaths.includes('clients') && {
                label: 'Client',
                key: '/clientsettings/clients',
            },
            clientPaths.includes('clientbranches') && {
                label: 'Client Branch',
                key: '/clientsettings/clientbranches',
            },
            clientPaths.includes('clientadjustments') && {
                label: 'Client Adjustment',
                key: '/clientsettings/clientadjustments',
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
        title='Client Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items as any}
    />
}