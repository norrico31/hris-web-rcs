import { useState, useEffect } from 'react'
import { MenuProps, Menu as AntdMenu, Skeleton } from 'antd'
import { Link, useLocation, NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting, AiOutlineDollarCircle, AiOutlineCalendar, AiOutlineAudit, AiOutlineFieldTime } from 'react-icons/ai'
import { MdAdminPanelSettings } from 'react-icons/md'
import { FaTasks, FaCriticalRole, FaUsersCog, FaUsers } from 'react-icons/fa'
import { GiHumanPyramid } from 'react-icons/gi'
import { BiTimeFive, BiTimer, BiUserCheck } from 'react-icons/bi'
import { IoIosPeople } from 'react-icons/io'
import { SiExpensify } from 'react-icons/si'
import { TfiAnnouncement } from 'react-icons/tfi'
import { TbReportAnalytics } from 'react-icons/tb'
import { useAuthContext } from '../../shared/contexts/Auth'
import { IRolePermission, IUser } from '../../shared/interfaces'
import { ADMINSETTINGSPATHS, CLIENTSETTINGSPATHS, HRSETTINGSPATHS, ROOTPATHS, TASKSETTINGSPATHS } from '../../shared/constants'

type Props = {
    onSelect: () => void
    collapsed: boolean
}

