import { Tabs as AntDTabs } from 'antd'
import { TabsPosition } from 'antd/es/tabs'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Card from './Card'

type TabsProps = {
    els: { label: string; key: string }[]
    title: string;
    tabPosition?: TabsPosition
}

export default function TabsContainer({ title, els, tabPosition = 'left' }: TabsProps) {
    const navigate = useNavigate()
    let { pathname } = useLocation()
    return (
        <Card title={title} level={4}>
            <Tabs
                activeKey={pathname.slice(15, pathname.length)}
                tabPosition={tabPosition}
                onChange={(key) => navigate('/systemsettings' + key)}
                items={els.map(({ label, key }) => ({
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
        background: #F99D21;
    }
    :where(.css-dev-only-do-not-override-uj3ut5).ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff;
    }
`