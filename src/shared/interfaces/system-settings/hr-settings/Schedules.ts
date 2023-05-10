import dayjs, { Dayjs } from "dayjs"
import { AxiosGetData } from "../../utils/Axios"
import { IDepartment } from "./Department"

export interface ISchedules {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    updated_at: string
    description?: string
    time_in: string | Dayjs
    time_out: string | Dayjs
}

export type SchedulesRes = AxiosGetData<ISchedules>