export default function Sidebar({ onSelect, collapsed }: Props) {
    const location = useLocation()
    const [locationKey, setLocationKey] = useState('')
    const { user, loading } = useAuthContext()

    useEffect(() => {
        if (location?.pathname.includes('/employee/edit')) {
            setLocationKey('/employee')
        } else if (location?.pathname.includes('/tasks/')) {
            setLocationKey('/tasks')
        } else if (location?.pathname.includes('/team/')) {
            setLocationKey('/team')
        } else if (location?.pathname.includes('/overtime/')) {
            setLocationKey('/overtime')
        } else if (location?.pathname.includes('/announcements/')) {
            setLocationKey('/announcements')
        } else if (location?.pathname.includes('/salaryadjustments/')) {
            setLocationKey('/salaryadjustments')
        } else if (location?.pathname.includes('/employee/')) {
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
        } else if (location?.pathname.includes('/leave/')) {
            setLocationKey('/leave/')
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
            items={filterMenu(user!, collapsed, location.pathname)}
        />

}

const MenuContainer = styled(AntdMenu)`
    background-color: #9B3423;
    color: #fff;
    
    .menu-item-main {
        color: rgb(250, 228, 149) !important;
        &:hover {
            color: #9B3423 !important;
        }
        &:active {
            color: #9B3423 !important;
        }
    }
    
    .menu-item-main.active, .menu-item-main.active > * {
        color: #9B3423 !important;
    }
   
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

function filterMenu(user: IUser, collapsed: boolean, path: string) {
    const modules = user?.role?.permissions ?? []
    // modules.forEach((mod) => {
    //     console.log(mod.code, mod.description)
    // })
    const moduleCodes = filterCodes(modules)
    const rootPath = filterPaths(user?.role?.permissions!, ROOTPATHS)
    const taskSystemSettingsPaths = filterPaths(user?.role?.permissions!, TASKSETTINGSPATHS)
    const hrPaths = filterPaths(user?.role?.permissions!, HRSETTINGSPATHS)
    const clientPaths = filterPaths(user?.role?.permissions!, CLIENTSETTINGSPATHS)
    const adminPaths = filterPaths(user?.role?.permissions!, ADMINSETTINGSPATHS)
    return [
        getItemLinks(
            <Link to='/' id="dashboard">Dashboard</Link>,
            '/',
            <AiFillAppstore />,
            undefined,
            rootPath.includes('dashboard')
        ),
        getItemLinks(
            <Link to='/announcements' id="announcements">Announcements</Link>,
            '/announcements',
            <TfiAnnouncement />,
            undefined,
            rootPath.includes('announcements')
        ),
        getItemLinks(
            <NavLink to='/timekeeping' id='timekeeping' className={`main-link menu-item-main ${({ isActive }: { isActive: boolean }) => (isActive) ? 'active' : ''}`}>{!collapsed && <BiTimeFive size={20} style={{ marginRight: 8 }} />} Timekeeping</NavLink>,
            '/timekeeping',
            collapsed ? <BiTimeFive className='menu-item-main' /> : null,
            undefined,
            rootPath.includes('timekeeping')
        ),
        getItemLinks(
            <NavLink to='/overtime/myovertime' id='overtime' className={`main-link menu-item-main ${path.includes('/overtime') && 'active'}`}>{!collapsed && <AiOutlineFieldTime size={20} style={{ marginRight: 8 }} />} Overtime</NavLink>,
            '/overtime',
            collapsed ? <AiOutlineFieldTime className='menu-item-main' /> : null,
            undefined,
            rootPath.includes('overtime')
        ),
        getItemLinks(
            <NavLink to='/leave/myleaves' className={`main-link menu-item-main ${path.includes('/leave') && 'active'}`}>{!collapsed && <AiOutlineCalendar size={20} style={{ marginRight: 10 }} />} Leaves</NavLink>,
            '/leave/',
            collapsed ? <AiOutlineCalendar className='menu-item-main' /> : null,
            undefined,
            rootPath.includes('leave')
        ),
        getItemLinks(
            <Link to='/whosinout' id='whosinout'>Who's In/Out</Link>,
            '/whosinout',
            <BiTimer />,
            undefined,
            rootPath.includes('timekeeping')
        ),
        getItemLinks(
            <Link to='/tasks'>My Tasks</Link>,
            '/tasks',
            <FaTasks />,
            undefined,
            rootPath.includes('tasks')
        ),
        getItemLinks(
            <Link to='/teamtask'>My Team Tasks</Link>,
            '/teamtask',
            <BiUserCheck />,
            undefined,
            rootPath.includes('my team tasks')
        ),
        getItemLinks(
            <Link to='/team'>My Team</Link>,
            '/team',
            <FaUsers />,
            undefined,
            rootPath.includes('my team projects')
        ),
        getItemLinks(
            <Link to='/hrreports'>Hr Reports</Link>,
            '/hrreports',
            <TbReportAnalytics />,
            undefined,
            rootPath.includes('hr reports')
        ),
        getItemLinks(
            'System Settings',
            '/systemsettings',
            <AiOutlineSetting />,
            [
                getItemLinks(
                    <Link to={`/systemsettings/tasksettings/${taskSystemSettingsPaths[0]}`}>Task Management</Link>,
                    '/systemsettings/tasksettings/activities',
                    <FaTasks />,
                    undefined,
                    taskSystemSettingsPaths.includes('activities') || taskSystemSettingsPaths.includes('types') || taskSystemSettingsPaths.includes('sprints')
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
                    !!moduleCodes['ko01'] || !!moduleCodes['ko02'] || !!moduleCodes['ko03']
                ),
            ],
            taskSystemSettingsPaths.includes('activities') || taskSystemSettingsPaths.includes('types') || taskSystemSettingsPaths.includes('sprints') || hrPaths.includes('bankdetails') || hrPaths.includes('benefits') || hrPaths.includes('holidays') || hrPaths.includes('holidaytypes') || hrPaths.includes('dailyrates') || hrPaths.includes('employmentstatuses') || hrPaths.includes('departments') || hrPaths.includes('team') || hrPaths.includes('positions') || hrPaths.includes('leavestatuses') || hrPaths.includes('leavedurations') || hrPaths.includes('leavetypes') || hrPaths.includes('salaries') || hrPaths.includes('schedules') || clientPaths.includes('clients') || clientPaths.includes('clientbranches') || clientPaths.includes('clientadjustments') || !!moduleCodes['KO01'],
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
                    <Link to='/admin/leaves'>Leave Management</Link>,
                    '/admin/leaves',
                    <AiOutlineCalendar />,
                    undefined,
                    adminPaths.includes('leave management')
                ),
                getItemLinks(
                    <Link to='/admin/overtimes'>Overtime Management</Link>,
                    '/admin/overtimes',
                    <AiOutlineFieldTime />,
                    undefined,
                    adminPaths.includes('overtime management')
                ),
                getItemLinks(
                    <Link to='/admin/timekeepings'>Timekeeping Management</Link>,
                    '/admin/timekeepings',
                    <BiTimeFive />,
                    undefined,
                    adminPaths.includes('timekeeping management')
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
            <Link to='/employee'>Employee 201 Files</Link>,
            '/employee',
            <FaUsersCog />,
            undefined,
            rootPath.includes('employee')
        ),

        getItemLinks(
            <Link to='/salaryadjustments'>Salary Adjustments</Link>,
            '/salaryadjustments',
            <AiOutlineDollarCircle />,
            undefined,
            rootPath.includes('salaryadjustments')
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

export function filterCodes(modules: IRolePermission[] = []) {
    const moduleCodes: Record<string, IRolePermission[]> = {}
    for (let i = 0; i < modules?.length; i++) {
        if (!moduleCodes[modules[i].code.toLocaleLowerCase()]) moduleCodes[modules[i].code.toLocaleLowerCase()] = []
        moduleCodes[modules[i].code.toLocaleLowerCase()].push(modules[i])
    }
    return moduleCodes
}