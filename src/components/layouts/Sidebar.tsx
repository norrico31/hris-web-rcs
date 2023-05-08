import { useState, useEffect, useMemo } from 'react'
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
    const location = useLocation()
    const [locationKey, setLocationKey] = useState('')
    const { user } = useAuthContext()

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

    return (
        <MenuContainer
            theme="dark"
            mode="inline"
            activeKey={location.pathname}
            selectedKeys={[locationKey]}
            defaultSelectedKeys={[location.pathname]}
            onSelect={onSelect}
            items={filterMenu(user!)}
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

const tasksSettings = ['task_activities', 'task_types', 'sprints']
const clientSettings = ['clients', 'client_branches', 'client_adjustments']
const bankSettings = ['bank_details', 'benefits', 'holidays', 'holiday_types', 'daily_rates', 'employment_statuses', 'departments', 'teams', 'positions', 'leave_statuses', 'leave_durations', 'leave_types', 'employee_salaries', 'schedules']

function filterMenu(user: IUser) {
    const modules = new Map(user?.modules.map((d) => [d.name, d])) ?? new Map()
    console.log(modules.has('bank_details'))
    const tasksSettingsNames = filterPath(user?.modules, tasksSettings)
    const clientSettingsNames = filterPath(user?.modules, clientSettings)
    return [
        getItemLinks(
            <Link to='/dashboard' id="dashboard">Dashboard</Link>,
            '/dashboard',
            <AiFillAppstore />,
            undefined,
            modules.has('dashboard') || true
        ),
        getItemLinks(
            <Link to='/announcements' id="announcements">Announcements</Link>,
            '/announcements',
            <TfiAnnouncement />,
            undefined,
            modules.has('announcements') || true
        ),
        getItemLinks(
            <Link to='/timekeeping' id='timekeeping'>Timekeeping</Link>,
            '/timekeeping',
            <BiTimeFive />,
            undefined,
            modules.has('time_keepings')
        ),
        getItemLinks(
            <Link to='/whosinout' id='whosinout'>Who's In/Out</Link>,
            '/whosinout',
            <BiTimer />,
            undefined,
            modules.has('whos_in_out') || true
        ),
        getItemLinks(
            'System Settings',
            '/systemsettings',
            <AiOutlineSetting />,
            [
                getItemLinks(
                    <Link to={`/systemsettings/tasksettings/${tasksSettingsNames[tasksSettingsNames.length - 1]}`}>Tasks</Link>,
                    '/systemsettings/tasksettings/task_activities',
                    <FaTasks />,
                    undefined,
                    modules.has('task_activities') || modules.has('task_types') || modules.has('sprints')
                ),
                getItemLinks(
                    <Link to='/systemsettings/hrsettings/bankdetails'>Human Resources</Link>,
                    '/systemsettings/hrsettings/bankdetails',
                    <GiHumanPyramid />,
                ),
                getItemLinks(
                    <Link to={`/systemsettings/clientsettings/${clientSettingsNames[0]}`}>Client</Link>,
                    `/systemsettings/clientsettings/clients`,
                    <IoIosPeople />,
                ),
                getItemLinks(
                    <Link to='/systemsettings/expensesettings/expensetype'>Expense</Link>,
                    '/systemsettings/expensesettings/expensetype',
                    <SiExpensify />,
                    undefined,
                    modules.has('expense_types')
                ),
            ],
            !!tasksSettingsNames?.length || !!clientSettingsNames || modules.has('expense_types')
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
                    modules.has('users')
                ),
                getItemLinks(
                    <Link to='/roles'>Roles</Link>,
                    '/roles',
                    <FaCriticalRole />,
                    undefined,
                    modules.has('roles')
                ),
                getItemLinks(
                    <Link to='/auditlogs'>Audit Logs</Link>,
                    '/auditlogs',
                    <AiOutlineAudit />,
                    undefined,
                    modules.has('audit_logs')
                ),
                getItemLinks(
                    <Link to='/issuelogs'>System Logs</Link>,
                    '/issuelogs',
                    <AiOutlineSetting />,
                    undefined,
                    modules.has('laravel_logs')
                ),
            ]
        ),
        getItemLinks(
            <Link to='/employee'>Employee Files</Link>,
            '/employee',
            <FaUsersCog />,
            undefined,
            modules.has('employees')
        ),
        getItemLinks(
            <Link to='/tasks'>Tasks</Link>,
            '/tasks',
            <FaTasks />,
            undefined,
            modules.has('tasks')
        ),
        getItemLinks(
            <Link to='/leave'>Leave</Link>,
            '/leave',
            <AiOutlineCalendar />,
            undefined,
            modules.has('leaves')
        ),
        getItemLinks(
            <Link to='/salaryadjustments'>Salary Adjustments</Link>,
            '/salaryadjustments',
            <AiOutlineDollarCircle />,
            undefined,
            modules.has('expenses')
        ),
    ]
}

function filterPath(modules: IPermissions[], arrNames: string[]): string[] {
    let newPaths: string[] = []
    for (let i = 0; i < modules?.length; i++) {
        const data = modules[i]
        if (arrNames.some((tasks) => tasks == data.name) && !newPaths.includes(data.name)) {
            newPaths.push(data.name)
        }
    }
    return newPaths
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