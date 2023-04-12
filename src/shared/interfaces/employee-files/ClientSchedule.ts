import { IUser, AxiosGetData } from ".."
import { IClientBranch, IClient } from ".."
export interface IClientSchedule {
    client: IClient
    branch_name: IClientBranch
    client_branch_id: string
    client_end_date: string
    client_id: string
    client_start_date: string
    id: string
    user_id: string
}

export type ClientScheduleRes = AxiosGetData<IClientSchedule>