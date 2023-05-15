import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Col, Row, Card as AntDCard, Typography, Calendar, Skeleton } from 'antd'
import { renderTitle } from "../shared/utils/utilities"
import { Card, Divider } from '../components'
import { useAuthContext } from '../shared/contexts/Auth'
import { ROOTPATHS } from '../shared/constants'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'

const { Paragraph, Title } = Typography

export default function Dashboard() {
    renderTitle('Dashboard')
    const { user, loading } = useAuthContext()
    const codes = filterCodes(user?.role?.permissions)

    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loading) return <Skeleton />
    if (!loading && !codes['a01']) return <Navigate to={'/' + !paths.length ? '/profile' : paths[0]} />

    return (
        <Card title='Dashboard'>
            <Divider />
            <Row justify='space-between' gutter={[24, 24]} wrap>
                <Col xs={24} sm={24} md={22} lg={12} xl={11} >
                    <AntDCard
                        hoverable
                        style={{ width: 400 }}
                    // cover={}
                    >
                        <Title level={3}>Bailon, Christian</Title>
                        <Paragraph>Operations Department</Paragraph>
                        <Paragraph>Technical & Delivery Head</Paragraph>
                        <Paragraph type='secondary'>christian.bailon@redcoresolutions.com</Paragraph>
                        {/* <AntDCard.Meta title="" description="christian.bailon@redcoresolutions.com" /> */}
                    </AntDCard>
                </Col>
                <Col xs={24} sm={24} md={22} lg={12} xl={11} >
                    <div>
                        <Calendar fullscreen={false} />
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
            </Row>
        </Card>
    )
}
