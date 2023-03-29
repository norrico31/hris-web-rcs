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
            TASKSSETTINGS: {
                ACTIVITIES: {
                    GET: 'task_activities?relations=teams',
                    POST: 'task_activities/',
                    PUT: 'task_activities/',
                    DELETE: 'task_activities/',
                },
                TYPES: {
                    GET: 'task_types?relations=teams',
                    POST: 'task_types/',
                    PUT: 'task_types/',
                    DELETE: 'task_types/',
                },
                SPRINT: {
                    GET: 'sprints?relations=teams',
                    POST: 'sprints/',
                    PUT: 'sprints/',
                    DELETE: 'sprints/',
                },
            },
            HRSETTINGS: {
                BANKDETAILS: {
                    GET: 'bank_details',
                    POST: 'bank_details/',
                    PUT: 'bank_details/',
                    DELETE: 'bank_details/',
                },
                BENEFITS: {
                    GET: 'benefits',
                    POST: 'benefits/',
                    PUT: 'benefits/',
                    DELETE: 'benefits/',
                },
                HOLIDAYS: {
                    GET: 'holidays',
                    POST: 'holidays/',
                    PUT: 'holidays/',
                    DELETE: 'holidays/'
                },
                HOLIDAYTYPES: {
                    GET: 'holiday_types',
                    POST: 'holiday_types/',
                    PUT: 'holiday_types/',
                    DELETE: 'holiday_types/'
                },


                TEAMS: {
                    GET: 'teams',
                    POST: 'teams/',
                    PUT: 'teams/',
                    DELETE: 'teams/'
                },
            },

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