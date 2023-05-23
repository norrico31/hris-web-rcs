export const useEndpoints = () => {
    const ENDPOINTS = {
        AUTH: {
            USER: '/auth-user',
            LOGIN: '/login',
            LOGOUT: '/logout',
            UPDATEPROFILE: '/update_password'
        },
        ANNOUNCEMENT: {
            LISTS: '/options/announcements',
            GET: '/announcements',
            POST: '/announcements/',
            PUT: '/announcements/',
            DELETE: '/announcements/',
        },
        TIMEKEEPING: {
            TIMEIN: '/time_keepings/time_in',
            TIMEOUT: '/time_keepings/time_out',
            GET: '/time_keepings'
        },
        OVERTIME: {
            ARCHIVES: '/overtimes/archives',
            RESTORE: '/overtimes/restore/',
            GET: '/overtimes?manager=',
            POST: '/overtimes/',
            PUT: '/overtimes/',
            DELETE: '/overtimes/',
        },
        WHOSINOUT: {
            IN: '/time_keepings/whos/in',
            OUT: '/time_keepings/whos/out',
        },
        LEAVES: {
            LISTS: '/options/leaves',
            ARCHIVES: '/leaves/archives',
            RESTORE: '/leaves/restore/',
            GET: '/leaves/status/preview?manager=',
            POST: '/leaves/',
            PUT: '/leaves/',
            DELETE: '/leaves/',
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
                    RESTORE: '/bank_details/restore/',
                    LISTS: '/options/bank_details',
                    GET: '/bank_details',
                    POST: '/bank_details/',
                    PUT: '/bank_details/',
                    DELETE: '/bank_details/',
                },
                BENEFITS: {
                    RESTORE: '/benefits/restore/',
                    LISTS: '/options/benefits',
                    GET: '/benefits',
                    POST: '/benefits/',
                    PUT: '/benefits/',
                    DELETE: '/benefits/',
                },
                HOLIDAYS: {
                    RESTORE: '/holidays/restore/',
                    LISTS: '/options/holidays',
                    GET: '/holidays',
                    POST: '/holidays/',
                    PUT: '/holidays/',
                    DELETE: '/holidays/'
                },
                HOLIDAYTYPES: {
                    RESTORE: '/holiday_types/restore/',
                    LISTS: '/options/holiday_types',
                    GET: '/holiday_types',
                    POST: '/holiday_types/',
                    PUT: '/holiday_types/',
                    DELETE: '/holiday_types/'
                },
                DAILYRATE: {
                    RESTORE: '/daily_rates/restore/',
                    LISTS: '/options/daily_rates',
                    GET: '/daily_rates',
                    POST: '/daily_rates/',
                    PUT: '/daily_rates/',
                    DELETE: '/daily_rates/',
                },
                EMPLOYEESTATUS: {
                    RESTORE: '/employment_statuses/restore/',
                    LISTS: '/options/employment_statuses',
                    GET: '/employment_statuses',
                    POST: '/employment_statuses/',
                    PUT: '/employment_statuses/',
                    DELETE: '/employment_statuses/',
                },
                DEPARTMENT: {
                    RESTORE: '/departments/restore/',
                    LISTS: '/options/departments',
                    GET: '/departments',
                    POST: '/departments/',
                    PUT: '/departments/',
                    DELETE: '/departments/',
                },
                TEAMS: {
                    RESTORE: '/teams/restore/',
                    LISTS: '/options/teams',
                    USERS_LISTS: '/options/user_teams',
                    GET: '/teams',
                    POST: '/teams/',
                    PUT: '/teams/',
                    DELETE: '/teams/'
                },
                POSITION: {
                    RESTORE: '/positions/restore/',
                    LISTS: '/options/positions',
                    GET: '/positions',
                    POST: '/positions/',
                    PUT: '/positions/',
                    DELETE: '/positions/',
                },
                LEAVESTATUSES: {
                    RESTORE: '/leave_statuses/restore/',
                    LISTS: '/options/leave_statuses',
                    GET: '/leave_statuses',
                    POST: '/leave_statuses/',
                    PUT: '/leave_statuses/',
                    DELETE: '/leave_statuses/',
                },
                LEAVEDURATION: {
                    RESTORE: '/leave_durations/restore/',
                    LISTS: '/options/leave_durations',
                    GET: '/leave_durations',
                    POST: '/leave_durations/',
                    PUT: '/leave_durations/',
                    DELETE: '/leave_durations/',
                },
                LEAVETYPE: {
                    RESTORE: '/leave_types/restore/',
                    LISTS: '/options/leave_types',
                    GET: '/leave_types',
                    POST: '/leave_types/',
                    PUT: '/leave_types/',
                    DELETE: '/leave_types/',
                },
                SALARYRATES: {
                    RESTORE: '/salary_rates/restore/',
                    LISTS: '/options/salary_rates',
                    GET: '/salary_rates',
                    POST: '/salary_rates/',
                    PUT: '/salary_rates/',
                    DELETE: '/salary_rates/'
                },
                SCHEDULES: {
                    RESTORE: '/schedules/restore/',
                    LISTS: '/options/schedules',
                    GET: '/schedules',
                    POST: '/schedules/',
                    PUT: '/schedules/',
                    DELETE: '/schedules/'
                },
            },
            CLIENTSETTINGS: {
                CLIENT: {
                    RESTORE: '/clients/restore/',
                    LISTS: '/options/clients',
                    GET: '/clients',
                    POST: '/clients/',
                    PUT: '/clients/',
                    DELETE: '/clients/'
                },
                CLIENTBRANCH: {
                    RESTORE: '/client_branches/restore/',
                    LISTS: '/options/client_branches',
                    GET: '/client_branches',
                    POST: '/client_branches/',
                    PUT: '/client_branches/',
                    DELETE: '/client_branches/'
                },
                CLIENTADJUSTMENT: {
                    RESTORE: '/client_adjustments/restore/',
                    GET: '/client_adjustments',
                    POST: '/client_adjustments/',
                    PUT: '/client_adjustments/',
                    DELETE: '/client_adjustments/'
                }
            },
            EXPENSESETTINGS: {
                EXPENSE: {
                    RESTORE: '/expenses/restore/',
                    LISTS: '/options/expenses',
                    GET: '/expenses',
                    POST: '/expenses/',
                    PUT: '/expenses/',
                    DELETE: '/expenses/'

                },
                EXPENSETYPE: {
                    RESTORE: '/expense_types/restore/',
                    LISTS: '/options/expense_types',
                    GET: '/expense_types',
                    POST: '/expense_types/',
                    PUT: '/expense_types/',
                    DELETE: '/expense_types/'
                }
            }
        },
        ADMINSETTINGS: {
            ROLES: {
                RESTORE: '/roles/restore/',
                LINEMANAGERS: '/options/line_managers',
                LISTS: '/options/roles',
                GET: '/roles',
                POST: '/roles/',
                PUT: '/roles/',
                DELETE: '/roles/'
            },
            USERS: {
                RESTORE: '/users/restore/',
                LISTS: '/options/users',
                GET: '/users',
                POST: '/users/',
                PUT: '/users/',
                DELETE: '/users/',
                ACTIVATE: '/users/activate/',
                DEACTIVATE: '/users/deactivate/'
            },
            PERMISSIONS: {
                SHOW: '/roles/',
                PUT: '/roles/permissions/',
                MODULES: '/modules'
            },
            AUDITLOGS: {
                GET: '/audit_logs'
            },
            ISSUELOGS: {
                GET: '/laravel_logs'
            }
        },
        EMPLOYEE201: {
            ARCHIVES: '/employees/archives',
            RESTORE: '/employees/restore/',
            LISTS: '/options/employees',
            GET: '/employees',
            POST: '/employees',
            PUT: '/employees/',
            DELETE: '/employees/',
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
                GET: '/employee_clients',
                POST: '/employee_clients/',
                PUT: '/employee_clients/',
                DELETE: '/employee_clients/'
            },
            EVALUATION: {
                GET: '/employee_evaluations',
                POST: '/employee_evaluations/',
                PUT: '/employee_evaluations/',
                DELETE: '/employee_evaluations/'
            },
            EMPLOYEEDOCUMENT: {
                GET: '/employee_documents',
                POST: '/employee_documents/',
                PUT: '/employee_documents/',
                DELETE: '/employee_documents/'
            },
            MEMORANDUM: {
                GET: '/employee_memos',
                POST: '/employee_memos/',
                PUT: '/employee_memos/',
                DELETE: '/employee_memos/'
            },
            GOVERNMENTDOCS: {
                PAGIBIG: {
                    PUT: '/employee_pagibigs/'
                },
                PHILHEALTH: {
                    PUT: '/employee_philhealths/'
                },
                TIN: {
                    PUT: '/employee_tins/'
                },
                SSS: {
                    PUT: '/employee_sss/'
                },
            },
            EMPLOYEESALARY: {
                GET: '/employee_salaries',
                POST: '/employee_salaries/',
                PUT: '/employee_salaries/',
                DELETE: '/employee_salaries/'
            },
            PAYSCHEME: {
                PUT: '/employee_bank_details/'
            },
            EXPENSE: {
                GET: '/expenses/employee?user_id='
            }
        },
        TASKS: {
            ARCHIVES: '/tasks/archives',
            RESTORE: 'tasks/restore/',
            GET: '/tasks',
            POST: '/tasks/',
            PUT: '/tasks/',
            DELETE: '/tasks/',
            DOWNLOAD: 'https://staging-hrportal.redcoresolutions.com/report_service/api/tasks_report'
        },
    }
    return [ENDPOINTS]
}