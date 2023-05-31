import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import { Skeleton } from "antd"
import styled from "styled-components";
import { Layout } from "./components"
import Login from './pages/Login'
import TasksSettings from './pages/system-settings/task-settings/TasksSettings'
import HRSettings from './pages/system-settings/hr-settings/HRSettings'
import ExpenseSettings from './pages/system-settings/expense-settings/ExpenseSettings'
import ClientSettings from './pages/system-settings/client-settings/ClientSettings'
import EmployeeEdit from './pages/EmployeeEdit'

// Root
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TimeKeeping = lazy(() => import('./pages/TimeKeeping'))
const Leave = lazy(() => import('./pages/Leave'))
const MyTasks = lazy(() => import('./pages/MyTasks'))
const TasksArchives = lazy(() => import('./pages/TasksArchives'))
const EmployeeFiles = lazy(() => import('./pages/EmployeeFiles'))
const EmployeeFilesArchives = lazy(() => import('./pages/EmployeeFilesArchives'))
const SalaryAdjustment = lazy(() => import('./pages/SalaryAdjustment'))
const SalaryAdjustmentArchives = lazy(() => import('./pages/SalaryAdjustmentArchives'))
const WhosInOut = lazy(() => import('./pages/WhosInOut'))
const Announcements = lazy(() => import('./pages/Announcements'))
const AnnouncementsArchives = lazy(() => import('./pages/AnnouncementArchives'))
const Profile = lazy(() => import('./pages/Profile'))

// My Teams
const MyTeam = lazy(() => import('./pages/MyTeam'))
const MyTeamEdit = lazy(() => import('./pages/MyTeamEdit'))
const TeamProfile = lazy(() => import('./pages/teams/TeamProfile'))
const TeamSchedule = lazy(() => import('./pages/teams/TeamSchedule'))

// Leaves
const MyLeaves = lazy(() => import('./pages/leaves/MyLeave'))
const LeaveArchives = lazy(() => import('./pages/leaves/LeaveArchives'))
const LeaveApproval = lazy(() => import('./pages/leaves/LeaveApproval'))

// Overtime
const Overtime = lazy(() => import('./pages/Overtime'))
const MyOvertime = lazy(() => import('./pages/overtime/MyOvertime'))
const OvertimeArchives = lazy(() => import('./pages/overtime/OvertimeArchives'))
const OvertimeApproval = lazy(() => import('./pages/overtime/OvertimeApproval'))

// System Settings
const TaskActivities = lazy(() => import('./pages/system-settings/task-settings/TaskActivities'))
const TaskTypes = lazy(() => import('./pages/system-settings/task-settings/TaskTypes'))
const TaskSprint = lazy(() => import('./pages/system-settings/task-settings/TaskSprint'))

// HR Settings
const BankDetails = lazy(() => import('./pages/system-settings/hr-settings/BankDetails'))
const Benefits = lazy(() => import('./pages/system-settings/hr-settings/Benefits'))
const Holidays = lazy(() => import('./pages/system-settings/hr-settings/Holidays'))
const HolidayType = lazy(() => import('./pages/system-settings/hr-settings/HolidayType'))
const DailyRate = lazy(() => import('./pages/system-settings/hr-settings/DailyRate'))
const EmployeeStatus = lazy(() => import('./pages/system-settings/hr-settings/EmployeeStatus'))
const Department = lazy(() => import('./pages/system-settings/hr-settings/Department'))
const Team = lazy(() => import('./pages/system-settings/hr-settings/Team'))
const Position = lazy(() => import('./pages/system-settings/hr-settings/Position'))
const LeaveStatus = lazy(() => import('./pages/system-settings/hr-settings/LeaveStatus'))
const LeaveType = lazy(() => import('./pages/system-settings/hr-settings/LeaveType'))
const LeaveDuration = lazy(() => import('./pages/system-settings/hr-settings/LeaveDuration'))
const SalarRates = lazy(() => import('./pages/system-settings/hr-settings/SalariesRates'))
const Schedules = lazy(() => import('./pages/system-settings/hr-settings/Schedules'))

// Expense Settings
const Expense = lazy(() => import('./pages/system-settings/expense-settings/Expense'))
const ExpenseType = lazy(() => import('./pages/system-settings/expense-settings/ExpenseType'))

// Client Settings
const Client = lazy(() => import('./pages/system-settings/client-settings/Client'))
const ClientBranch = lazy(() => import('./pages/system-settings/client-settings/ClientBranch'))
const ClientAdjustment = lazy(() => import('./pages/system-settings/client-settings/ClientAdjustment'))

