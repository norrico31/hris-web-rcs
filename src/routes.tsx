import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components";
import {
    // Root
    Login,
    Dashboard,
    TimeKeeping,
    Leave,
    Tasks,
    EmployeeFiles,
    Client,
    SalaryAdjustment,

    //* System Settings
    // Tasks Settings
    TaskActivities,
    TasksSettings,
    TaskTypes,
    TaskSprint,

    // HR Settings
    HRSettings,
    BankDetails,
    Benefits,
    Holidays,
    HolidayType,
    DailyRate,
    EmployeeStatus,
    Department,
    Team,
    Position,
    LeaveStatus,
    LeaveDuration,
    LeaveType,
    SalaryAdjustmentType,

    // Expense Settings
    Expense,
    ExpenseType,

    // Client Settings
    ClientBranch,
    ClientBranchHoliday,

    Role,

    //Employee 201 - Edit
    EmployeeEdit,
    EmployeeClientHistory,
    EmployeeClientSchedule,
    EmployeeSchedule,
    EmployeeContracts,
    EmployeeDocuments,
    EmployeeEvaluations,
    EmployeeGovernmentDocuments,
    EmployeeLeaveCredits,
    EmployeeMemorandums,
    EmployeePayScheme,
    EmployeeSalary,
    EmployeeSalaryHistory,
    EmployeeUserProfile,
    SalaryRate,
} from './pages'

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'timekeeping',
                element: <TimeKeeping />
            },
            {
                path: 'systemsettings',
                element: <div><Outlet /></div>,
                children: [
                    {
                        path: 'taskmanagement',
                        element: <TasksSettings />,
                        children: [
                            {
                                path: 'activities',
                                element: <TaskActivities />,
                            },
                            {
                                path: 'types',
                                element: <TaskTypes />
                            },
                            {
                                path: 'sprint',
                                element: <TaskSprint />
                            },
                        ]
                    },
                    {
                        path: 'hrsettings',
                        element: <HRSettings />,
                        children: [
                            {
                                path: 'bankdetails',
                                element: <BankDetails />,
                            },
                            {
                                path: 'benefits',
                                element: <Benefits />
                            },
                            {
                                path: 'holidays',
                                element: <Holidays />
                            },
                            {
                                path: 'holidaystype',
                                element: <HolidayType />
                            },
                            {
                                path: 'dailyrate',
                                element: <DailyRate />
                            },
                            {
                                path: 'employeestatus',
                                element: <EmployeeStatus />
                            },
                            {
                                path: 'department',
                                element: <Department />
                            },
                            {
                                path: 'team',
                                element: <Team />
                            },
                            {
                                path: 'position',
                                element: <Position />
                            },
                            {
                                path: 'leavestatus',
                                element: <LeaveStatus />
                            },
                            {
                                path: 'leaveduration',
                                element: <LeaveDuration />
                            },
                            {
                                path: 'leavetype',
                                element: <LeaveType />
                            },
                            {
                                path: 'salaryadjustmenttype',
                                element: <SalaryAdjustmentType />
                            },
                        ]
                    },
                    {
                        path: 'taskmanagement/types',
                        element: <TaskTypes />
                    },
                    {
                        path: 'taskmanagement/sprint',
                        element: <TaskSprint />
                    },
                    {
                        path: 'client',
                        element: <Client />
                    },
                    {
                        path: 'clientbranch',
                        element: <ClientBranch />
                    },
                    {
                        path: 'clientbranchholiday',
                        element: <ClientBranchHoliday />
                    },
                    {
                        path: 'expense',
                        element: <Expense />
                    },
                    {
                        path: 'expensetype',
                        element: <ExpenseType />
                    },
                    {
                        path: 'role',
                        element: <Role />
                    },
                    {
                        path: 'salaryrate',
                        element: <SalaryRate />
                    },
                ],
            },
            {
                path: 'tasks',
                element: <Tasks />
            },
            {
                path: 'leave',
                element: <Leave />
            },
            {
                path: 'employee',
                element: <EmployeeFiles />,
            },
            {
                path: 'salaryadjustments',
                element: <SalaryAdjustment />,
            },
            {
                path: 'employee/edit/:employeeId',
                element: <EmployeeEdit />,
                children: [
                    {
                        path: 'clienthistory',
                        element: <EmployeeClientHistory />
                    },
                    {
                        path: 'clientschedule',
                        element: <EmployeeClientSchedule />
                    },
                    {
                        path: 'contracts',
                        element: <EmployeeContracts />
                    },
                    {
                        path: 'employeedocuments',
                        element: <EmployeeDocuments />
                    },
                    {
                        path: 'evaluations',
                        element: <EmployeeEvaluations />
                    },
                    {
                        path: 'governmentdocuments',
                        element: <EmployeeGovernmentDocuments />
                    },
                    {
                        path: 'memorandums',
                        element: <EmployeeMemorandums />
                    },
                    {
                        path: 'payscheme',
                        element: <EmployeePayScheme />
                    },
                    {
                        path: 'salary',
                        element: <EmployeeSalary />
                    },
                    {
                        path: 'salaryadjustments',
                    },
                    {
                        path: 'salaryhistory',
                        element: <EmployeeSalaryHistory />
                    },
                    {
                        path: 'employeeschedule',
                        element: <EmployeeSchedule />
                    },
                    {
                        path: 'userprofile',
                        element: <EmployeeUserProfile />
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