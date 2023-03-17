import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import { Login, Dashboard } from './pages'
// import { GuestLayout, DefaultLayout } from "./components";

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        // element: <Dashboard />
    }
])