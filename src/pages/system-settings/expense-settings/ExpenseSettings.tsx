import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components'
import { EXPENSESETTINGSPATHS } from '../../../shared/constants'

export default function ClientSettings() {
    const navigate = useNavigate()
    let { pathname } = useLocation()

    const items = useMemo(() => EXPENSESETTINGSPATHS.map(({ label, key }) => ({
        label,
        key,
        children: <Outlet />
    })), [])

    const activeKey = pathname.slice(15, pathname.length)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return <Tabs
        title='Expense Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items}
    />
}