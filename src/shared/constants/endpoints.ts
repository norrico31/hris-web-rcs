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
        TIMEKEEPING: {
            TIMEIN: '/time_keepings/time_in',
            TIMEOUT: '/time_keepings/time_out'
        },
        SYSTEMSETTINGS: {
            TASKSSETTINGS: {
                ACTIVITIES: {
                    GET: '/task_activities',
                    POST: '/task_activities/',
                    PUT: '/task_activities/',
                    DELETE: '/task_activities/',
                    LISTS: '/options/task_activities'
                },
                TYPES: {
                    GET: '/task_types',
                    POST: '/task_types/',
                    PUT: '/task_types/',
                    DELETE: '/task_types/',
                    LISTS: '/options/task_types'
                },
                SPRINT: {
                    GET: '/sprints',
                    POST: '/sprints/',
                    PUT: '/sprints/',
                    DELETE: '/sprints/',
                    LISTS: '/options/sprints'
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
                    GET: '/daily_rates',
                    POST: '/daily_rates/',
                    PUT: '/daily_rates/',
                    DELETE: '/daily_rates/',
                },
                DEPARTMENT: {
                    LISTS: '/options/departments',
                    GET: '/departments',
                    POST: '/departments/',
                    PUT: '/departments/',
                    DELETE: '/departments/',
                },
                EMPLOYEESTATUS: {
                    LISTS: '/options/employment_statuses',
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
                    LISTS: '/options/positions',
                    GET: '/positions',
                    POST: '/positions/',
                    PUT: '/positions/',
                    DELETE: '/positions/',
                },
                LEAVEDURATION: {
                    GET: '/leave_durations',
                    POST: '/leave_durations/',
                    PUT: '/leave_durations/',
                    DELETE: '/leave_durations/',
                },
                LEAVESTATUSES: {
                    GET: '/leave_statuses',
                    POST: '/leave_statuses/',
                    PUT: '/leave_statuses/',
                    DELETE: '/leave_statuses/',
                },
                LEAVETYPE: {
                    GET: '/leave_types',
                    POST: '/leave_types/',
                    PUT: '/leave_types/',
                    DELETE: '/leave_types/',
                },
                HOLIDAYS: {
                    GET: '/holidays',
                    POST: '/holidays/',
                    PUT: '/holidays/',
                    DELETE: '/holidays/'
                },
                HOLIDAYTYPES: {
                    GET: '/holiday_types',
                    POST: '/holiday_types/',
                    PUT: '/holiday_types/',
                    DELETE: '/holiday_types/'
                },
                TEAMS: {
                    LISTS: '/options/teams',
                    GET: '/teams',
                    POST: '/teams/',
                    PUT: '/teams/',
                    DELETE: '/teams/'
                },
                SALARYRATES: {
                    LISTS: '/options/salary_rates',
                    GET: '/salary_rates',
                    POST: '/salary_rates/',
                    PUT: '/salary_rates/',
                    DELETE: '/salary_rates/'
                },
            },
            CLIENTSETTINGS: {
                CLIENT: {
                    LISTS: '/options/clients',
                    GET: '/clients',
                    POST: '/clients/',
                    PUT: '/clients/',
                    DELETE: '/clients/'
                },
                CLIENTBRANCH: {
                    LISTS: '/options/client_branches',
                    GET: '/client_branches',
                    POST: '/client_branches/',
                    PUT: '/client_branches/',
                    DELETE: '/client_branches/'
                },
                CLIENTADJUSTMENT: {
                    GET: '/client_adjustments',
                    POST: '/client_adjustments/',
                    PUT: '/client_adjustments/',
                    DELETE: '/client_adjustments/'
                }
            },
            EXPENSESETTINGS: {
                EXPENSE: {
                    GET: '/expenses',
                    POST: '/expense/',
                    PUT: '/expense/',
                    DELETE: '/expense/'

                },
                EXPENSETYPE: {
                    GET: '/expense_types',
                    POST: '/expense_types/',
                    PUT: '/expense_types/',
                    DELETE: '/expense_types/'
                }
            }
        },
        ADMINSETTINGS: {
            ROLES: {
                LISTS: '/options/roles',
                GET: '/roles',
                POST: '/roles/',
                PUT: '/roles/',
                DELETE: '/roles/'
            },
            USERS: {
                LISTS: '/options/users',
                GET: '/users',
                POST: '/users/',
                PUT: '/users/',
                DELETE: '/users/'
            },
        },
        EMPLOYEE201: {
            GET: '/employees',
            POST: '/employees',
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