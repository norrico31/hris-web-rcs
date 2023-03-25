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

    // System Settings
    TaskActivities,
    TasksSettings,
    TaskTypes,
    TaskSprint,
    BankDetails,
    ClientBranch,
    ClientBranchHoliday,
    DailyRate,
    Department,
    EmployeeStatus,
    Expense,
    ExpenseType,
    Holiday,
    HolidayType,
    LeaveDuration,
    LeaveStatus,
    LeaveType,
    Position,
    Role,
    SalaryRate,

    //Employee 201 - Edit
    EmployeeEdit,
    EmployeeBenefits,
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
    EmployeeSalaryAdjustments,
    EmployeeSalaryHistory,
    EmployeeUserProfile,
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
                        path: 'taskmanagement/types',
                        element: <TaskTypes />
                    },
                    {
                        path: 'taskmanagement/sprint',
                        element: <TaskSprint />
                    },
                    {
                        path: 'bankdetails',
                        element: <BankDetails />
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
                        path: 'dailyrate',
                        element: <DailyRate />
                    },
                    {
                        path: 'department',
                        element: <Department />
                    },
                    {
                        path: 'employeestatus',
                        element: <EmployeeStatus />
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
                        path: 'holiday',
                        element: <Holiday />
                    },
                    {
                        path: 'holidaytype',
                        element: <HolidayType />
                    },
                    {
                        path: 'leave',
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
                        path: 'position',
                        element: <Position />
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
                path: 'employee/edit/:employeeId',
                element: <EmployeeEdit />,
                children: [
                    {
                        path: 'benefits',
                        element: <EmployeeBenefits />
                    },
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
                        path: 'leavecredits',
                        element: <EmployeeLeaveCredits />
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
                        element: <EmployeeSalaryAdjustments />
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