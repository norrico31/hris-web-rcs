import { Dayjs } from "dayjs"
import { IPayScheme, IEmployeeBenefits, IEmployeeClients, IEmployeeContracts, IEmployeeEvaluation, ILeaveCredits, IMemorandum, IPagibig, IPhilhealth, ITin, ISss, IEmployeeSalary, AxiosGetData } from ".."

export interface IUser {
    address: string | null
    birthday: string | null | Dayjs
    client_branch_id: string | null
    bank_detail: IPayScheme
    client_id: string | null
    created_at: string
    date_hired: string | null
    deleted_at: string | null
    email: string
    employee_code: string | null
    employee_clients: IEmployeeClients[]
    employee_contracts: IEmployeeContracts[]
    employee_benefits: IEmployeeBenefits[]
    employee_status: string | null
    evaluations: IEmployeeEvaluation[]
    ext_name: string | null
    first_name: string
    full_name: string
    gender: string | null
    id: string
    is_active: string
    last_name: string
    leave_credit: ILeaveCredits
    marital_status: string | null
    memos: IMemorandum[]
    middle_name: string | null
    mobile_number1: string | null
    mobile_number2: string | null
    no_of_children: number
    pagibig: IPagibig
    philhealth: IPhilhealth
    photo: string | null
    position_id: string
    position_name: string | null
    resignation_date: string | null
    role_id: string
    salary: IEmployeeSalary
    salary_history: IEmployeeSalary[]
    sss: ISss
    status: string | null
    suffix: string | null
    updated_at: string
    tin: ITin
    description: string | null
}

export type UserRes = AxiosGetData<IUser>