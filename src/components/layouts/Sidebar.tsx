import { useState, useEffect, useMemo } from 'react'
import { MenuProps, Menu as AntdMenu, Skeleton } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting, AiOutlineDollarCircle, AiOutlineCalendar, AiOutlineAudit, AiOutlineUser } from 'react-icons/ai'
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
    console.log(user)
    const modules = user?.role?.permissions ?? []
    const modulesName: Record<string, IPermissions[]> = {}
    for (let i = 0; i < modules?.length; i++) {
        if (!modulesName[modules[i].code]) modulesName[modules[i].code] = []
        modulesName[modules[i].code].push(modules[i])
    }
    console.log(modulesName)
    const isModuleAdminSettings = [...modulesName['IA01'] ?? [], ...modulesName['IB01'] ?? [], ...modulesName['IC01'] ?? [], ...modulesName['ID01'] ?? []] ?? []
    return [
        getItemLinks(
            <Link to='/dashboard' id="dashboard">Dashboard</Link>,
            '/dashboard',
            <AiFillAppstore />,
            undefined,
            modules.some(module => module.code === 'A01')
        ),
        getItemLinks(
            <Link to='/announcements' id="announcements">Announcements</Link>,
            '/announcements',
            <TfiAnnouncement />,
            undefined,
            modules.some(module => module.code === 'D01')
        ),
        getItemLinks(
            <Link to='/timekeeping' id='timekeeping'>Timekeeping</Link>,
            '/timekeeping',
            <BiTimeFive />,
            undefined,
            modules.some(module => module.code === 'B01')
        ),
        getItemLinks(
            <Link to='/whosinout' id='whosinout'>Who's In/Out</Link>,
            '/whosinout',
            <BiTimer />,
            undefined,
            modules.some(module => module.code === 'B01')
        ),
        getItemLinks(
            'System Settings',
            '/systemsettings',
            <AiOutlineSetting />,
            [
                getItemLinks(
                    // <Link to={`/systemsettings/tasksettings/${tasksSettings[0]}`}>Tasks</Link>,
                    <Link to={`/systemsettings/tasksettings/activities`}>Tasks</Link>,
                    '/systemsettings/tasksettings/activities',
                    <FaTasks />,
                    undefined,
                    modules.some(module => module.code === 'JA01') || modules.some(module => module.code === 'JB01') || modules.some(module => module.code === 'JC01')
                ),
                getItemLinks(
                    // <Link to={`/systemsettings/hrsettings/${hrSettingsNames[hrSettingsNames.length - 1]}`}>Human Resources</Link>,
                    <Link to={`/systemsettings/hrsettings/bank_details`}>Human Resources</Link>,
                    '/systemsettings/hrsettings/bankdetails',
                    <GiHumanPyramid />,
                    undefined,
                    modules.some(module => module.code === 'KA01') || modules.some(module => module.code === 'KB01') || modules.some(module => module.code === 'KC01')  || modules.some(module => module.code === 'KD01') || modules.some(module => module.code === 'KE01') || modules.some(module => module.code === 'KF01') || modules.some(module => module.code === 'KG01') || modules.some(module => module.code === 'KH01') || modules.some(module => module.code === 'KI01') || modules.some(module => module.code === 'KJ01') || modules.some(module => module.code === 'KK01') || modules.some(module => module.code === 'KL01') || modules.some(module => module.code === 'KM01') || modules.some(module => module.code === 'KN01') 
                ),
                getItemLinks(
                    // <Link to={`/systemsettings/clientsettings/${clientSettingsNames[0]}`}>Client</Link>,
                    <Link to={`/systemsettings/clientsettings/clients`}>Client</Link>,
                    `/systemsettings/clientsettings/clients`,
                    <IoIosPeople />,
                    undefined,
                    modules.some(module => module.code === 'LA01') || modules.some(module => module.code === 'LB01') || modules.some(module => module.code === 'LC01')
                ),
                getItemLinks(
                    <Link to='/systemsettings/expensesettings/expensetype'>Expense</Link>,
                    '/systemsettings/expensesettings/expensetype',
                    <SiExpensify />,
                    undefined,
                    modules.some(module => module.code === 'KO01')
                ),
            ],
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
                    modules.some(module => module.code === 'IA01')
                ),
                getItemLinks(
                    <Link to='/roles'>Roles</Link>,
                    '/roles',
                    <FaCriticalRole />,
                    undefined,
                    modules.some(module => module.code === 'IB01')
                ),
                getItemLinks(
                    <Link to='/auditlogs'>Audit Logs</Link>,
                    '/auditlogs',
                    <AiOutlineAudit />,
                    undefined,
                    modules.some(module => module.code === 'IC01')
                ),
                getItemLinks(
                    <Link to='/issuelogs'>System Logs</Link>,
                    '/issuelogs',
                    <AiOutlineSetting />,
                    undefined,
                    modules.some(module => module.code === 'ID01')
                ),
            ],
            modules.some(module => module.code === 'IA01') || modules.some(module => module.code === 'IB01') || modules.some(module => module.code === 'IC01') || modules.some(module => module.code === 'ID01')
            // !!permissionNames['ga03'] || !!permissionNames['ga04'] || !!permissionNames['ga05'] || !!permissionNames['ga06'] || !!permissionNames['gb03'] || !!permissionNames['gb04'] || !!permissionNames['gb05'] || !!permissionNames['gb06'] || !!permissionNames['gc01'] || !!permissionNames['gd01']
            // isModuleAdminSettings.every((admin) => admin)
        ),
        getItemLinks(
            <Link to='/employee'>Employee Files</Link>,
            '/employee',
            <FaUsersCog />,
            undefined,
            modules.some(module => module.code === 'G01')
        ),
        getItemLinks(
            <Link to='/tasks'>Tasks</Link>,
            '/tasks',
            <FaTasks />,
            undefined,
            modules.some(module => module.code === 'E01')
        ),
        getItemLinks(
            <Link to='/leave'>Leave</Link>,
            '/leave',
            <AiOutlineCalendar />,
            undefined,
            modules.some(module => module.code === 'C01')
        ),
        getItemLinks(
            <Link to='/salaryadjustments'>Salary Adjustments</Link>,
            '/salaryadjustments',
            <AiOutlineDollarCircle />,
            undefined,
            modules.some(module => module.code === 'H01')
        ),
        getItemLinks(
            <Link to='/profile'>Profile</Link>,
            '/profile',
            <AiOutlineDollarCircle />,
            undefined,
            // modules.some(module => module.code === 'H01')
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