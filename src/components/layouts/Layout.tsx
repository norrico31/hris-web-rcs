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
    const [breakpoint, setBreakpoint] = useState(window.innerWidth >= 768)
    const [collapsedWidth, setCollapsedWidth] = useState(window.innerWidth >= 768 ? 80 : 0)

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

    const onBreakpoint = () => {
        if (!breakpoint) {
            setCollapsedWidth(0)
            setCollapsed(true)
        } else {
            setCollapsedWidth(80)
        }
        setBreakpoint(!breakpoint)
    }

    function handleSelect() {
        return breakpoint && setCollapsed(true)
    }

    return (
        <StyledLayout style={{ minHeight: '95vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={280} breakpoint='md' collapsedWidth={collapsedWidth} onBreakpoint={onBreakpoint}>
                <div style={{ height: 64, padding: '.3rem', background: '#fff', display: 'grid', placeItems: 'center' }}>
                    <Logo collapsed={collapsed} />
                </div>
                <Sidebar onSelect={handleSelect} />
            </Sider>
            <AntdLayout>
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content className='light'>
                    <Outlet />
                </Content>
            </AntdLayout>
        </StyledLayout>
    );
}

const StyledLayout = styled(AntdLayout)`
    @media(max-width: 767px) {
        .ant-layout-sider {
            position: absolute;
            height: 100%;
            z-index: 1;
        }

        .ant-layout-header {
            z-index: 2;
        }
    }
`

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
    width: ${props => !props.collapsed ? '230px' : '50px'};
    height: ${props => !props.collapsed ? '50px' : '50px'};
    background-size: ${props => !props.collapsed ? 'cover' : '50px'};
    background-image: url(${props => !props.collapsed ? RcsLogo : LogoSmall});
    background-repeat: no-repeat;
    background-position: center;
`