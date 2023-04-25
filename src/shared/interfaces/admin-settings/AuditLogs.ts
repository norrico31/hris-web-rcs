import { AxiosGetData } from "../utils/Axios";

export interface IAuditLogs {
    account_type: string
    action: string
    date: string
    id: string | null
    module_name: string
    payload: any
    user_full_name: string
    user_id: string
}

export type AuditLogsRes = AxiosGetData<IAuditLogs>
