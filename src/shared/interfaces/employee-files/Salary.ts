import { AxiosGetData } from "../utils/Axios"

export interface IEmployeeSalary {
    gross_salary: number
    id: string
    salary_rate: { id: string, rate: string }
    salary_rate_id: string
    user_id: string
    description?: string
}

export type EmployeeSalaryRes = AxiosGetData<IEmployeeSalary>