import { useState, useEffect } from 'react'
import { MenuProps, Menu as AntdMenu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting, AiOutlineDollarCircle, AiOutlineCalendar, AiOutlineAudit } from 'react-icons/ai'
import { MdAdminPanelSettings, MdLockOutline } from 'react-icons/md'
import { FaTasks, FaCriticalRole, FaUsersCog, FaUsers } from 'react-icons/fa'
import { GiHumanPyramid } from 'react-icons/gi'
import { BiTimeFive, BiTimer } from 'react-icons/bi'
import { IoIosPeople } from 'react-icons/io'
import { SiExpensify } from 'react-icons/si'
import { TfiAnnouncement } from 'react-icons/tfi'
import { GoIssueOpened } from 'react-icons/go'
import { useAuthContext } from '../../shared/contexts/Auth'
import { IPermissions, IUser } from '../../shared/interfaces'

type Props = {
    onSelect: () => void
}

export default function Sidebar({ onSelect }: Props) {
    let location = useLocation()
    const [locationKey, setLocationKey] = useState('')
    const { user } = useAuthContext()
    const modules = new Map(user?.modules.map((d) => [d.name, d])) ?? new Map()

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
        } else if (location?.pathname.includes('/roles')) {
            setLocationKey('/roles')
        } else if (location?.pathname.includes('/leave')) {
            setLocationKey('/leave')
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
            items={filterMenu(menus, modules)}
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
        <TfiAnnouncement />
    ),
    getItemLinks(
        <Link to='/timekeeping' id='timekeeping'>Timekeeping</Link>,
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
            // getItemLinks(
            //     <Link to='/permissions'>Permissions</Link>,
            //     '/permissions',
            //     <MdLockOutline />,
            // ),
            getItemLinks(
                <Link to='/auditlogs'>Audit Logs</Link>,
                '/auditlogs',
                <AiOutlineAudit />,
            ),
            getItemLinks(
                <Link to='/issuelogs'>System Logs</Link>,
                '/issuelogs',
                <AiOutlineSetting />,
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

function filterMenu(menus: MenuItem[], modules: Map<string, IPermissions>) {
    console.log(menus, modules)

    return menus
}

function getItemLinks(
    label: React.ReactNode,
    key: React.Key | any,
    icon?: React.ReactNode,
    children?: MenuItem[],
    isMod: boolean = true
): MenuItem {
    return isMod ? {
        key,
        icon,
        children,
        label,
    } as MenuItem : null;
}