import { Tabs as AntDTabs } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Card from './Card'

type TabsProps = {
    els: { label: string; key: string }[]
    title: string
}

export default function TabsContainer(props: TabsProps) {
    const navigate = useNavigate()
    let { pathname } = useLocation()
    return (
        <Card title={props.title}>
            <Tabs
                activeKey={pathname.slice(15, pathname.length)}
                tabPosition='left'
                onChange={(key) => navigate('/systemsettings' + key)}
                items={props.els.map(({ label, key }) => ({
                    label,
                    key,
                    children: <Outlet />
                }))}
            />
        </Card>
    )
}

const Tabs = styled(AntDTabs)`
    height: 220px;
        
    .ant-tabs-tab-active {
        background: #003765;
    }
    :where(.css-dev-only-do-not-override-1wj873a).ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff;
    }
`