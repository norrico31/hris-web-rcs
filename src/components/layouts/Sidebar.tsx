import { useState, useEffect } from 'react'
import { MenuProps, Menu as AntdMenu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AiFillAppstore, AiOutlineSetting } from 'react-icons/ai'
import { RiUserSettingsFill } from 'react-icons/ri'
import { MdManageAccounts } from 'react-icons/md'
import { FaUser } from 'react-icons/fa'
import { GoGraph } from 'react-icons/go'

export default function Sidebar() {
    let location = useLocation()
    const [locationKey, setLocationKey] = useState<any>(null);

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
            items={[
                getItemLinks(
                    <Link to='/dashboard' id="dashboard">Dashboard</Link>,
                    '/dashboard',
                    <AiFillAppstore />
                ),
                getItemLinks(
                    <Link to='/systemsettings/addressmapping'>System Settings</Link>,
                    '/systemsettings/addressmapping',
                    <AiOutlineSetting />,
                ),
                getItemLinks(
                    <Link to='/adminsettings/usermanagement'>Admin Settings</Link>,
                    '/adminsettings/usermanagement',
                    <RiUserSettingsFill />,
                ),
                getItemLinks(
                    <Link to='/systemlogs/auditlogs'>Time Keeping</Link>,
                    '/systemlogs/auditlogs',
                    <AiOutlineSetting />
                ),
                getItemLinks(
                    <Link to='/profile'>User Profile</Link>,
                    '/profile',
                    <FaUser />
                ),
                getItemLinks(
                    <Link to='/reportanalytics/applicantmetrics'>Report Analytics</Link>,
                    '/reportanalytics/applicantmetrics',
                    <GoGraph />
                ),
                getItemLinks(
                    <Link to='/applicantmanagementapplicant'>Applicant Management</Link>,
                    '/applicantmanagement/adminapplicant',
                    <MdManageAccounts />,
                ),
            ]}
        />
    )
}

const MenuContainer = styled(AntdMenu)`
    background-color: #9B3423;
    color: #fff;
    height: 100%;

    .ant-menu-item-selected {
        background-color: #CCCC4A !important;
        color: #fff;
    }

    .menu-item-icon {
        color: #00AEEF;
    }

    .ant-menu-sub {
        background-color: #003765 !important;
    }
    .ant-tabs-tab-active {
        background: #003765;
        color: #fff;
    }
`

type MenuItem = Required<MenuProps>['items'][number]

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