import { Dayjs } from "dayjs"
import { IUser } from "."
import { AxiosGetData } from "./utils/Axios"

export interface IOvertime {
    actioned_by: {
        created_at: string
        deleted_at: string | null
        department_id: string | null
        email: string
        employee_id: string
        first_name: string
        full_name: string
        id: string
        internal: number
        is_active: number
        last_name: string
        middle_name: string | null
        role_id: string
        updated_at: string
    }
    cancellation_remarks: string | null
    client_branch_id: string
    client_id: string
    created_at: string
    date_actioned: string
    date_end: string | Dayjs | null
    date_start: string | Dayjs | null
    deleted_at: string | null
    id: string
    leave_type_id: string
    reason: string
    remarks: string | null
    reviewed_by: string | null
    status: string
    time_end: string
    time_start: string
    unpaid_leaves: number
    date: string | Dayjs | null
    updated_at: string
    used_sl: number
    used_vl: number
    user: IUser
    user_id: string
    planned_ot_start: string | Dayjs | null
    planned_ot_end: string | Dayjs | null
}

export type OvertimeRes = AxiosGetData<IOvertime>