//* Root
export { default as Login } from './Login'
export { default as Dashboard } from './Dashboard'
export { default as Employee } from './Employee'
export { default as TimeKeeping } from './TimeKeeping'
export { default as Leave } from './Leave'
export { default as Tasks } from './Tasks'

//* System Settings
// Task Management
export { default as TasksManagement } from './system-settings/task-management/TasksManagement'
export { default as TaskActivities } from './system-settings/task-management/TaskActivities'
export { default as TaskTypes } from './system-settings/task-management/TaskTypes'
export { default as TaskSprint } from './system-settings/task-management/TaskSprint'

export { default as BankDetails } from './system-settings/BankDetails'
export { default as Client } from './system-settings/Client'
export { default as ClientBranch } from './system-settings/ClientBranch'
export { default as ClientBranchHoliday } from './system-settings/ClientBranchHoliday'
export { default as DailyRate } from './system-settings/DailyRate'
export { default as Department } from './system-settings/Department'
export { default as EmployeeStatus } from './system-settings/EmployeeStatus'
export { default as Expense } from './system-settings/Expense'
export { default as ExpenseType } from './system-settings/ExpenseType'
export { default as Holiday } from './system-settings/Holiday'
export { default as HolidayType } from './system-settings/HolidayType'
export { default as LeaveStatus } from './system-settings/LeaveStatus'
export { default as LeaveDuration } from './system-settings/LeaveDuration'
export { default as LeaveType } from './system-settings/LeaveType'
export { default as Position } from './system-settings/Position'
export { default as Role } from './system-settings/Role'
export { default as SalaryRate } from './system-settings/SalaryRate'
export { default as Schedule } from './system-settings/Schedule'

export function renderTitle(title: string) {
    window.document.title = `Redcore - ${title}`
}