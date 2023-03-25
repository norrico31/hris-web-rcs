import { useParams, Navigate, Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import { Tabs as AntDTabs } from 'antd'
import styled from "styled-components"
import { MainHeader } from './../components'
import { employeeEditEls } from "../shared/constants"
import { renderTitle } from "../shared/utils/utilities"

export default function EmployeeEdit() {
    renderTitle('Employee Edit')
    const { employeeId } = useParams()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    if (employeeId == undefined) return <Navigate to='/employee' />
    return <>
        <MainHeader>
            <h1 className='color-white'>Employee Edit - Gerald / Full Name</h1>
        </MainHeader>
        <Tabs
            activeKey={pathname.slice(16, pathname.length)}
            type="card"
            tabPosition="top"
            size='small'
            onChange={(key) => navigate(`/employee/edit/${employeeId}` + key)}
            renderTabBar={(props, TabNavList) => (
                <TabNavList {...props} mobile={false} />
            )}
            items={employeeEditEls.map((el) => ({
                label: el.label,
                key: el.key,
                children: <Outlet context={{ employeeId }} />,
            }))}
        />
    </>
}

export function useEmployeeId(): string {
    const { employeeId }: { employeeId: string } = useOutletContext()
    return employeeId
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