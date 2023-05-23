import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Col, Row, Card as AntDCard, Typography, Calendar, Skeleton } from 'antd'
import { renderTitle } from "../shared/utils/utilities"
import { Card, Divider } from '../components'
import { useAuthContext } from '../shared/contexts/Auth'
import { ROOTPATHS, useEndpoints } from '../shared/constants'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import axiosClient, { useAxios } from '../shared/lib/axios'

const { Paragraph, Title } = Typography

const [{ ANNOUNCEMENT }] = useEndpoints()
const { GET, } = useAxios()

// Whos in/out (COUNT)
// Holidays
// Leaves


export default function Dashboard() {
    renderTitle('Dashboard')
    const { user, loading } = useAuthContext()
    const codes = filterCodes(user?.role?.permissions)

    useEffect(() => {
        GET(ANNOUNCEMENT.GET)
            .then((res) => {

            })
    }, [])

    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loading) return <Skeleton />
    if (!loading && !codes['a01']) {
        if (paths.length > 0) return <Navigate to={'/' + paths[0]} />
        return <Navigate to='/profile' />
    }

    return (
        <Card title='Dashboard'>
            {/* <Divider /> */}
            {/* <Row justify='space-between' gutter={[24, 24]} wrap>
                <Col xs={24} sm={24} md={22} lg={12} xl={11} >
                    <AntDCard
                        hoverable
                        style={{ width: 400 }}
                    >
                        <Title level={3}>Bailon, Christian</Title>
                        <Paragraph>Operations Department</Paragraph>
                        <Paragraph>Technical & Delivery Head</Paragraph>
                        <Paragraph type='secondary'>christian.bailon@redcoresolutions.com</Paragraph>
                    </AntDCard>
                </Col>
                <Col xs={24} sm={24} md={22} lg={12} xl={11} >
                    <div>
                        <h2>Holidays</h2>
                    </div>
                </Col>
                <Col xs={24} sm={24} md={22} lg={12} xl={11} >
                    <AntDCard title='Announcements' style={{ minHeight: 500, maxHeight: 500 }}>

                    </AntDCard>
                </Col>
                <Col xs={24} sm={24} md={22} lg={12} xl={11} >
                    <Card title='Events' level={4} style={{ minHeight: 500, maxHeight: 500 }}>

                    </Card>
                </Col>
            </Row> */}
            <h1>HELLO WORLD!</h1>
        </Card>
    )
}