// Admin Settings
const Users = lazy(() => import('./pages/admin-settings/Users'))
const Roles = lazy(() => import('./pages/admin-settings/Roles'))
const AuditLogs = lazy(() => import('./pages/admin-settings/AuditLogs'))
const Permissions = lazy(() => import('./pages/admin-settings/Permissions'))
const IssueLogs = lazy(() => import('./pages/admin-settings/IssueLogs'))

// Employee Files (201)
const EmployeeBenefits = lazy(() => import('./pages/employee-files/EmployeeBenefits'))
const ClientSchedule = lazy(() => import('./pages/employee-files/ClientSchedule'))
const Contracts = lazy(() => import('./pages/employee-files/Contracts'))
const EmployeeDocuments = lazy(() => import('./pages/employee-files/EmployeeDocuments'))
const Evaluations = lazy(() => import('./pages/employee-files/Evaluations'))
const GovernmentDocuments = lazy(() => import('./pages/employee-files/GovernmentDocuments'))
const LeaveCredits = lazy(() => import('./pages/employee-files/LeaveCredits'))
const Memorandums = lazy(() => import('./pages/employee-files/Memorandums'))
const PayScheme = lazy(() => import('./pages/employee-files/PayScheme'))
const EmployeeSalary = lazy(() => import('./pages/employee-files/EmployeeSalary'))
// const EmployeeSalaryHistory = lazy(() => import('./pages/employee-files/EmployeeSalaryHistory'))
// const EmployeeSalaryAdjustments = lazy(() => import('./pages/employee-files/EmployeeSalaryAdjustments'))
const SalaryAdjustmentType = lazy(() => import('./pages/employee-files/SalaryAdjustmentType'))
const UserProfile = lazy(() => import('./pages/employee-files/UserProfile'))
// const EmployeeSalaryRate = lazy(() => import('./pages/employee-files/EmployeeSalaryRate'))

