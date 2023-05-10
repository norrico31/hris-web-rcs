import { useState, useEffect, useMemo } from 'react'
import { MenuProps, Menu as AntdMenu, Skeleton } from 'antd'
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
    const location = useLocation()
    const [locationKey, setLocationKey] = useState('')
    const { user, loading } = useAuthContext()

    useEffect(() => {
        if (location?.pathname.includes('/employee/edit')) {
            setLocationKey('/employee')
        } else if (location?.pathname.includes('/systemsettings/tasksettings/')) {
            setLocationKey('/systemsettings/tasksettings/task_activities')
        } else if (location?.pathname.includes('/systemsettings/hrsettings')) {
            setLocationKey('/systemsettings/hrsettings/bankdetails')
        } else if (location?.pathname.includes('/systemsettings/clientsettings')) {
            setLocationKey('/systemsettings/clientsettings/clients')
        } else if (location?.pathname.includes('/systemsettings/expensesettings')) {
            setLocationKey('/systemsettings/expensesettings/expense')
        } else if (location?.pathname.includes('/roles')) {
            setLocationKey('/roles')
        } else if (location?.pathname.includes('/leave')) {
            setLocationKey('/leave')
        } else setLocationKey(location?.pathname)
    }, [location.pathname])

    return loading ? <Skeleton /> :
        <MenuContainer
            theme="dark"
            mode="inline"
            activeKey={location.pathname}
            selectedKeys={[locationKey]}
            defaultSelectedKeys={[location.pathname]}
            onSelect={onSelect}
            items={filterMenu(user!)}
        />

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

