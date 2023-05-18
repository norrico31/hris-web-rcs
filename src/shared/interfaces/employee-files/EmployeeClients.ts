import { IUser, AxiosGetData, ISchedules } from ".."
import { IClientBranch, IClient } from ".."

export interface IEmployeeClients {
    client: IClient
    branch_name: IClientBranch
    client_branch_id: string
    client_end_date: string
    client_id: string
    client_start_date: string
    id: string
    user_id: string
    is_active: string
    schedule: ISchedules
    schedule_id: string | null
}

export type EmployeeClientsRes = AxiosGetData<IEmployeeClients>