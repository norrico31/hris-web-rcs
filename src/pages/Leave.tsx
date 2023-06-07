import { useEffect, ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs as AntDTabs, Col } from 'antd'
import { renderTitle } from '../shared/utils/utilities'
import styled from 'styled-components'
import { StyledRow } from './EmployeeEdit'
import useWindowSize from '../shared/hooks/useWindowSize'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes } from '../components/layouts/Sidebar'

export default function Leave() {
    renderTitle('Leave')
    const { user, loading } = useAuthContext()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const pathKey = pathname.split('/').pop()
    const codes = filterCodes(user?.role?.permissions)

    const items = [
        {
            label: 'My Leaves',
            key: '/myleaves',
        },
        {
            label: 'Archives',
            key: '/archives',
        },
    ];
    (codes['c06']) && items.push({
        label: 'For Approval',
        key: '/approval',
    },)

    useEffect(() => {
        if (pathname == '/leave/approval' && !codes['c06']) return navigate('/leave/myleaves')
    }, [])

    return <>
        <StyledWidthRow>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h1 className='color-white'>Leaves</h1>
            </Col>
        </StyledWidthRow>
        <Tabs
            destroyInactiveTabPane
            activeKey={'/' + pathKey}
            type="card"
            tabPosition="top"
            size='small'
            onChange={(key) => navigate(`/leave` + key)}
            renderTabBar={(props, TabNavList) => (
                <TabNavList {...props} mobile={false} />
            )}
            items={items.map((el) => ({
                label: el.label,
                key: el.key,
                children: <Outlet />,
            }))}
        />
    </>
}

function StyledWidthRow({ children }: { children: ReactNode }) {
    const { width } = useWindowSize()
    return <StyledRow justify='space-between' wrap align='middle' style={{
        gap: width < 579 ? '.5rem' : 'initial',
        textAlign: width < 579 ? 'center' : 'initial'
    }}>{children}</StyledRow>
}

const Tabs = styled(AntDTabs)`
    .ant-tabs-nav-list {
        gap: 10px;
    }
    .ant-tabs-tab.ant-tabs-tab-active {
        background: #9B3423;
        color: #fff;
    }
    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff;
    }
`