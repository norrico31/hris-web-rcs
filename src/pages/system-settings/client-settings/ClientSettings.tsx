import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components'

export default function ClientSettings() {
    const navigate = useNavigate()
    let { pathname } = useLocation()

    const items = useMemo(() => [
        {
            label: 'Client',
            key: '/clientsettings/clients',
        },
        {
            label: 'Client Branch',
            key: '/clientsettings/client_branches',
        },
        {
            label: 'Client Adjustment',
            key: '/clientsettings/client_adjustments',
        },
    ].map(({ label, key }) => ({
        label,
        key,
        children: <Outlet />
    })), [])

    const activeKey = pathname.slice(15, pathname.length)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return <Tabs
        title='Client Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items}
    />
}