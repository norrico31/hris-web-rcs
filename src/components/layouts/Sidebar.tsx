import { useState, useEffect } from 'react'
import { MenuProps, Menu as AntdMenu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting, AiOutlineDollarCircle, AiOutlineSchedule, AiOutlineCalendar } from 'react-icons/ai'
import { RiBankLine } from 'react-icons/ri'
import { MdOutlinePersonalInjury, MdOutlineHolidayVillage } from 'react-icons/md'
import { FaTasks, FaCriticalRole } from 'react-icons/fa'
import { GiPositionMarker, GiExpense } from 'react-icons/gi'
import { BiTimeFive } from 'react-icons/bi'
import { IoIosPeople } from 'react-icons/io'
import { TbCalendarStats } from 'react-icons/tb'
import { VscTypeHierarchy } from 'react-icons/vsc'
import { SiExpensify } from 'react-icons/si'

export default function Sidebar() {
    let location = useLocation()
    const [locationKey, setLocationKey] = useState('')

    useEffect(() => {
        if (location?.pathname.includes('/systemsettings')) {
            setLocationKey('/systemsettings/addressmapping')
        } else if (location?.pathname.includes('/adminsettings')) {
            setLocationKey('/adminsettings/usermanagement')
        } else if (location?.pathname.includes('/systemlogs')) {
            setLocationKey('/systemlogs/auditlogs')
        } else if (location?.pathname.includes('/reportanalytics')) {
            setLocationKey('/reportanalytics/applicantmetrics')
        } else if (location?.pathname.includes('/applicantmanagement')) {
            setLocationKey('/applicantmanagement/applicant')
        } else {
            setLocationKey(location?.pathname)
        }
    }, [location.pathname])

    return (
        <MenuContainer
            theme="dark"
            mode="inline"
            activeKey={location.pathname}
            selectedKeys={[locationKey]}
            defaultSelectedKeys={[location.pathname]}
            items={menus}
        />
    )
}

const MenuContainer = styled(AntdMenu)`
    background-color: #9B3423;
    color: #fff;
    height: 100%;

    .ant-menu-item:hover,
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
        <Link to='/timekeeping'>Time Keeping</Link>,
        '/timekeeping',
        <BiTimeFive />
    ),
    getItemLinks(
        'System Settings',
        '/systemsettings',
        <AiOutlineSetting />,
        [
            getItemLinks(
                <Link to='/systemsettings/taskmanagement/activities'>Task Management</Link>,
                '/systemsettings/taskmanagement/activities',
                <FaTasks />,
            ),
            getItemLinks(
                <Link to='/systemsettings/bankingdetails'>Banking Details</Link>,
                '/systemsettings/bankingdetails',
                <RiBankLine />,
            ),
            getItemLinks(
                <Link to='/systemsettings/client'>Client</Link>,
                '/systemsettings/client',
                <IoIosPeople />,
            ),
            getItemLinks(
                <Link to='/systemsettings/clientbranch'>Client Branch</Link>,
                '/systemsettings/clientbranch',
                <MdOutlinePersonalInjury />,
            ),
            getItemLinks(
                <Link to='/systemsettings/clientbranchholiday'>Client Branch Holiday</Link>,
                '/systemsettings/clientbranchholiday',
                <MdOutlineHolidayVillage />,
            ),
            getItemLinks(
                <Link to='/systemsettings/dailyrate'>Daily Rate</Link>,
                '/systemsettings/dailyrate',
                <AiOutlineDollarCircle />,
            ),
            getItemLinks(
                <Link to='/systemsettings/expense'>Expense</Link>,
                '/systemsettings/expense',
                <GiExpense />,
            ),
            getItemLinks(
                <Link to='/systemsettings/expensetype'>Expense Type</Link>,
                '/systemsettings/expensetype',
                <SiExpensify />,
            ),
            getItemLinks(
                <Link to='/systemsettings/holiday'>Holiday</Link>,
                '/systemsettings/holiday',
                <MdOutlineHolidayVillage />,
            ),
            getItemLinks(
                <Link to='/systemsettings/holidaytype'>Holiday Type</Link>,
                '/systemsettings/holidaytype',
                <MdOutlineHolidayVillage />,
            ),
            getItemLinks(
                <Link to='/systemsettings/leave'>Leave</Link>,
                '/systemsettings/leave',
                <AiOutlineCalendar />,
            ),
            getItemLinks(
                <Link to='/systemsettings/leaveduration'>Leave Duration</Link>,
                '/systemsettings/leaveduration',
                <TbCalendarStats />,
            ),
            getItemLinks(
                <Link to='/systemsettings/leavetype'>Leave Type</Link>,
                '/systemsettings/leavetype',
                <VscTypeHierarchy />,
            ),
            getItemLinks(
                <Link to='/systemsettings/position'>Position</Link>,
                '/systemsettings/position',
                <GiPositionMarker />,
            ),
            getItemLinks(
                <Link to='/systemsettings/role'>Role</Link>,
                '/systemsettings/role',
                <FaCriticalRole />,
            ),
            getItemLinks(
                <Link to='/systemsettings/salaryrate'>Salary Rate</Link>,
                '/systemsettings/salaryrate',
                <AiOutlineDollarCircle />,
            ),
            getItemLinks(
                <Link to='/systemsettings/schedule'>Schedule</Link>,
                '/systemsettings/schedule',
                <AiOutlineSchedule />,
            ),
        ]
    ),
    // getItemLinks(
    //     <Link to='/adminsettings/usermanagement'>Admin Settings</Link>,
    //     '/adminsettings/usermanagement',
    //     <RiUserSettingsFill />,
    // ),
    // getItemLinks(
    //     <Link to='/profile'>User Profile</Link>,
    //     '/profile',
    //     <FaUser />
    // ),
    // getItemLinks(
    //     <Link to='/reportanalytics/applicantmetrics'>Report Analytics</Link>,
    //     '/reportanalytics/applicantmetrics',
    //     <GoGraph />
    // ),
    // getItemLinks(
    //     <Link to='/applicantmanagementapplicant'>Applicant Management</Link>,
    //     '/applicantmanagement/adminapplicant',
    //     <MdManageAccounts />,
    // ),
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