function Content({ children }: { children: any }) {
    return (
        <Container>
            {children}
        </Container>
    )
}

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'dashboard',
                element: <Navigate to='/' />
            },
            {
                path: '/',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Dashboard /></Suspense>
            },
            {
                path: 'announcements',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Announcements /></Suspense>
            },
            {
                path: 'announcements/archives',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><AnnouncementsArchives /></Suspense>
            },
            {
                path: 'timekeeping',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><TimeKeeping /></Suspense>
            },

            {
                path: 'users',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Users /></Suspense>
            },
            {
                path: 'roles',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Roles /></Suspense>
            },
            {
                path: 'roles/:roleId/permissions',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Permissions /></Suspense>
            },
            {
                path: 'auditlogs',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><AuditLogs /></Suspense>
            },
            {
                path: 'issuelogs',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><IssueLogs /></Suspense>
            },
            {
                path: 'profile',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Profile /></Suspense>
            },
            {
                path: 'tasks',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><MyTasks /></Suspense>
            },
            {
                path: 'team',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><MyTeam /></Suspense>,
            },
            {
                path: 'team/edit/:teamId',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><MyTeamEdit /></Suspense>,
                children: [
                    {
                        path: 'profile',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><TeamProfile /></Suspense>
                    },
                    {
                        path: 'teams',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><ClientSchedule /></Suspense>
                    },
                    {
                        path: 'schedules',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><TeamSchedule /></Suspense>
                    },
                ]
            },
            {
                path: 'tasks/archives',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><TasksArchives /></Suspense>
            },
            {
                path: 'leave',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Leave /></Suspense>,
                children: [
                    {
                        path: 'myleaves',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><MyLeaves /></Suspense>,
                    },
                    {
                        path: 'archives',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><LeaveArchives /></Suspense>,
                    },
                    {
                        path: 'approval',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><LeaveApproval /></Suspense>,
                    },
                ]
            },
            {
                path: 'overtime',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><Overtime /></Suspense>,
                children: [
                    {
                        path: 'myovertime',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><MyOvertime /></Suspense>,
                    },
                    {
                        path: 'archives',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><OvertimeArchives /></Suspense>,
                    },
                    {
                        path: 'approval',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><OvertimeApproval /></Suspense>,
                    },
                ]
            },
            {
                path: 'systemsettings',
                element: <Outlet />,
                children: [
                    {
                        path: 'tasksettings',
                        element: <TasksSettings />,
                        children: [
                            {
                                path: 'activities',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><TaskActivities /></Suspense>,
                            },
                            {
                                path: 'types',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><TaskTypes /></Suspense>
                            },
                            {
                                path: 'sprints',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><TaskSprint /></Suspense>
                            },
                        ]
                    },
                    {
                        path: 'hrsettings',
                        element: <HRSettings />,
                        children: [
                            {
                                path: 'bankdetails',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><BankDetails /></Suspense>,
                            },
                            {
                                path: 'benefits',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Benefits /></Suspense>
                            },
                            {
                                path: 'holidays',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Holidays /></Suspense>
                            },
                            {
                                path: 'holidaytypes',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><HolidayType /></Suspense>
                            },
                            {
                                path: 'dailyrates',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><DailyRate /></Suspense>
                            },
                            {
                                path: 'employmentstatuses',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeStatus /></Suspense>
                            },
                            {
                                path: 'departments',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Department /></Suspense>
                            },
                            {
                                path: 'teams',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Team /></Suspense>
                            },
                            {
                                path: 'positions',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Position /></Suspense>
                            },
                            {
                                path: 'leavestatuses',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><LeaveStatus /></Suspense>
                            },
                            {
                                path: 'leavedurations',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><LeaveDuration /></Suspense>
                            },
                            {
                                path: 'leavetypes',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><LeaveType /></Suspense>
                            },
                            {
                                path: 'salaries',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><SalarRates /></Suspense>
                            },
                            {
                                path: 'schedules',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Schedules /></Suspense>
                            },
                        ],
                    },
                    {
                        path: 'clientsettings',
                        element: <ClientSettings />,
                        children: [
                            {
                                path: 'clients',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Client /></Suspense>,
                            },
                            {
                                path: 'clientbranches',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><ClientBranch /></Suspense>
                            },
                            {
                                path: 'clientadjustments',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><ClientAdjustment /></Suspense>
                            },
                        ]
                    },
                    {
                        path: 'expensesettings',
                        element: <ExpenseSettings />,
                        children: [
                            {
                                path: 'expense',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><Expense /></Suspense>,
                            },
                            {
                                path: 'expensetype',
                                element: <Suspense fallback={<Content><Skeleton /></Content>}><ExpenseType /></Suspense>,
                            },
                        ]
                    },
                ],
            },
            {
                path: 'employee',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeFiles /></Suspense>
            },
            {
                path: 'employee/archives',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeFilesArchives /></Suspense>
            },
            {
                path: 'salaryadjustments',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><SalaryAdjustment /></Suspense>
            },
            {
                path: 'salaryadjustments/archives',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><SalaryAdjustmentArchives /></Suspense>
            },
            {
                path: 'whosinout',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><WhosInOut /></Suspense>
            },
            {
                path: 'employee/edit/:employeeId',
                element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeEdit /></Suspense>,
                children: [
                    {
                        path: 'employeebenefits',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeBenefits /></Suspense>
                    },
                    {
                        path: 'clientschedule',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><ClientSchedule /></Suspense>
                    },
                    {
                        path: 'contracts',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><Contracts /></Suspense>
                    },
                    {
                        path: 'employeedocuments',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeDocuments /></Suspense>
                    },
                    {
                        path: 'evaluations',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><Evaluations /></Suspense>
                    },
                    {
                        path: 'governmentdocuments',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><GovernmentDocuments /></Suspense>
                    },
                    {
                        path: 'memorandums',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><Memorandums /></Suspense>
                    },
                    {
                        path: 'payscheme',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><PayScheme /></Suspense>
                    },
                    {
                        path: 'leavecredits',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><LeaveCredits /></Suspense>
                    },
                    {
                        path: 'salary',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeSalary /></Suspense>
                    },
                    // {
                    //     path: 'salaryadjustments',
                    //     element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeSalaryAdjustments /></Suspense>
                    // },
                    {
                        path: 'salaryadjustmenttype',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><SalaryAdjustmentType /></Suspense>
                    },
                    // {
                    //     path: 'salaryhistory',
                    //     element: <Suspense fallback={<Content><Skeleton /></Content>}><EmployeeSalaryHistory /></Suspense>
                    // },
                    {
                        path: 'userprofile',
                        element: <Suspense fallback={<Content><Skeleton /></Content>}><UserProfile /></Suspense>
                    },
                ]
            },
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
])

const Container = styled.div`
    display: grid;
    place-items: center;

`