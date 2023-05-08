import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components'
import { useAuthContext } from '../../../shared/contexts/Auth'

export default function TasksSettings() {
    const navigate = useNavigate()
    let { pathname } = useLocation()
    const { user } = useAuthContext()

    const items = useMemo(() => {
        const modules = new Map(user?.modules.map((mod) => [mod.name, mod])) ?? new Map()
        return [
            (modules.has('task_activities') && {
                label: 'Task Activities',
                key: '/tasksettings/task_activities',
            }),
            (modules.has('task_types') && {
                label: 'Task Types',
                key: '/tasksettings/task_types',
            }),
            (modules.has('sprints') && {
                label: 'Sprints',
                key: '/tasksettings/sprints',
            }),
        ].map((mod) => {
            if (mod) {
                return {
                    label: mod?.label,
                    key: mod?.key,
                    children: <Outlet />
                }
            }
        }) ?? []
    }, [user?.modules])

    const activeKey = pathname.slice(15, pathname.length)

    const onChange = (key: string) => navigate('/systemsettings' + key)

    return <Tabs
        title='Tasks Settings'
        activeKey={activeKey}
        onChange={onChange}
        items={items as any}
    />
}