function filterMenu(user: IUser) {
    const permissionNames = permissionCode(user?.role?.permissions)
    return [
        getItemLinks(
            <Link to='/dashboard' id="dashboard">Dashboard</Link>,
            '/dashboard',
            <AiFillAppstore />,
            undefined,
            !!permissionNames['a01']
        ),
        getItemLinks(
            <Link to='/announcements' id="announcements">Announcements</Link>,
            '/announcements',
            <TfiAnnouncement />,
            undefined,
            !!permissionNames['b01'] || !!permissionNames['b02'] || !!permissionNames['b03'] || !!permissionNames['b04'] || !!permissionNames['b05'] || !!permissionNames['b06'] || !!permissionNames['b07']
        ),
        getItemLinks(
            <Link to='/timekeeping' id='timekeeping'>Timekeeping</Link>,
            '/timekeeping',
            <BiTimeFive />,
            undefined,
            !!permissionNames['c10'] || !!permissionNames['c11']
        ),
        getItemLinks(
            <Link to='/whosinout' id='whosinout'>Who's In/Out</Link>,
            '/whosinout',
            <BiTimer />,
            undefined,
            !!permissionNames['c08'] || !!permissionNames['c09']
        ),
        getItemLinks(
            'System Settings',
            '/systemsettings',
            <AiOutlineSetting />,
            [
                getItemLinks(
                    // <Link to={`/systemsettings/tasksettings/${tasksSettingsNames[tasksSettingsNames.length - 1]}`}>Tasks</Link>,
                    <Link to={`/systemsettings/tasksettings/task_activities`}>Tasks</Link>,
                    '/systemsettings/tasksettings/task_activities',
                    <FaTasks />,
                    undefined,
                    !!permissionNames['da03'] || !!permissionNames['da04'] || !!permissionNames['da05'] || !!permissionNames['da06'] || !!permissionNames['db03'] || !!permissionNames['db04'] || !!permissionNames['db05'] || !!permissionNames['db06'] || !!permissionNames['dc03'] || !!permissionNames['dc04'] || !!permissionNames['dc05'] || !!permissionNames['dc06']
                ),
                getItemLinks(
                    // <Link to={`/systemsettings/hrsettings/${hrSettingsNames[hrSettingsNames.length - 1]}`}>Human Resources</Link>,
                    <Link to={`/systemsettings/hrsettings/bank_details`}>Human Resources</Link>,
                    '/systemsettings/hrsettings/bankdetails',
                    <GiHumanPyramid />,
                    undefined,
                    !!permissionNames['ea03'] || !!permissionNames['ea04'] || !!permissionNames['ea05'] || !!permissionNames['ea06'] || !!permissionNames['eb03'] || !!permissionNames['eb04'] || !!permissionNames['eb05'] || !!permissionNames['eb06'] || !!permissionNames['ec03'] || !!permissionNames['ec04'] || !!permissionNames['ec05'] || !!permissionNames['ec06'] || !!permissionNames['ed03'] || !!permissionNames['ed04'] || !!permissionNames['ed05'] || !!permissionNames['ed06'] || !!permissionNames['ee03'] || !!permissionNames['ee04'] || !!permissionNames['ee05'] || !!permissionNames['ee06'] || !!permissionNames['ef03'] || !!permissionNames['ef04'] || !!permissionNames['ef05'] || !!permissionNames['ef06'] || !!permissionNames['eg03'] || !!permissionNames['eg04'] || !!permissionNames['eg05'] || !!permissionNames['eg06'] || !!permissionNames['eh03'] || !!permissionNames['eh04'] || !!permissionNames['eh05'] || !!permissionNames['eh06'] || !!permissionNames['ei03'] || !!permissionNames['ei04'] || !!permissionNames['ei05'] || !!permissionNames['ei06'] || !!permissionNames['ej03'] || !!permissionNames['ej04'] || !!permissionNames['ej05'] || !!permissionNames['ej06'] || !!permissionNames['ek03'] || !!permissionNames['ek04'] || !!permissionNames['ek05'] || !!permissionNames['ek06'] || !!permissionNames['el03'] || !!permissionNames['el04'] || !!permissionNames['el05'] || !!permissionNames['el06'] || !!permissionNames['em03'] || !!permissionNames['em04'] || !!permissionNames['em05'] || !!permissionNames['em06'] || !!permissionNames['en03'] || !!permissionNames['en04'] || !!permissionNames['en05'] || !!permissionNames['en06'] || !!permissionNames['eo03'] || !!permissionNames['eo04'] || !!permissionNames['eo05'] || !!permissionNames['eo06'] || !!permissionNames['ep03'] || !!permissionNames['ep04'] || !!permissionNames['ep05'] || !!permissionNames['ep06']
                ),
                getItemLinks(
                    // <Link to={`/systemsettings/clientsettings/${clientSettingsNames[0]}`}>Client</Link>,
                    <Link to={`/systemsettings/clientsettings/clients`}>Client</Link>,
                    `/systemsettings/clientsettings/clients`,
                    <IoIosPeople />,
                    undefined,
                    !!permissionNames['fa03'] || !!permissionNames['fa04'] || !!permissionNames['fa05'] || !!permissionNames['fa06'] || !!permissionNames['fb03'] || !!permissionNames['fb04'] || !!permissionNames['fb05'] || !!permissionNames['fb06'] || !!permissionNames['fc03'] || !!permissionNames['fc04'] || !!permissionNames['fc05'] || !!permissionNames['fc06']
                ),
                getItemLinks(
                    <Link to='/systemsettings/expensesettings/expensetype'>Expense</Link>,
                    '/systemsettings/expensesettings/expensetype',
                    <SiExpensify />,
                    undefined,
                    !!permissionNames['ep03'] || !!permissionNames['ep04'] || !!permissionNames['ep05'] || !!permissionNames['ep06']
                ),
            ],
            !!permissionNames['da03'] || !!permissionNames['da04'] || !!permissionNames['da05'] || !!permissionNames['da06'] || !!permissionNames['db03'] || !!permissionNames['db04'] || !!permissionNames['db05'] || !!permissionNames['db06'] || !!permissionNames['dc03'] || !!permissionNames['dc04'] || !!permissionNames['dc05'] || !!permissionNames['dc06'] || !!permissionNames['ea03'] || !!permissionNames['ea04'] || !!permissionNames['ea05'] || !!permissionNames['ea06'] || !!permissionNames['eb03'] || !!permissionNames['eb04'] || !!permissionNames['eb05'] || !!permissionNames['eb06'] || !!permissionNames['ec03'] || !!permissionNames['ec04'] || !!permissionNames['ec05'] || !!permissionNames['ec06'] || !!permissionNames['ed03'] || !!permissionNames['ed04'] || !!permissionNames['ed05'] || !!permissionNames['ed06'] || !!permissionNames['ee03'] || !!permissionNames['ee04'] || !!permissionNames['ee05'] || !!permissionNames['ee06'] || !!permissionNames['ef03'] || !!permissionNames['ef04'] || !!permissionNames['ef05'] || !!permissionNames['ef06'] || !!permissionNames['eg03'] || !!permissionNames['eg04'] || !!permissionNames['eg05'] || !!permissionNames['eg06'] || !!permissionNames['eh03'] || !!permissionNames['eh04'] || !!permissionNames['eh05'] || !!permissionNames['eh06'] || !!permissionNames['ei03'] || !!permissionNames['ei04'] || !!permissionNames['ei05'] || !!permissionNames['ei06'] || !!permissionNames['ej03'] || !!permissionNames['ej04'] || !!permissionNames['ej05'] || !!permissionNames['ej06'] || !!permissionNames['ek03'] || !!permissionNames['ek04'] || !!permissionNames['ek05'] || !!permissionNames['ek06'] || !!permissionNames['el03'] || !!permissionNames['el04'] || !!permissionNames['el05'] || !!permissionNames['el06'] || !!permissionNames['em03'] || !!permissionNames['em04'] || !!permissionNames['em05'] || !!permissionNames['em06'] || !!permissionNames['en03'] || !!permissionNames['en04'] || !!permissionNames['en05'] || !!permissionNames['en06'] || !!permissionNames['eo03'] || !!permissionNames['eo04'] || !!permissionNames['eo05'] || !!permissionNames['eo06'] || !!permissionNames['ep03'] || !!permissionNames['ep04'] || !!permissionNames['ep05'] || !!permissionNames['ep06'] || !!permissionNames['fa03'] || !!permissionNames['fa04'] || !!permissionNames['fa05'] || !!permissionNames['fa06'] || !!permissionNames['fb03'] || !!permissionNames['fb04'] || !!permissionNames['fb05'] || !!permissionNames['fb06'] || !!permissionNames['fc03'] || !!permissionNames['fc04'] || !!permissionNames['fc05'] || !!permissionNames['fc06'] || !!permissionNames['fa03'] || !!permissionNames['fa04'] || !!permissionNames['fa05'] || !!permissionNames['fa06'] || !!permissionNames['fb03'] || !!permissionNames['fb04'] || !!permissionNames['fb05'] || !!permissionNames['fb06'] || !!permissionNames['fc03'] || !!permissionNames['fc04'] || !!permissionNames['fc05'] || !!permissionNames['fc06']
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
                    undefined,
                    !!permissionNames['ga03'] || !!permissionNames['ga04'] || !!permissionNames['ga05'] || !!permissionNames['ga06']
                ),
                getItemLinks(
                    <Link to='/roles'>Roles</Link>,
                    '/roles',
                    <FaCriticalRole />,
                    undefined,
                    !!permissionNames['gb03'] || !!permissionNames['gb04'] || !!permissionNames['gb05'] || !!permissionNames['gb06']
                ),
                getItemLinks(
                    <Link to='/auditlogs'>Audit Logs</Link>,
                    '/auditlogs',
                    <AiOutlineAudit />,
                    undefined,
                    !!permissionNames['gc01']
                ),
                getItemLinks(
                    <Link to='/issuelogs'>System Logs</Link>,
                    '/issuelogs',
                    <AiOutlineSetting />,
                    undefined,
                    !!permissionNames['gd01']
                ),
            ],
            !!permissionNames['ga03'] || !!permissionNames['ga04'] || !!permissionNames['ga05'] || !!permissionNames['ga06'] || !!permissionNames['gb03'] || !!permissionNames['gb04'] || !!permissionNames['gb05'] || !!permissionNames['gb06'] || !!permissionNames['gc01'] || !!permissionNames['gd01']
        ),
        getItemLinks(
            <Link to='/employee'>Employee Files</Link>,
            '/employee',
            <FaUsersCog />,
            undefined,
            !!permissionNames['h03'] || !!permissionNames['h04'] || !!permissionNames['h05'] || !!permissionNames['h06']
        ),
        getItemLinks(
            <Link to='/tasks'>Tasks</Link>,
            '/tasks',
            <FaTasks />,
            undefined,
            !!permissionNames['i03'] || !!permissionNames['i04'] || !!permissionNames['i05'] || !!permissionNames['i06']
        ),
        getItemLinks(
            <Link to='/leave'>Leave</Link>,
            '/leave',
            <AiOutlineCalendar />,
            undefined,
            !!permissionNames['j03'] || !!permissionNames['j04'] || !!permissionNames['j05'] || !!permissionNames['j06']
        ),
        getItemLinks(
            <Link to='/salaryadjustments'>Salary Adjustments</Link>,
            '/salaryadjustments',
            <AiOutlineDollarCircle />,
            undefined,
            !!permissionNames['k03'] || !!permissionNames['k04'] || !!permissionNames['k05'] || !!permissionNames['k06']
        ),
    ]
}

function getItemLinks(
    label: React.ReactNode,
    key: React.Key | string,
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

export function permissionCode(permissions: IPermissions[]) {
    const roleNames: Record<string, IPermissions[]> = {}
    for (let i = 0; i < permissions?.length; i++) {
        const permission = permissions[i]
        const permissionName = permission.code.toLocaleLowerCase()
        if (!roleNames[permissionName]) roleNames[permissionName] = []
        roleNames[permissionName].push(permission)
    }
    return roleNames
}