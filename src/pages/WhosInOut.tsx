import React from 'react'
import { List, Row, Space, Switch, Typography, Divider } from 'antd'
import { Card } from '../components'

export default function WhosInOut() {
    return (
        <Card title="Who's In and Out">
            <Row justify='center'>
                <Space align='center'>
                    <Typography.Title level={2} style={{ margin: 0 }}>In</Typography.Title>
                    <Switch />
                    <Typography.Title level={2} style={{ margin: 0 }}>Out</Typography.Title>
                </Space>
            </Row>
            <Divider />
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 3,
                    xl: 3,
                    xxl: 3,
                }}
                dataSource={data}
                renderItem={(item) => (
                    <List.Item>
                        <Card title={item.title}>Card content</Card>
                    </List.Item>
                )}
            />
        </Card>
    )
}

const data = [
    {
        title: 'Title 1',
    },
    {
        title: 'Title 2',
    },
    {
        title: 'Title 3',
    },
    {
        title: 'Title 4',
    },
    {
        title: 'Title 5',
    },
    {
        title: 'Title 6',
    },
    {
        title: 'Title 7',
    },
    {
        title: 'Title 8',
    },
    {
        title: 'Title 9',
    },
    {
        title: 'Title 10',
    },
];