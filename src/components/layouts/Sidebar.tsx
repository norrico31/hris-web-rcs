import { useState, useEffect } from 'react'
import { MenuProps, Menu as AntdMenu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting, AiOutlineDollarCircle, AiOutlineSchedule, AiOutlineCalendar } from 'react-icons/ai'
import { RiBankLine } from 'react-icons/ri'
import { MdOutlinePersonalInjury, MdOutlineHolidayVillage } from 'react-icons/md'
import { FaTasks, FaCriticalRole, FaUsersCog, FaUserClock } from 'react-icons/fa'
import { GiPositionMarker, GiExpense } from 'react-icons/gi'
import { BiTimeFive } from 'react-icons/bi'
import { IoIosPeople } from 'react-icons/io'
import { TbCalendarStats } from 'react-icons/tb'
import { VscTypeHierarchy } from 'react-icons/vsc'
import { SiExpensify } from 'react-icons/si'

//! Employee 201 Page (Edit) for HR

export default function Sidebar() {
    let location = useLocation()
    const [locationKey, setLocationKey] = useState('')

    useEffect(() => {
        if (location?.pathname.includes('/employee/edit')) {
            setLocationKey('/employee')
        } else if (location?.pathname.includes('/systemsettings/taskmanagement')) {
            setLocationKey('/systemsettings/taskmanagement/activities')
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
                <Link to='/systemsettings/taskmanagement/activities'>Tasks Settings</Link>,
                '/systemsettings/taskmanagement/activities',
                <FaTasks />,
            ),
            getItemLinks(
                <Link to='/systemsettings/bankdetails'>Banking Details</Link>,
                '/systemsettings/bankdetails',
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
            // getItemLinks(
            //     <Link to='/systemsettings/clientbranchholiday'>Client Branch Holiday</Link>,
            //     '/systemsettings/clientbranchholiday',
            //     <MdOutlineHolidayVillage />,
            // ),
            getItemLinks(
                <Link to='/systemsettings/dailyrate'>Daily Rate</Link>,
                '/systemsettings/dailyrate',
                <AiOutlineDollarCircle />,
            ),
            getItemLinks(
                <Link to='/systemsettings/department'>Department</Link>,
                '/systemsettings/department',
                <AiOutlineDollarCircle />,
            ),
            getItemLinks(
                <Link to='/systemsettings/employeestatus'>Employee Status</Link>,
                '/systemsettings/employeestatus',
                <FaUserClock />,
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
                <Link to='/systemsettings/holidaytype'>Holiday Type</Link>,
                '/systemsettings/holidaytype',
                <MdOutlineHolidayVillage />,
            ),
            getItemLinks(
                <Link to='/systemsettings/leave'>Leave Status</Link>,
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
            // getItemLinks(
            //     <Link to='/systemsettings/salaryrate'>Salary Rate</Link>,
            //     '/systemsettings/salaryrate',
            //     <AiOutlineDollarCircle />,
            // ),
            getItemLinks(
                <Link to='/systemsettings/salaryadjustmenttype'>Salary Adjustment Type</Link>,
                '/systemsettings/salaryadjustmenttype',
                <AiOutlineDollarCircle />,
            ),
        ]
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
        <Link to='/employee'>Employee Files</Link>,
        '/employee',
        <FaUsersCog />
    ),
    getItemLinks(
        <Link to='/holidays'>Holidays</Link>,
        '/holidays',
        <MdOutlineHolidayVillage />
    ),
    getItemLinks(
        <Link to='/salaryadjustments'>Salary Adjustments</Link>,
        '/salaryadjustments',
        <AiOutlineDollarCircle />
    ),
    // getItemLinks(
    //     <Link to='/schedule'>Schedule</Link>,
    //     '/schedule',
    //     <AiOutlineSchedule />,
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