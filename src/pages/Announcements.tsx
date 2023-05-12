import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Skeleton } from 'antd'
import { useAuthContext } from '../shared/contexts/Auth'
import { Card } from '../components'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { rootPaths } from '../shared/constants'

export default function Announcements() {
    const { user, loading } = useAuthContext()
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, rootPaths), [user])
    if (loading) return <Skeleton />
    if (!loading && ['d01', 'd02', 'd03', 'd04'].includes(codes)) return <Navigate to={'/' + paths[0]} />
    return (
        <Card title='Announcements'>

        </Card>
    )
}
