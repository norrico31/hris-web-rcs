import { useParams, Navigate } from "react-router-dom"
import { Tabs as AntDTabs } from 'antd'
import { renderTitle } from "."
import styled from "styled-components"
import { MainHeader } from './../components'

const els = [
    {
        label: 'Task Activities',
        key: '/taskmanagement/activities',
    },
    {
        label: 'Task Types',
        key: '/taskmanagement/types',
    },
    {
        label: 'Sprint',
        key: '/taskmanagement/sprint',
    },
]

export default function EmployeeEdit() {
    renderTitle('Employee Edit')
    const { employeeId } = useParams()
    // if (employeeId == undefined) return <Navigate to='/employee' />
    console.log(employeeId)
    return <>
        <MainHeader>
            <h1 className='color-white'>Employee Edit - Gerald</h1>
        </MainHeader>
        <Tabs
            defaultActiveKey="1"
            type="card"
            tabPosition="top"
            size='small'
            renderTabBar={(props, TabNavList) => (
                <TabNavList {...props} mobile={false} />
            )}
            items={new Array(15).fill(null).map((_, i) => {
                const id = String(i + 1);
                return {
                    label: `Card Tab ${id}`,
                    key: id,
                    children: `Content of card tab ${id}`,
                };
            })}
        />
    </>
}

const Tabs = styled(AntDTabs)`
    .ant-tabs-tab.ant-tabs-tab-active {
        background: #9B3423;
        color: #fff;
    }
    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff;
    }
`