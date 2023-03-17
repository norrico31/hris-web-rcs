import { createElement } from 'react'
import { Layout, Dropdown, Typography, Space } from 'antd'
import type { MenuProps } from 'antd'
import { MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons'
import styled from 'styled-components'

const { Header: AntDHeader } = Layout
const { Text } = Typography

type Props = {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Header({ collapsed, setCollapsed }: Props) {
    const toggle = () => setCollapsed(!collapsed)
    const burgerMenu = createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'trigger',
        onClick: toggle,
    })

    const items: MenuProps['items'] = [
        {
            key: '1',
            danger: true,
            label: (
                <div>
                    Logout
                </div>
            ),
        },
    ];

    return (
        <HeaderComponent style={{ paddingInline: 0 }}>
            <div>
                {burgerMenu}
                <AppTitleContainer>
                    <Text style={{ fontWeight: 'bold', color: '#003765' }}>REDCORE SOLUTIONS INC.</Text>
                </AppTitleContainer>
            </div>
            <div>
                <Dropdown menu={{ items }}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            <UserName>{'TULALANG USER'}</UserName>
                            <DownOutlined className='dropdown-icon' />
                        </Space>
                    </a>
                </Dropdown>
            </div>
        </HeaderComponent>
    )
}

const UserName = styled.span`
    color: #45464B;
    font-weight: 500;
    font-size: 16px;
`

const HeaderComponent = styled(AntDHeader)`
    background: #fff !important;
    padding: 0;
    display: flex;
    justify-content: space-between;
        
    .trigger {
        font-size: 1.35rem;
        margin-left: 1rem;
        line-height: 64px;
        cursor: pointer;
        transition: color 0.3s;
        color: #2e3192;
    }
    div {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    div * {
        margin: 0;
        white-space: nowrap;
        color: #9B3423 !important;
    }
    .dropdown-icon {
        color: gray;
        margin-right: 1.5rem;
    }
`

const AppTitleContainer = styled.span`
    padding-left: 4px;
`