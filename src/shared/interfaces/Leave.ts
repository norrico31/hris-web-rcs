import { Dayjs } from "dayjs"
import { IUser, ILeaveType, ILeaveDuration } from "."
import { AxiosGetData } from "./utils/Axios"

export interface ILeave {
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
    client_branch_id: string
    client_id: string
    created_at: string
    date_actioned: string
    date_end: string | Dayjs | null
    date_start: string | Dayjs | null
    deleted_at: string | null
    id: string
    leave_type: ILeaveType
    leave_type_id: string
    reason: string
    remarks: string | null
    reviewed_by: string | null
    leave_durations: ILeaveDuration
    status: string
    time_end: string | Dayjs | null
    time_start: string | Dayjs | null
    unpaid_leaves: number
    updated_at: string
    used_sl: number
    used_vl: number
    user: IUser
    user_id: string
}

export type LeaveRes = AxiosGetData<ILeave>