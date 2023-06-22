import { useEffect, useMemo } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs as AntDTabs, Col, Skeleton, } from 'antd'
import styled from 'styled-components'
import { renderTitle } from '../shared/utils/utilities'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { StyledWidthRow } from './MyTeamEdit'
import { ROOTPATHS } from '../shared/constants'

export default function Overtime() {
    renderTitle('Overtime')
    const { user, loading } = useAuthContext()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const pathKey = pathname.split('/').pop()
    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])

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
    (codes['f06']) && items.push({
        label: 'For Approval',
        key: '/approval',
    },)

    useEffect(() => {
        if (pathname == '/overtime/approval' && !codes['c06']) return navigate('/overtime/myovertime')
    }, [])

    if (loading) return <Skeleton />
    if (!loading && !codes['f01']) return <Navigate to={'/' + paths[0]} />

    return <>
        <StyledWidthRow>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h1 className='color-white'>Overtime</h1>
            </Col>
        </StyledWidthRow>
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
