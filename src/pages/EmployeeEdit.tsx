import { useState, useEffect } from 'react'
import { useParams, Navigate, Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom"
import { Tabs as AntDTabs } from 'antd'
import styled from "styled-components"
import { MainHeader } from './../components'
import { employeeEditEls, useEndpoints } from "../shared/constants"
import { renderTitle } from "../shared/utils/utilities"
import { IArguments, IUser } from '../shared/interfaces'
import { useAxios } from '../shared/lib/axios'

const [{ EMPLOYEE201: { USERPROFILE } }] = useEndpoints()
const { GET } = useAxios()

export default function EmployeeEdit() {
    renderTitle('Employee Edit')
    const { employeeId } = useParams()
    let { pathname } = useLocation()
    const navigate = useNavigate()
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
        <MainHeader>
            <h1 className='color-white'>Employee Edit - {data?.full_name}</h1>
        </MainHeader>
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
            items={employeeEditEls.map((el) => ({
                label: el.label,
                key: el.key,
                children: <Outlet context={{ employeeId, employeeInfo: data, fetchData }} />,
            }))}
        />
    </>
}

interface EmployeeOutletContext {
    employeeId: string
    employeeInfo: IUser
    fetchData(args?: IArguments): void
}

export function useEmployeeId(): EmployeeOutletContext {
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