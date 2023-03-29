import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Layout as AntdLayout } from 'antd'
import styled from 'styled-components'
import axiosClient from '../../shared/lib/axios'
import { useAuthContext } from '../../shared/contexts/Auth'
import RcsLogo from '../../shared/assets/logo.png'
import LogoSmall from '../../shared/assets/logo-small.png'
import Sidebar from './Sidebar'
import Header from './Header'
import { useEndpoints } from '../../shared/constants'
import { AuthUserRes } from '../../shared/interfaces'

const { Sider, Content: AntDContent } = AntdLayout
const [{ AUTH: { USER, LOGIN } }] = useEndpoints()

export default function Layout() {
    const { token, setToken, setUser } = useAuthContext()
    if (token == undefined) return <Navigate to={LOGIN} />

    const [collapsed, setCollapsed] = useState(() => {
        let isCollapsed = localStorage.getItem('collapsed')
        if (isCollapsed != null) {
            return JSON.parse(isCollapsed)
        }
        return false
    })

    useEffect(() => {
        let cleanUp = false;
        axiosClient.get<AuthUserRes>(USER)
            .then((res) => !cleanUp && setUser(res?.data?.data))
            .catch((err: any) => {
                if (err.response && err.response.status === 401) {
                    setToken(undefined)
                    setUser(undefined)
                    return <Navigate to={LOGIN} />
                }
            })
        return function () {
            cleanUp = true
        }
    }, [])

    return (
        <AntdLayout style={{ minHeight: '95vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={280}>
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