import { useState, useEffect } from 'react'
import { useParams, Navigate, Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import { Tabs as AntDTabs, Button, Col, Row } from 'antd'
import styled from "styled-components"
import useWindowSize from '../shared/hooks/useWindowSize'
import { MainHeader } from './../components'
import { MYTEAMPATHS, useEndpoints } from "../shared/constants"
import { renderTitle } from "../shared/utils/utilities"
import { IArguments, IUser } from '../shared/interfaces'
import { useAxios } from '../shared/lib/axios'

const [{ EMPLOYEE201: { USERPROFILE } }] = useEndpoints()
const { GET } = useAxios()

export default function MyTeamEdit() {
    renderTitle('My Team Edit')
    const { teamId } = useParams()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const { width } = useWindowSize()
    if (teamId == undefined) return <Navigate to='/employee' />

    const [data, setData] = useState<IUser | undefined>()

    useEffect(function fetchUserInfo() {
        const controller = new AbortController();
        fetchData({ signal: controller.signal })
        return () => {
            controller.abort()
        }
    }, [])

    function fetchData(args?: IArguments) {
        GET(USERPROFILE.GET + `/${teamId}`, args?.signal!)
            .then(setData as any satisfies IUser);
    }

    const pathKey = pathname.split('/').pop()
    return <>
        <StyledRow justify='space-between' wrap align='middle' style={{
            gap: width < 579 ? '.5rem' : 'initial',
            textAlign: width < 579 ? 'center' : 'initial'
        }}>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h2 className='color-white'>Team Profile - {data?.full_name}</h2>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={11} style={{ textAlign: width < 579 ? 'center' : 'right' }}>
                <Button onClick={() => navigate('/team')}>Back to teams</Button>
            </Col>
        </StyledRow>
        <Tabs
            destroyInactiveTabPane
            activeKey={'/' + pathKey}
            type="card"
            tabPosition="top"
            size='small'
            onChange={(key) => navigate(`/team/edit/${teamId}` + key)}
            renderTabBar={(props, TabNavList) => (
                <TabNavList {...props} mobile={false} />
            )}
            items={MYTEAMPATHS.map((el) => ({
                label: el.label,
                key: el.key,
                children: <Outlet context={{ teamId, teamInfo: data, fetchData }} />,
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
    teamId: string
    teamInfo: IUser
    fetchData(args?: IArguments): void
}

export function useTeamCtx(): EmployeeOutletContext {
    const { teamId, teamInfo, fetchData }: EmployeeOutletContext = useOutletContext()
    return { teamId, teamInfo, fetchData } as const
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