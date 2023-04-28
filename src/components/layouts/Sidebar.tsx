import { useState, useEffect } from 'react'
import { MenuProps, Menu as AntdMenu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting, AiOutlineDollarCircle, AiOutlineCalendar, AiOutlineAudit } from 'react-icons/ai'
import { MdAdminPanelSettings } from 'react-icons/md'
import { FaTasks, FaCriticalRole, FaUsersCog, FaUsers } from 'react-icons/fa'
import { GiHumanPyramid } from 'react-icons/gi'
import { BiTimeFive, BiTimer } from 'react-icons/bi'
import { IoIosPeople } from 'react-icons/io'
import { SiExpensify } from 'react-icons/si'

type Props = {
    onSelect: () => void
}

export default function Sidebar({ onSelect }: Props) {
    let location = useLocation()
    const [locationKey, setLocationKey] = useState('')

    useEffect(() => {
        if (location?.pathname.includes('/employee/edit')) {
            setLocationKey('/employee')
        } else if (location?.pathname.includes('/systemsettings/tasksettings')) {
            setLocationKey('/systemsettings/tasksettings/activities')
        } else if (location?.pathname.includes('/systemsettings/hrsettings')) {
            setLocationKey('/systemsettings/hrsettings/bankdetails')
        } else if (location?.pathname.includes('/systemsettings/clientsettings')) {
            setLocationKey('/systemsettings/clientsettings/client')
        } else if (location?.pathname.includes('/systemsettings/expensesettings')) {
            setLocationKey('/systemsettings/expensesettings/expense')
        } else setLocationKey(location?.pathname)
    }, [location.pathname])

    return (
        <MenuContainer
            theme="dark"
            mode="inline"
            activeKey={location.pathname}
            selectedKeys={[locationKey]}
            defaultSelectedKeys={[location.pathname]}
            onSelect={onSelect}
            items={menus}
        />
    )
}

const MenuContainer = styled(AntdMenu)`
    background-color: #9B3423;
    color: #fff;
    height: 100%;

    .ant-menu-title-content a {
        display: block;
    }
    .ant-menu-item-selected,
    .ant-menu-item.ant-menu-item-active {
        background-color: #fff;
        color: #9B3423;
    }
    .menu-item-icon {
        color: #00AEEF;
    }
    .ant-menu.ant-menu-sub.ant-menu-inline {
        background: #9B3423;
    }
`

type MenuItem = Required<MenuProps>['items'][number]

const menus = [
    getItemLinks(
        <Link to='/dashboard' id="dashboard">Dashboard</Link>,
        '/dashboard',
        <AiFillAppstore />
    ),
    getItemLinks(
        <Link to='/announcements' id="announcements">Announcements</Link>,
        '/announcements',
        <AiFillAppstore />
    ),
    getItemLinks(
        <Link to='/timekeeping' id='timekeeping'>Time Keeping</Link>,
        '/timekeeping',
        <BiTimeFive />
    ),
    getItemLinks(
        <Link to='/whosinout' id='whosinout'>Who's In/Out</Link>,
        '/whosinout',
        <BiTimer />
    ),
    getItemLinks(
        'System Settings',
        '/systemsettings',
        <AiOutlineSetting />,
        [
            getItemLinks(
                <Link to='/systemsettings/tasksettings/activities'>Tasks</Link>,
                '/systemsettings/tasksettings/activities',
                <FaTasks />,
            ),
            getItemLinks(
                <Link to='/systemsettings/hrsettings/bankdetails'>Human Resources</Link>,
                '/systemsettings/hrsettings/bankdetails',
                <GiHumanPyramid />,
            ),
            getItemLinks(
                <Link to='/systemsettings/clientsettings/client'>Client</Link>,
                '/systemsettings/clientsettings/client',
                <IoIosPeople />,
            ),
            getItemLinks(
                <Link to='/systemsettings/expensesettings/expensetype'>Expense</Link>,
                '/systemsettings/expensesettings/expensetype',
                <SiExpensify />,
            ),
        ]
    ),
    getItemLinks(
        'Admin Settings',
        '/adminsettings',
        <MdAdminPanelSettings />,
        [
            getItemLinks(
                <Link to='/users'>Users</Link>,
                '/users',
                <FaUsers />,
            ),
            getItemLinks(
                <Link to='/roles'>Roles</Link>,
                '/roles',
                <FaCriticalRole />,
            ),
            getItemLinks(
                <Link to='/auditlogs'>Audit Logs</Link>,
                '/auditlogs',
                <AiOutlineAudit />,
            ),
        ]
    ),
    getItemLinks(
        <Link to='/employee'>Employee Files</Link>,
        '/employee',
        <FaUsersCog />
    ),
    getItemLinks(
        <Link to='/tasks'>Tasks</Link>,
        '/tasks',
        <FaTasks />
    ),
    getItemLinks(
        <Link to='/leave'>Leave</Link>,
        '/leave',
        <AiOutlineCalendar />
    ),
    getItemLinks(
        <Link to='/salaryadjustments'>Salary Adjustments</Link>,
        '/salaryadjustments',
        <AiOutlineDollarCircle />
    ),
]

function getItemLinks(
    label: React.ReactNode,
    key: React.Key | any,
    icon?: React.ReactNode,
    children?: MenuItem[],
    len: number = 1
): MenuItem {
    return len > 0 ? {
        key,
        icon,
        children,
        label,
    } as MenuItem : null;
}