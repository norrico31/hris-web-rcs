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
                    GET: 'task_activities',
                    POST: 'task_activities/',
                    PUT: 'task_activities/',
                    DELETE: 'task_activities/',
                    DROPDOWN: '/options/task_activities'
                },
                TYPES: {
                    GET: 'task_types',
                    POST: 'task_types/',
                    PUT: 'task_types/',
                    DELETE: 'task_types/',
                    DROPDOWN: '/options/task_types'
                },
                SPRINT: {
                    GET: 'sprints',
                    POST: 'sprints/',
                    PUT: 'sprints/',
                    DELETE: 'sprints/',
                    DROPDOWN: '/options/sprints'
                },
            },
            HRSETTINGS: {
                BANKDETAILS: {
                    GET: '/bankingdetails',
                    POST: '/bankingdetails/',
                    PUT: '/bankingdetails/',
                    DELETE: '/bankingdetails/',
                },
                DAILYRATE: {
                    GET: '/dailyrates',
                    POST: '/dailyrates/',
                    PUT: '/dailyrates/',
                    DELETE: '/dailyrates/',
                },
                DEPARTMENT: {
                    GET: '/departments',
                    POST: '/departments/',
                    PUT: '/departments/',
                    DELETE: '/departments/',
                },
                EMPLOYEESTATUS: {
                    GET: '/employment_statuses',
                    POST: '/employment_statuses/',
                    PUT: '/employment_statuses/',
                    DELETE: '/employment_statuses/',
                },
                BENEFITS: {
                    GET: '/benefits',
                    POST: '/benefits/',
                    PUT: '/benefits/',
                    DELETE: '/benefits/',
                },
                POSITION: {
                    GET: '/positions',
                    POST: '/positions/',
                    PUT: '/positions/',
                    DELETE: '/positions/',
                },
                LEAVEDURATION: {
                    GET: '/leave/durations',
                    POST: '/leave/durations/',
                    PUT: '/leave/durations/',
                    DELETE: '/leave/durations/',
                },
                LEAVETYPE: {
                    GET: '/leave/types',
                    POST: '/leave/types/',
                    PUT: '/leave/types/',
                    DELETE: '/leave/types/',
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
                    OPTIONS: 'options/teams',
                    GET: 'teams',
                    POST: 'teams/',
                    PUT: 'teams/',
                    DELETE: 'teams/'
                },
            },
        },
        EMPLOYEE201: {
            GET: '/employees',
            POST: '/employee/',
            PUT: '/employee/update/',
            DELETE: '/employee/',
            BENEFITS: {
                GET: '/employee_benefits',
                POST: '/employee_benefits/',
                PUT: '/employee_benefits/',
                DELETE: '/employee_benefits/'
            },
            CONTRACTS: {
                GET: '/employee_contracts',
                POST: '/employee_contracts/',
                PUT: '/employee_contracts/',
                DELETE: '/employee_contracts/'
            },
            USERPROFILE: {
                GET: '/employees',
                POST: '/employees/',
                PUT: '/employees/',
                DELETE: '/employees/'
            },
            CLIENTSCHEDULE: {
                GET: '/employee_clients/',
                POST: '/employee_clients/',
                PUT: '/employee_clients/',
                DELETE: '/employee_clients/'
            },
            EVALUATION: {
                GET: '/employee_evaluations/',
                POST: '/employee_evaluations/',
                PUT: '/employee_evaluations/',
                DELETE: '/employee_evaluations/'
            },
            EMPLOYEEDOCUMENT: {
                GET: '/employee/document/show/',
                POST: '/employee/document/show/',
                PUT: '/employee/document/show/',
                DELETE: '/employee/document/show/'
            },
            MEMORANDUM: {
                GET: '/memo/show/',
                POST: '/memo/show/',
                PUT: '/memo/show/',
                DELETE: '/memo/show/'
            },
        },
        TASKS: {
            GET: '/tasks',
            POST: '/tasks/',
            PUT: '/tasks/',
            DELETE: '/tasks/',
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