import { useState, useEffect, useMemo, ReactNode } from 'react'
import { useParams, Navigate, Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import { Tabs as AntDTabs, Button, Col, Row, Skeleton } from 'antd'
import styled from "styled-components"
import useWindowSize from '../shared/hooks/useWindowSize'
import { EMPLOYEEPATHS, ROOTPATHS, useEndpoints } from "../shared/constants"
import { renderTitle } from "../shared/utils/utilities"
import { IArguments, IUser } from '../shared/interfaces'
import { useAxios } from '../shared/lib/axios'
import { StyledWidthRow } from './MyTeamEdit'
import { filterCodes, filterPaths } from '../components/layouts/Sidebar'
import { useAuthContext } from '../shared/contexts/Auth'

const [{ EMPLOYEE201: { USERPROFILE } }] = useEndpoints()
const { GET } = useAxios()

export default function EmployeeEdit() {
    renderTitle('Employee Update')
    const { user, loading } = useAuthContext()
    const { employeeId } = useParams()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    if (employeeId == undefined) return <Navigate to='/employee' />

    const [data, setData] = useState<IUser | undefined>()

    const codes = filterCodes(user?.role?.permissions)
    const paths = useMemo(() => filterPaths(user?.role?.permissions!, ROOTPATHS), [user])
    if (loading) return <Skeleton />
    if (!loading && !codes['g01']) return <Navigate to={'/' + paths[0]} />

    useEffect(function fetchUserInfo() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    function fetchData(args?: IArguments) {
        GET(USERPROFILE.GET + `/${employeeId}`, args?.signal!)
            .then(setData as any satisfies IUser);
    }

    const pathKey = pathname.split('/').pop()
    return <>
        <StyledWidthRow>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h2 className='color-white'>Employee Update - {data?.full_name}</h2>
            </Col>
            <ColWidth>
                <Button onClick={() => navigate('/employee')}>Back to employees</Button>
            </ColWidth>
        </StyledWidthRow>
        <Tabs
            destroyInactiveTabPane
            activeKey={'/' + pathKey}
            type="card"
            tabPosition="top"
            size='small'
            onChange={(key) => navigate(`/employee/edit/${employeeId}` + key)}
            renderTabBar={(props, TabNavList) => (
                <TabNavList {...props} mobile={false} />
            )}
            items={EMPLOYEEPATHS.map((el) => ({
                label: el.label,
                key: el.key,
                children: <Outlet context={{ employeeId, employeeInfo: data, fetchData }} />,
            }))}
        />
    </>
}


function ColWidth({ children }: { children: ReactNode }) {
    const { width } = useWindowSize()
    return <Col xs={24} sm={12} md={12} lg={12} xl={11} style={{ textAlign: width < 579 ? 'center' : 'right' }}>
        {children}
    </Col>
}

export const StyledRow = styled(Row)`
    width: 100%;
    background: rgb(155, 52, 35);
    border-radius: 8px;
    display: flex;
    padding: 1rem 2rem;
    margin-bottom: 2rem;
`

interface EmployeeOutletContext {
    employeeId: string
    employeeInfo: IUser
    fetchData(args?: IArguments): void
}

export function useEmployeeCtx(): EmployeeOutletContext {
    const { employeeId, employeeInfo, fetchData }: EmployeeOutletContext = useOutletContext()
    return { employeeId, employeeInfo, fetchData } as const
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