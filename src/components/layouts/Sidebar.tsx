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
import { IPermissions, IRolePermission, IUser } from '../../shared/interfaces'
import { adminSettingsPaths, clientSettingsPaths, hrSettingsPaths, taskSettingsPaths } from '../../shared/constants'

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
            setLocationKey('/systemsettings/tasksettings/activities')
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
    const modules = user?.role?.permissions ?? []
    const modulesName: Record<string, IRolePermission[]> = {}
    for (let i = 0; i < modules?.length; i++) {
        if (!modulesName[modules[i].code]) modulesName[modules[i].code] = []
        modulesName[modules[i].code].push(modules[i])
    }
    const taskPaths = filterPaths(user?.role?.permissions!, taskSettingsPaths)
    const hrPaths = filterPaths(user?.role?.permissions!, hrSettingsPaths)
    const clientPaths = filterPaths(user?.role?.permissions!, clientSettingsPaths)
    const adminPaths = filterPaths(user?.role?.permissions!, adminSettingsPaths)

    return [
        getItemLinks(
            <Link to='/dashboard' id="dashboard">Dashboard</Link>,
            '/dashboard',
            <AiFillAppstore />,
            undefined,
            !!modulesName['A01']
        ),
        getItemLinks(
            <Link to='/announcements' id="announcements">Announcements</Link>,
            '/announcements',
            <TfiAnnouncement />,
            undefined,
            !!modulesName['D01']
        ),
        getItemLinks(
            <Link to='/timekeeping' id='timekeeping'>Timekeeping</Link>,
            '/timekeeping',
            <BiTimeFive />,
            undefined,
            !!modulesName['B01']
        ),
        getItemLinks(
            <Link to='/whosinout' id='whosinout'>Who's In/Out</Link>,
            '/whosinout',
            <BiTimer />,
            undefined,
            !!modulesName['B01']
        ),
        getItemLinks(
            'System Settings',
            '/systemsettings',
            <AiOutlineSetting />,
            [
                getItemLinks(
                    <Link to={`/systemsettings/tasksettings/${taskPaths[0]}`}>Tasks</Link>,
                    '/systemsettings/tasksettings/activities',
                    <FaTasks />,
                    undefined,
                    taskPaths.includes('activities') || taskPaths.includes('types') || taskPaths.includes('sprints')
                ),
                getItemLinks(
                    <Link to={`/systemsettings/hrsettings/${hrPaths[0]}`}>Human Resources</Link>,
                    '/systemsettings/hrsettings/bankdetails',
                    <GiHumanPyramid />,
                    undefined,
                    hrPaths.includes('bankdetails') || hrPaths.includes('benefits') || hrPaths.includes('holidays') || hrPaths.includes('holidaytypes') || hrPaths.includes('dailyrates') || hrPaths.includes('employmentstatuses') || hrPaths.includes('departments') || hrPaths.includes('team') || hrPaths.includes('positions') || hrPaths.includes('leavestatuses') || hrPaths.includes('leavedurations') || hrPaths.includes('leavetypes') || hrPaths.includes('salaries') || hrPaths.includes('schedules')
                ),
                getItemLinks(
                    <Link to={`/systemsettings/clientsettings/clients`}>Client</Link>,
                    `/systemsettings/clientsettings/clients`,
                    <IoIosPeople />,
                    undefined,
                    clientPaths.includes('clients') || clientPaths.includes('clientbranches') || clientPaths.includes('clientadjustments')
                ),
                getItemLinks(
                    <Link to='/systemsettings/expensesettings/expensetype'>Expense</Link>,
                    '/systemsettings/expensesettings/expensetype',
                    <SiExpensify />,
                    undefined,
                    !!modulesName['KO01']
                ),
            ],
            taskPaths.includes('activities') || taskPaths.includes('types') || taskPaths.includes('sprints') || hrPaths.includes('bankdetails') || hrPaths.includes('benefits') || hrPaths.includes('holidays') || hrPaths.includes('holidaytypes') || hrPaths.includes('dailyrates') || hrPaths.includes('employmentstatuses') || hrPaths.includes('departments') || hrPaths.includes('team') || hrPaths.includes('positions') || hrPaths.includes('leavestatuses') || hrPaths.includes('leavedurations') || hrPaths.includes('leavetypes') || hrPaths.includes('salaries') || hrPaths.includes('schedules') || clientPaths.includes('clients') || clientPaths.includes('clientbranches') || clientPaths.includes('clientadjustments') || !!modulesName['KO01'],
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
                    adminPaths.includes('users')
                ),
                getItemLinks(
                    <Link to='/roles'>Roles</Link>,
                    '/roles',
                    <FaCriticalRole />,
                    undefined,
                    adminPaths.includes('roles')
                ),
                getItemLinks(
                    <Link to='/auditlogs'>Audit Logs</Link>,
                    '/auditlogs',
                    <AiOutlineAudit />,
                    undefined,
                    adminPaths.includes('auditlogs')
                ),
                getItemLinks(
                    <Link to='/issuelogs'>System Logs</Link>,
                    '/issuelogs',
                    <AiOutlineSetting />,
                    undefined,
                    adminPaths.includes('systemlogs')
                ),
            ],
            adminPaths.includes('users') || adminPaths.includes('roles') || adminPaths.includes('auditlogs') || adminPaths.includes('auditlogs')
        ),
        getItemLinks(
            <Link to='/employee'>Employee Files</Link>,
            '/employee',
            <FaUsersCog />,
            undefined,
            !!modulesName['G01'] || !!modulesName['G02'] || !!modulesName['G03'] || !!modulesName['G04']
        ),
        getItemLinks(
            <Link to='/tasks'>Tasks</Link>,
            '/tasks',
            <FaTasks />,
            undefined,
            !!modulesName['E01'] || !!modulesName['E02'] || !!modulesName['E03'] || !!modulesName['E04']
        ),
        getItemLinks(
            <Link to='/leave'>Leave</Link>,
            '/leave',
            <AiOutlineCalendar />,
            undefined,
            !!modulesName['C01'] || !!modulesName['C02'] || !!modulesName['C03'] || !!modulesName['C04']
        ),
        getItemLinks(
            <Link to='/salaryadjustments'>Salary Adjustments</Link>,
            '/salaryadjustments',
            <AiOutlineDollarCircle />,
            undefined,
            !!modulesName['H01'] || !!modulesName['H02'] || !!modulesName['H03'] || !!modulesName['H04']
        ),
        getItemLinks(
            <Link to='/profile'>Profile</Link>,
            '/profile',
            <AiOutlineDollarCircle />,
            undefined,
            true
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


export function filterPaths(permissions: IRolePermission[], paths: Record<string, string>): string[] {
    const filteredPaths: Record<string, string> = {}
    permissions?.forEach((permission) => {
        const code = permission.code.toLocaleLowerCase()
        if (paths[code]) filteredPaths[paths[code]] = paths[code]
    })
    return Object.values(filteredPaths)
}