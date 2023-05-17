import { Dayjs } from "dayjs"
import { IPayScheme, IPermissions, IRole, IEmployeeBenefits, IEmployeeClients, IEmployeeContracts, IEmployeeEvaluation, ILeaveCredits, IMemorandum, IPagibig, IPhilhealth, ITin, ISss, IEmployeeSalary, AxiosGetData, IDepartment, IPosition, ILineManager, ITeam } from ".."

export interface IUser {
    address: string | null
    birthday: string | null | Dayjs
    client_branch_id: string | null
    bank_detail: IPayScheme
    client_id: string | null
    created_at: string
    date_hired: string | null | Dayjs
    deleted_at: string | null
    department: IDepartment
    email: string
    employee_code: string | null
    employee_clients: IEmployeeClients[]
    contracts: IEmployeeContracts[]
    employee_benefits: IEmployeeBenefits[]
    employment_status: { id: string; name: string }
    employment_status_id: string
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
    modules: IPermissions[]
    mobile_number1: string | null
    mobile_number2: string | null
    no_of_children: number
    is_activate: number | boolean;
    pagibig: IPagibig
    philhealth: IPhilhealth
    photo: string | null
    position: IPosition
    position_id: string
    position_name: string | null
    resignation_date: string | null | Dayjs
    role_id: string
    role: IRole
    salary: IEmployeeSalary
    salary_history: IEmployeeSalary[]
    managers: ILineManager
    manager_id: string | null
    sss: ISss
    status: string | null
    suffix: string | null
    updated_at: string
    tin: ITin
    description: string | null
    team_id: string[]
    teams: ITeam[]
}

export type UserRes = AxiosGetData<IUser>