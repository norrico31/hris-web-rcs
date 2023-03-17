import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Layout } from "./components";
import { Login, Dashboard, TaskManagement, TaskActivities, TaskTypes, TaskSprint, BankingDetails, Client, ClientBranch, ClientBranchHoliday, DailyRate, Expense, ExpenseType, Holiday, HolidayType, Leave, LeaveDuration, LeaveType, Position, Role, SalaryRate, Schedule } from './pages'

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
                path: 'systemsettings',
                element: <div><Outlet /></div>,
                children: [
                    {
                        path: 'taskmanagement',
                        element: <TaskManagement />,
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
                        element: <Leave />
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
                ]
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    },

])