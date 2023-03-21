import { createElement } from 'react'
import { Layout, Dropdown, Typography, Space, MenuProps } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useAxios } from '../../shared/lib/axios'
import { useAuthContext } from '../../shared/contexts/Auth'

const { Header: AntDHeader } = Layout
const { Text: AntText } = Typography

type Props = {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const { POST } = useAxios()

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
        POST('/logout', {})
            .then(() => {
                localStorage.clear()
                setUser(undefined)
                setToken(undefined)
                // window.location.reload()
            })
    }

    return (
        <Container style={{ paddingInline: 0 }}>
            <div className='header-wrapper'>
                {burgerMenu}
                <Text>HRIS</Text>
            </div>
            <div className='header-wrapper'>
                <Dropdown menu={{ items }}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            <UserName>{user?.fullname ?? 'Unknown'}</UserName>
                            <DownOutlined className='dropdown-icon' />
                        </Space>
                    </a>
                </Dropdown>
            </div>
        </Container>
    )
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