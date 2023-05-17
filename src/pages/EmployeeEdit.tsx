import { useState, useEffect } from 'react'
import { useParams, Navigate, Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import { Tabs as AntDTabs, Button, Col, Row } from 'antd'
import styled from "styled-components"
import useWindowSize from '../shared/hooks/useWindowSize'
import { MainHeader } from './../components'
import { EMPLOYEEPATHS, useEndpoints } from "../shared/constants"
import { renderTitle } from "../shared/utils/utilities"
import { IArguments, IUser } from '../shared/interfaces'
import { useAxios } from '../shared/lib/axios'

const [{ EMPLOYEE201: { USERPROFILE } }] = useEndpoints()
const { GET } = useAxios()

export default function EmployeeEdit() {
    renderTitle('Employee Update')
    const { employeeId } = useParams()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const { width } = useWindowSize()
    if (employeeId == undefined) return <Navigate to='/employee' />

    const [data, setData] = useState<IUser | undefined>()

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
        <StyledRow justify='space-between' wrap align='middle' style={{
            gap: width < 579 ? '.5rem' : 'initial',
            textAlign: width < 579 ? 'center' : 'initial'
        }}>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h2 className='color-white'>Employee Update - {data?.full_name}</h2>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={11} style={{ textAlign: width < 579 ? 'center' : 'right' }}>
                <Button onClick={() => navigate('/employee')}>Back to employees</Button>
            </Col>
        </StyledRow>
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