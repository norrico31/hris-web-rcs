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
        if (location?.pathname.includes('/admin/systemsettings')) {
            setLocationKey('/admin/systemsettings/addressmapping')
        } else if (location?.pathname.includes('/admin/adminsettings')) {
            setLocationKey('/admin/adminsettings/usermanagement')
        } else if (location?.pathname.includes('/admin/systemlogs')) {
            setLocationKey('/admin/systemlogs/auditlogs')
        } else if (location?.pathname.includes('/admin/reportanalytics')) {
            setLocationKey('/admin/reportanalytics/applicantmetrics')
        } else if (location?.pathname.includes('/admin/applicantmanagement')) {
            setLocationKey('/admin/applicantmanagement/adminapplicant')
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
                    <Link to='/admin/dashboard' id="dashboard">Dashboard</Link>,
                    '/admin/dashboard',
                    <AiFillAppstore />
                ),
                getItemLinks(
                    <Link to='/admin/systemsettings/addressmapping'>System Settings</Link>,
                    '/admin/systemsettings/addressmapping',
                    <AiOutlineSetting />,
                ),
                getItemLinks(
                    <Link to='/admin/adminsettings/usermanagement'>Admin Settings</Link>,
                    '/admin/adminsettings/usermanagement',
                    <RiUserSettingsFill />,
                ),
                getItemLinks(
                    <Link to='/admin/systemlogs/auditlogs'>System Logs</Link>,
                    '/admin/systemlogs/auditlogs',
                    <AiOutlineSetting />
                ),
                getItemLinks(
                    <Link to='/admin/profile'>User Profile</Link>,
                    '/admin/profile',
                    <FaUser />
                ),
                getItemLinks(
                    <Link to='/admin/reportanalytics/applicantmetrics'>Report Analytics</Link>,
                    '/admin/reportanalytics/applicantmetrics',
                    <GoGraph />
                ),
                getItemLinks(
                    <Link to='/admin/applicantmanagement/adminapplicant'>Applicant Management</Link>,
                    '/admin/applicantmanagement/adminapplicant',
                    <MdManageAccounts />,
                ),
            ]}
        />
    )
}

const MenuContainer = styled(AntdMenu)`
    /* background-color: #003765; */
    /* color: #fff; */
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