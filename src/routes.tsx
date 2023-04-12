import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import { Spin } from "antd"
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
const Tasks = lazy(() => import('./pages/Tasks'))
const EmployeeFiles = lazy(() => import('./pages/EmployeeFiles'))
const SalaryAdjustment = lazy(() => import('./pages/SalaryAdjustment'))

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
const SalaryAdjustmentType = lazy(() => import('./pages/system-settings/hr-settings/SalaryAdjustmentType'))

// Expense Settings
const Expense = lazy(() => import('./pages/system-settings/expense-settings/Expense'))
const ExpenseType = lazy(() => import('./pages/system-settings/expense-settings/ExpenseType'))

// Client Settings
const Client = lazy(() => import('./pages/system-settings/client-settings/Client'))
const ClientBranch = lazy(() => import('./pages/system-settings/client-settings/ClientBranch'))
const ClientBranchAdjustment = lazy(() => import('./pages/system-settings/client-settings/ClientBranchAdjustment'))

// Admin Settings
const Users = lazy(() => import('./pages/admin-settings/Users'))
const Roles = lazy(() => import('./pages/admin-settings/Roles'))
const AuditLogs = lazy(() => import('./pages/admin-settings/AuditLogs'))

// Employee Files (201)
const ClientHistory = lazy(() => import('./pages/employee-files/ClientHistory'))
const EmployeeBenefits = lazy(() => import('./pages/employee-files/EmployeeBenefits'))
const ClientSchedule = lazy(() => import('./pages/employee-files/ClientSchedule'))
const Schedule = lazy(() => import('./pages/employee-files/Schedule'))
const Contracts = lazy(() => import('./pages/employee-files/Contracts'))
const EmployeeDocuments = lazy(() => import('./pages/employee-files/EmployeeDocuments'))
const Evaluations = lazy(() => import('./pages/employee-files/Evaluations'))
const GovernmentDocuments = lazy(() => import('./pages/employee-files/GovernmentDocuments'))
const LeaveCredits = lazy(() => import('./pages/employee-files/LeaveCredits'))
const Memorandums = lazy(() => import('./pages/employee-files/Memorandums'))
const PayScheme = lazy(() => import('./pages/employee-files/PayScheme'))
const EmployeeSalary = lazy(() => import('./pages/employee-files/EmployeeSalary'))
const EmployeeSalaryHistory = lazy(() => import('./pages/employee-files/EmployeeSalaryHistory'))
const EmployeeSalaryAdjustments = lazy(() => import('./pages/employee-files/EmployeeSalaryAdjustments'))
const UserProfile = lazy(() => import('./pages/employee-files/UserProfile'))
const EmployeeSalaryRate = lazy(() => import('./pages/employee-files/EmployeeSalaryRate'))

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
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Dashboard /></Suspense>
            },
            {
                path: 'timekeeping',
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><TimeKeeping /></Suspense>
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
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><TaskActivities /></Suspense>,
                            },
                            {
                                path: 'types',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><TaskTypes /></Suspense>
                            },
                            {
                                path: 'sprints',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><TaskSprint /></Suspense>
                            },
                        ]
                    },
                    {
                        path: 'hrsettings',
                        element: <HRSettings />,
                        children: [
                            {
                                path: 'bankdetails',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><BankDetails /></Suspense>,
                            },
                            {
                                path: 'benefits',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Benefits /></Suspense>
                            },
                            {
                                path: 'holidays',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Holidays /></Suspense>
                            },
                            {
                                path: 'holidaytype',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><HolidayType /></Suspense>
                            },
                            {
                                path: 'dailyrate',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><DailyRate /></Suspense>
                            },
                            {
                                path: 'employeestatus',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeStatus /></Suspense>
                            },
                            {
                                path: 'department',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Department /></Suspense>
                            },
                            {
                                path: 'team',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Team /></Suspense>
                            },
                            {
                                path: 'position',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Position /></Suspense>
                            },
                            {
                                path: 'leavestatus',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><LeaveStatus /></Suspense>
                            },
                            {
                                path: 'leaveduration',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><LeaveDuration /></Suspense>
                            },
                            {
                                path: 'leavetype',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><LeaveType /></Suspense>
                            },
                            {
                                path: 'salaryadjustmenttype',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><SalaryAdjustmentType /></Suspense>
                            },
                        ],
                    },
                    {
                        path: 'clientsettings',
                        element: <ClientSettings />,
                        children: [
                            {
                                path: 'client',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Client /></Suspense>,
                            },
                            {
                                path: 'clientbranch',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><ClientBranch /></Suspense>
                            },
                            {
                                path: 'clientbranchadjustment',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><ClientBranchAdjustment /></Suspense>
                            },
                        ]
                    },
                    {
                        path: 'expensesettings',
                        element: <ExpenseSettings />,
                        children: [
                            {
                                path: 'expense',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Expense /></Suspense>,
                            },
                            {
                                path: 'expensetype',
                                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><ExpenseType /></Suspense>,
                            },
                        ]
                    },
                    // {
                    //     path: 'role',
                    //     element: <Roles />
                    // },
                    // {
                    //     path: 'salaryrate',
                    //     element: <SalaryRate />
                    // },
                ],
            },
            {
                path: 'tasks',
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Tasks /></Suspense>
            },
            {
                path: 'leave',
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Leave /></Suspense>
            },
            {
                path: 'employee',
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeFiles /></Suspense>
            },
            {
                path: 'salaryadjustments',
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><SalaryAdjustment /></Suspense>
            },
            {
                path: 'employee/edit/:employeeId',
                element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeEdit /></Suspense>,
                children: [
                    {
                        path: 'employeebenefits',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeBenefits /></Suspense>
                    },
                    {
                        path: 'clienthistory',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><ClientHistory /></Suspense>
                    },
                    {
                        path: 'clientschedule',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><ClientSchedule /></Suspense>
                    },
                    {
                        path: 'contracts',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Contracts /></Suspense>
                    },
                    {
                        path: 'employeedocuments',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeDocuments /></Suspense>
                    },
                    {
                        path: 'evaluations',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Evaluations /></Suspense>
                    },
                    {
                        path: 'governmentdocuments',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><GovernmentDocuments /></Suspense>
                    },
                    {
                        path: 'memorandums',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Memorandums /></Suspense>
                    },
                    {
                        path: 'payscheme',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><PayScheme /></Suspense>
                    },
                    {
                        path: 'leavecredits',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><LeaveCredits /></Suspense>
                    },
                    {
                        path: 'salary',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeSalary /></Suspense>
                    },
                    {
                        path: 'salaryadjustments',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeSalaryAdjustments /></Suspense>
                    },
                    {
                        path: 'salaryhistory',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><EmployeeSalaryHistory /></Suspense>
                    },
                    {
                        path: 'employeeschedule',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><Schedule /></Suspense>
                    },
                    {
                        path: 'userprofile',
                        element: <Suspense fallback={<Content><Spin size="large" /></Content>}><UserProfile /></Suspense>
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