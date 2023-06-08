import { useEffect, ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Tabs as AntDTabs, Col, Button } from 'antd'
import { renderTitle } from '../shared/utils/utilities'
import styled from 'styled-components'
import { StyledRow } from './EmployeeEdit'
import useWindowSize from '../shared/hooks/useWindowSize'
import { useAuthContext } from '../shared/contexts/Auth'
import { filterCodes } from '../components/layouts/Sidebar'
import { Table } from '../components'
import { ColumnsType } from 'antd/es/table'

export default function HrReports() {
    renderTitle('HR Reports')
    const { user, loading } = useAuthContext()
    let { pathname } = useLocation()
    const navigate = useNavigate()
    const pathKey = pathname.split('/').pop()
    const codes = filterCodes(user?.role?.permissions)

    // useEffect(() => {
    //     if (pathname == '/leave/approval' && !codes['c06']) return navigate('/leave/myleaves')
    // }, [])

    return <>
        <StyledWidthRow>
            <Col xs={24} sm={12} md={12} lg={12} xl={11}>
                <h1 className='color-white'>HR Reports</h1>
            </Col>
        </StyledWidthRow>
        <h2>Work in progress</h2>
        {/* <Table
            loading={loading}
            columns={renderColumns({ downloadReport: () => null })}
            dataList={dataList}
        tableParams={tableParams}
        onChange={onChange}
        /> */}
    </>
}

function StyledWidthRow({ children }: { children: ReactNode }) {
    const { width } = useWindowSize()
    return <StyledRow justify='space-between' wrap align='middle' style={{
        gap: width < 579 ? '.5rem' : 'initial',
        textAlign: width < 579 ? 'center' : 'initial'
    }}>{children}</StyledRow>
}

const renderColumns = ({ downloadReport }: { downloadReport: () => void; }): ColumnsType<any> => [
    {
        title: 'Reports',
        key: 'reports',
        dataIndex: 'reports',
        width: 150,
        align: 'center'
    },
    {
        title: 'Action',
        key: 'action',
        dataIndex: 'action',
        align: 'center',
        render: (_, record: any) => <Button type='primary' onClick={downloadReport}>Download</Button>,
        width: 150
    },
]

const dataList = [
    {
        id: '1',
        reports: 'Attendance Reports'
    },
    {
        id: '2',
        reports: 'Client Billing Reports'
    },
    {
        id: '3',
        reports: 'Daily Task Reports'
    },
]