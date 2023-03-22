import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components";
import { Login, Dashboard, TimeKeeping, Tasks, TasksManagement, Leave, Employee, TaskActivities, TaskTypes, TaskSprint, BankingDetails, Client, ClientBranch, ClientBranchHoliday, DailyRate, Department, Expense, ExpenseType, Holiday, HolidayType, LeaveStatus, LeaveDuration, LeaveType, Position, Role, SalaryRate, Schedule } from './pages'

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
                        element: <TasksManagement />,
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
                        path: 'bankingdetails',
                        element: <BankingDetails />
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
                    {
                        path: 'schedule',
                        element: <Schedule />
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
                element: <Employee />
            },
        ]
    },
    {
        path: '/login',
        element: <Login />
    },

])