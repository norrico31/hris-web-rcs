import { useState } from 'react'
import { Col, Row, Card as AntDCard, Typography, Calendar } from 'antd'
import { renderTitle } from "../shared/utils/utilities"
import { Card, Divider } from '../components'

const infos = [
    {
        id: '1',
        name: 'norrico',
        surname: 'biason'
    },
    {
        id: '2',
        name: 'gerald',
        surname: 'mendones'
    },
    {
        id: '3',
        name: 'jasper',
        surname: 'mendones'
    },
]

const { Paragraph, Title } = Typography

export default function Dashboard() {
    renderTitle('Dashboard')
    const [dataList, setDataList] = useState(infos)
    const [selectedId, setSelectedId] = useState('')
    const [name, setName] = useState('')
    const selectedUser: { [k: string]: string } = dataList.reduce((users, user) => ({ ...users, [user.id]: user }), {})

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
