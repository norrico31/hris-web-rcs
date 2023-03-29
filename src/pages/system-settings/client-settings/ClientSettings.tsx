import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components'
import { hrSettingsPaths } from '../../../shared/constants'

export default function ClientSettings() {
    const navigate = useNavigate()
    let { pathname } = useLocation()

    const items = useMemo(() => hrSettingsPaths.map(({ label, key }) => ({
        label,
        key,
        children: <Outlet />
    })), [])

    const activeKey = pathname.slice(15, pathname.length)
    console.log(activeKey)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return <Tabs
        title='Client Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items}
    />
}