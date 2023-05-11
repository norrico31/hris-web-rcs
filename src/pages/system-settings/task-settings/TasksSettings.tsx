import { useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Tabs } from '../../../components'
import { useAuthContext } from '../../../shared/contexts/Auth'
import { IRolePermission } from '../../../shared/interfaces'

export default function TasksSettings() {
    const navigate = useNavigate()
    let { pathname } = useLocation()
    const { user, loading } = useAuthContext()

    const items = useMemo(() => {
        const permissions = permissionCode(user?.role?.permissions!)
        const taskActivityCodes = [permissions['da03'], permissions['da04'], permissions['da05'], permissions['da06']].flat().length > 0
        const taskTypesCodes = [permissions['db03'], permissions['db04'], permissions['db05'], permissions['db06']].flat().length > 0
        const taskSprintsCodes = [permissions['dc03'], permissions['dc04'], permissions['dc05'], permissions['dc06']].flat().length > 0
        return [
            {
                label: 'Task Activities',
                key: '/tasksettings/activities',
            },
            {
                label: 'Task Types',
                key: '/tasksettings/types',
            },
            {
                label: 'Sprints',
                key: '/tasksettings/sprints',
            },
            // (taskActivityCodes && {
            //     label: 'Task Activities',
            //     key: '/tasksettings/task_activities',
            // }),
            // (taskTypesCodes && {
            //     label: 'Task Types',
            //     key: '/tasksettings/task_types',
            // }),
            // (taskSprintsCodes && {
            //     label: 'Sprints',
            //     key: '/tasksettings/sprints',
            // }),
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