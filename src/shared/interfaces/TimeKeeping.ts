import { IUser, ISchedules } from "."
import { AxiosGetData } from "./utils/Axios"

export interface ITimeKeeping {
    before_overtime_time_in: string | null
    img_url: string | null
    before_overtime_time_out: string | null
    break_time_minutes: string | null
    client_branch_id: string | null
    client_id: string | null
    created_at: string | null
    daily_rate_id: string | null
    deleted_at: string | null
    employee_code: string | null
    id: string | null
    type: string
    location_id: string | null
    is_active: string | null
    leave_date: string | null
    leave_duration_id: string | null
    leave_type_id: string | null
    overtime_date: string | null
    photo_time_in: string | null
    photo_time_out: string | null
    time_keeping_date: string | null
    time_keeping_time: string | null
    updated_at: string | null
    user: IUser
    user_id: string | null
    schedule_time?: string
    schedule: ISchedules,
    is_client_site: number
}

export type TimeKeepingRes = AxiosGetData<ITimeKeeping>
