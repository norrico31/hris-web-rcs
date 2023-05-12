import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Skeleton } from 'antd'
import { Tabs } from '../../../components'
import { useAuthContext } from '../../../shared/contexts/Auth'
import { IRolePermission } from '../../../shared/interfaces'
import { filterPaths } from '../../../components/layouts/Sidebar'
import { taskSettingsPaths } from '../../../shared/constants'

export default function TasksSettings() {
    const { user, loading } = useAuthContext()
    const navigate = useNavigate()
    let { pathname } = useLocation()
    const taskPaths = useMemo(() => filterPaths(user?.role?.permissions!, taskSettingsPaths), [user?.role?.permissions])

    const items = [
        (taskPaths.includes('activities') && {
            label: 'Task Activities',
            key: '/tasksettings/activities',
        }),
        (taskPaths.includes('types') && {
            label: 'Task Types',
            key: '/tasksettings/types',
        }),
        (taskPaths.includes('sprints') && {
            label: 'Sprints',
            key: '/tasksettings/sprints',
        }),
    ].map((mod) => {
        if (mod) return {
            label: mod?.label,
            key: mod?.key,
            children: <Outlet />
        }
    })

    const activeKey = pathname.slice(15, pathname.length)
    const onChange = (key: string) => navigate('/systemsettings' + key)

    return loading ? <Skeleton /> : <Tabs
        title='Task Management'
        activeKey={activeKey}
        onChange={onChange}
        items={items as any}
    />
}

export function permissionCode(permissions: IRolePermission[]) {
    const roleNames: Record<string, IRolePermission[]> = {}
    for (let i = 0; i < permissions?.length; i++) {
        const permission = permissions[i]
        const permissionName = permission.code.toLocaleLowerCase()
        if (!roleNames[permissionName]) roleNames[permissionName] = []
        roleNames[permissionName].push(permission)
    }
    return roleNames
}