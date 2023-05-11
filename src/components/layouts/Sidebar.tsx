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
    const modules = user?.role?.permissions ?? []
    const modulesName: Record<string, IRolePermission[]> = {}
    for (let i = 0; i < modules?.length; i++) {
        if (!modulesName[modules[i].code]) modulesName[modules[i].code] = []
        modulesName[modules[i].code].push(modules[i])
    }
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
                    // <Link to={`/systemsettings/tasksettings/${tasksSettings[0]}`}>Tasks</Link>,
                    <Link to={`/systemsettings/tasksettings/activities`}>Tasks</Link>,
                    '/systemsettings/tasksettings/activities',
                    <FaTasks />,
                    undefined,
                    !!modulesName['JA01'] || !!modulesName['JB01'] || !!modulesName['JC01']
                ),
                getItemLinks(
                    // <Link to={`/systemsettings/hrsettings/${hrSettingsNames[hrSettingsNames.length - 1]}`}>Human Resources</Link>,
                    <Link to={`/systemsettings/hrsettings/bank_details`}>Human Resources</Link>,
                    '/systemsettings/hrsettings/bankdetails',
                    <GiHumanPyramid />,
                    undefined,
                    modules.some(module => module.code === 'KA01') || modules.some(module => module.code === 'KB01') || modules.some(module => module.code === 'KC01') || modules.some(module => module.code === 'KD01') || modules.some(module => module.code === 'KE01') || modules.some(module => module.code === 'KF01') || modules.some(module => module.code === 'KG01') || modules.some(module => module.code === 'KH01') || modules.some(module => module.code === 'KI01') || modules.some(module => module.code === 'KJ01') || modules.some(module => module.code === 'KK01') || modules.some(module => module.code === 'KL01') || modules.some(module => module.code === 'KM01') || modules.some(module => module.code === 'KN01')
                ),
                getItemLinks(
                    // <Link to={`/systemsettings/clientsettings/${clientSettingsNames[0]}`}>Client</Link>,
                    <Link to={`/systemsettings/clientsettings/clients`}>Client</Link>,
                    `/systemsettings/clientsettings/clients`,
                    <IoIosPeople />,
                    undefined,
                    !!modulesName['LA01'] || !!modulesName['LB01'] || !!modulesName['LC01']
                ),
                getItemLinks(
                    <Link to='/systemsettings/expensesettings/expensetype'>Expense</Link>,
                    '/systemsettings/expensesettings/expensetype',
                    <SiExpensify />,
                    undefined,
                    !!modulesName['KO01']
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
                    !!modulesName['IA01']
                ),
                getItemLinks(
                    <Link to='/roles'>Roles</Link>,
                    '/roles',
                    <FaCriticalRole />,
                    undefined,
                    !!modulesName['IB01']
                ),
                getItemLinks(
                    <Link to='/auditlogs'>Audit Logs</Link>,
                    '/auditlogs',
                    <AiOutlineAudit />,
                    undefined,
                    !!modulesName['IC01']
                ),
                getItemLinks(
                    <Link to='/issuelogs'>System Logs</Link>,
                    '/issuelogs',
                    <AiOutlineSetting />,
                    undefined,
                    !!modulesName['ID01']
                ),
            ],
            !!modulesName['IA01'] || !!modulesName['IB01'] || !!modulesName['IC01'] || !!modulesName['ID01']
        ),
        getItemLinks(
            <Link to='/employee'>Employee Files</Link>,
            '/employee',
            <FaUsersCog />,
            undefined,
            !!modulesName['G01']
        ),
        getItemLinks(
            <Link to='/tasks'>Tasks</Link>,
            '/tasks',
            <FaTasks />,
            undefined,
            !!modulesName['E01']
        ),
        getItemLinks(
            <Link to='/leave'>Leave</Link>,
            '/leave',
            <AiOutlineCalendar />,
            undefined,
            !!modulesName['C01']
        ),
        getItemLinks(
            <Link to='/salaryadjustments'>Salary Adjustments</Link>,
            '/salaryadjustments',
            <AiOutlineDollarCircle />,
            undefined,
            !!modulesName['H01']
        ),
        getItemLinks(
            <Link to='/profile'>Profile</Link>,
            '/profile',
            <AiOutlineDollarCircle />,
            undefined,
            true // !!modulesName['E01']
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
