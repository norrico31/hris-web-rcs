import { useState, useEffect, createElement } from 'react'
import { Layout, Dropdown, Typography, Space, MenuProps } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useAxios } from '../../shared/lib/axios'
import { useAuthContext } from '../../shared/contexts/Auth'
import { useEndpoints } from '../../shared/constants'
import { Link } from 'react-router-dom'

const { Header: AntDHeader } = Layout
const { Text: AntText } = Typography

type Props = {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const { GET } = useAxios()
const [{ AUTH: { LOGOUT } }] = useEndpoints()

export default function Header({ collapsed, setCollapsed }: Props) {
    const { user, setUser, setToken } = useAuthContext()

    const toggle = () => {
        collapsed = !collapsed
        setCollapsed(collapsed)
        localStorage.setItem('collapsed', JSON.stringify(collapsed))
    }
    const burgerMenu = createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'trigger',
        onClick: toggle,
    })

    const items: MenuProps['items'] = [
        {
            key: '1',
            danger: true,
            label: <Link to='/profile'>Profile</Link>,
        },
        {
            key: '2',
            danger: true,
            label: (
                <div onClick={logout}>
                    Logout
                </div>
            ),
        },
    ]

    function logout(evt: React.MouseEvent) {
        evt.stopPropagation()
        evt.preventDefault()
        GET(LOGOUT)
            .then(() => {
                localStorage.clear()
                setUser(undefined)
                setToken(undefined)
            })
    }

    return (
        <Container style={{ paddingInline: 0 }}>
            <div className='header-wrapper'>
                {burgerMenu}
                <Text>HR Portal</Text>
            </div>
            <div className='header-wrapper'>
                <Space align='center' size={20}>
                    <CurrentTime />
                    <Dropdown menu={{ items }}>
                        <a onClick={e => e.preventDefault()}>
                            <Space>
                                <UserName>{user?.full_name ?? 'Unknown'}</UserName>
                                <DownOutlined className='dropdown-icon' />
                            </Space>
                        </a>
                    </Dropdown>
                </Space>
            </div>
        </Container>
    )
}

function CurrentTime() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())
    useEffect(() => {
        const timer = setInterval(() => {
            let time = new Date().toLocaleTimeString()
            setCurrentTime(time)
        }, 1000)
        return () => clearInterval(timer)
    }, [])
    return <h3>{currentTime}</h3>
}

const UserName = styled.span`
    color: #45464B;
    font-weight: 500;
    font-size: 16px;
`

const Container = styled(AntDHeader)`
    background: #fff !important;
    padding: 0;
    display: flex;
    justify-content: space-between;

`

const Text = styled(AntText)`
    padding-left: 4px;
    font-weight: bold;
    color: #003765;
`