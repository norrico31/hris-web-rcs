export const useEndpoints = () => {
    const ENDPOINTS = {
        AUTH: {
            USER: '/auth-user',
            LOGIN: '/login',
            LOGOUT: '/logout',
        },
        DASHBOARD: {
            GET: '',
        },
        SYSTEMSETTINGS: {
            TASKS: {
                ACTIVITIES: {
                    GET: 'task_activities',
                    POST: 'task_activities/',
                    PUT: 'task_activities/',
                    DELETE: 'task_activities/',
                },
                TYPES: {
                    GET: 'task_types',
                    POST: 'task_types/',
                    PUT: 'task_types/',
                    DELETE: 'task_types/',
                },
                SPRINT: {
                    GET: 'sprints',
                    POST: 'sprints/',
                    PUT: 'sprints/',
                    DELETE: 'sprints/',
                },
            },
            BANKDETAILS: {
                GET: 'bank_details',
                POST: 'bank_details/',
                PUT: 'bank_details/',
                DELETE: 'bank_details/',
            }
        },
        TASKS: {
            GET: '',
            POST: '',
            PUT: '',
            DELETE: '',
        },
        LEAVE: {
            GET: '',
            POST: '',
            PUT: '',
            DELETE: ''
        }
    }
    return [ENDPOINTS]
}