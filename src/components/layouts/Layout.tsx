import { useState, useEffect, useRef, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout as AntdLayout } from 'antd'
import styled from 'styled-components'
import RcsLogo from '../../shared/assets/logo.png'
import LogoSmall from '../../shared/assets/logo-small.png'
import Sidebar from './Sidebar'
import Header from './Header'

const { Sider, Content: AntDContent } = AntdLayout

export default function Layout() {
    const [collapsed, setCollapsed] = useState(true)
    // fetch user data here
    return (
        <AntdLayout style={{ minHeight: '95vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
                <div style={{ height: 64, padding: '.3rem', background: '#fff', display: 'grid' }}>
                    <Logo collapsed={collapsed} />
                </div>
                <Sidebar />
            </Sider>
            <AntdLayout>
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content className='light'>
                    <Outlet />
                </Content>
            </AntdLayout>
        </AntdLayout>
    );
}

const Content = styled(AntDContent)`
    margin: 24px 16px;
    padding: 48px;
    border-radius: 8px;
    border: 1px solid #DFE0EB;
`;

type Logo = {
    collapsed: boolean
}

const Logo = styled.div<Logo>`
    background-size: ${props => !props.collapsed ? 'cover' : '50px'};
    background-image: url(${props => !props.collapsed ? RcsLogo : LogoSmall});
    background-repeat: no-repeat;
    background-position: center;
`