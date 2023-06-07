import { IUser, ISchedules } from "."
import { AxiosGetData } from "./utils/Axios"

export interface ITimeKeeping {
    actual_time_in: string | null
    actual_time_out: string | null
    after_overtime_time_in: string | null
    after_overtime_time_out: string | null
    before_overtime_time_in: string | null
    before_overtime_time_out: string | null
    break_time_minutes: string | null
    client_branch_id: string | null
    client_id: string | null
    created_at: string | null
    daily_rate_id: string | null
    deleted_at: string | null
    employee_code: string | null
    for_late_computation: string | null
    for_under_time_computation: string | null
    id: string | null
    type: string
    is_active: string | null
    leave_date: string | null
    leave_duration_id: string | null
    leave_type_id: string | null
    overtime_date: string | null
    photo_time_in: string | null
    photo_time_out: string | null
    time_in: string | null
    time_in_location: string | null
    time_keeping_date: string | null
    time_keeping_status: string | null
    time_out: string | null
    time_out_location: string | null
    updated_at: string | null
    user: IUser
    user_id: string | null
    schedule_time?: string
    schedule: ISchedules,
    is_client_site: number
}

export type TimeKeepingRes = AxiosGetData<ITimeKeeping>
