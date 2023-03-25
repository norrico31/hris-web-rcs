import { Tabs as AntDTabs, Typography } from 'antd'
import { TabsPosition } from 'antd/es/tabs'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'

type TabsProps = {
    els: { label: string; key: string }[]
    title: string;
    tabPosition?: TabsPosition
}

const { Title: AntDTitle } = Typography

export default function TabsContainer({ title, els, tabPosition = 'left' }: TabsProps) {
    const navigate = useNavigate()
    let { pathname } = useLocation()
    return (
        <>
            <Title level={3}>Tasks Settings</Title>
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
        </>
    )
}

const Title = styled(AntDTitle)`
    margin: 0 0 2rem 0 !important;
`

const Tabs = styled(AntDTabs)`
    height: 220px;
        
    .ant-tabs-tab-active {
        background: #F99D21;
    }
    :where(.css-dev-only-do-not-override-uj3ut5).ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff;
    }
`