import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import { Login, Dashboard, TaskManagement, TaskActivities, TaskTypes, TaskSprint } from './pages'
// import { GuestLayout, DefaultLayout } from "./components";

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
                element: <TaskManagement />,
                children: [
                    {
                        path: 'taskmanagement/activities',
                        element: <TaskActivities />
                    },
                    {
                        path: 'taskmanagement/types',
                        element: <TaskTypes />
                    },
                    {
                        path: 'taskmanagement/sprint',
                        element: <TaskSprint />
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