import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs as AntDTabs, Col, } from 'antd'
import { renderTitle } from '../shared/utils/utilities'
import { useAuthContext } from '../shared/contexts/Auth'
import styled from 'styled-components'
import { StyledRow } from './EmployeeEdit'
import useWindowSize from '../shared/hooks/useWindowSize'

export default function Overtime() {
    renderTitle('Overtime')
    const { user } = useAuthContext()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const pathKey = pathname.split('/').pop()
    const { width } = useWindowSize()

    const items = [
        {
            label: 'My Overtime',
            key: '/myovertime',
        },
        {
            label: 'Archives',
            key: '/archives',
        },
    ];
    (user?.role.name.toLowerCase() == 'manager' || user?.role.name.toLowerCase() == 'admin') && items.push({
        label: 'For Approval',
        key: '/approval',
    },)

    return <>
        <StyledRow justify='space-between' wrap align='middle' style={{
            gap: width < 579 ? '.5rem' : 'initial',
            textAlign: width < 579 ? 'center' : 'initial'
        }}>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h1 className='color-white'>Overtime</h1>
            </Col>
        </StyledRow>
        <Tabs
            destroyInactiveTabPane
            activeKey={'/' + pathKey}
            type="card"
            tabPosition="top"
            size='small'
            onChange={(key) => navigate(`/overtime` + key)}
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
