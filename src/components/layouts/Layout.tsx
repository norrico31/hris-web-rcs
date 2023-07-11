import { useState, useEffect, ReactNode } from 'react'
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
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
import { useDarkMode } from '../../shared/contexts/DarkMode'
import useWindowSize from '../../shared/hooks/useWindowSize'

const { Sider, Content: AntDContent } = AntdLayout
const [{ AUTH: { USER, LOGIN } }] = useEndpoints()

export default function Layout() {
    const { user, token, setToken, setUser, setLoading } = useAuthContext()
    if (token == undefined) return <Navigate to={LOGIN} />
    const { isDarkMode } = useDarkMode()
    const location = useLocation()

    const [collapsed, setCollapsed] = useState(() => {
        let isCollapsed = localStorage.getItem('collapsed')
        if (isCollapsed != null) {
            return JSON.parse(isCollapsed)
        }
        return false
    })
    const [breakpoint, setBreakpoint] = useState(window.innerWidth >= 768)
    const [collapsedWidth, setCollapsedWidth] = useState(window.innerWidth >= 768 ? 80 : 0)

    const navigate = useNavigate()
    useEffect(() => {
        let cleanUp = false;
        let pathLocalStorage = localStorage.getItem('pathname')
        pathLocalStorage = pathLocalStorage != null ? JSON.parse(pathLocalStorage) : null
        if (pathLocalStorage === '/login/AEDkj90') {
            if (!user) {
                setLoading(true)
                axiosClient.get<AuthUserRes>(USER)
                    .then((res) => !cleanUp && setUser(res?.data?.data))
                    .catch((err: any) => {
                        if (err.response && err.response.status === 401) {
                            setToken(undefined)
                            setUser(undefined)
                            return <Navigate to={LOGIN} />
                        }
                    }).finally(() => setLoading(false))
            }
        } else {
            setToken(undefined)
            setUser(undefined)
            navigate('/login')
        }
        return function () {
            cleanUp = true
        }
    }, [user])

    const onBreakpoint = () => {
        if (!breakpoint) {
            setCollapsedWidth(0)
            setCollapsed(true)
        } else {
            setCollapsedWidth(80)
        }
        setBreakpoint(!breakpoint)
    }

    const handleSelect = () => breakpoint && setCollapsed(true)

    return (
        <StyledLayout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={280} breakpoint='md' collapsedWidth={collapsedWidth} onBreakpoint={onBreakpoint}>
                <div style={{ height: 64, padding: '.3rem', background: isDarkMode ? '#313131' : '#fff', display: 'grid', placeItems: 'center' }}>
                    <Logo collapsed={collapsed} isDarkMode={isDarkMode} />
                </div>
                <Sidebar onSelect={handleSelect} collapsed={collapsed} />
            </Sider>
            <AntdLayout style={{ backgroundColor: isDarkMode ? '#424242' : '#fff' }}>
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                <MainContent isDarkMode={isDarkMode}>
                    <Outlet />
                </MainContent>
            </AntdLayout>
        </StyledLayout>
    );
}

function MainContent({ isDarkMode, children }: { isDarkMode: boolean; children: ReactNode }) {
    const { width } = useWindowSize()
    return <Content
        // className={isDarkMode ? 'bg-dark' : 'bg-light'}
        style={{ padding: width > 420 ? 24 : 10 }}
    >{children}</Content>
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
    isDarkMode: boolean
}

const Logo = styled.div<Logo>`
    width: ${props => !props.collapsed ? '230px' : '50px'};
    height: ${props => !props.collapsed ? '50px' : '50px'};
    background-size: ${props => !props.collapsed ? 'cover' : '50px'};
    background-image: url(${props => !props.collapsed ? RcsLogo : LogoSmall});
    background-repeat: no-repeat;
    background-position: center;
    background-color: ${({ isDarkMode }) => isDarkMode ? '#313131' : '#fff'} ;
`