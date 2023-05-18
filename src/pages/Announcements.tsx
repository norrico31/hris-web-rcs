import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Skeleton } from 'antd'
import { useAuthContext } from '../shared/contexts/Auth'
import { Card } from '../components'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { useAxios } from '../shared/lib/axios'

const [{ ANNOUNCEMENT }] = useEndpoints()
const { GET, } = useAxios()

export default function Announcements() {
    const { user, loading } = useAuthContext()
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])


    useEffect(() => {
        GET(ANNOUNCEMENT.GET)
            .then((res) => {
            })
    }, [])

    if (loading) return <Skeleton />
    if (!loading && ['d01', 'd02', 'd03', 'd04'].every((c) => !codes[c])) return <Navigate to={'/' + paths[0]} />
    return (
        <Card title='Announcements'>

        </Card>
    )
}
