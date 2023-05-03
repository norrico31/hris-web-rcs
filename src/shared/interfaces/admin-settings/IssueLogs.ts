import { AxiosGetData } from "../utils/Axios";

export interface IIssueLogs {
    account_type: string
    action: string
    date: string
    id: string | null
    module_name: string
    payload: any
    user_full_name: string
    user_id: string
}

export type IssueLogsRes = AxiosGetData<IIssueLogs>
