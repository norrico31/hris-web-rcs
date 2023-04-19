import { Dayjs } from "dayjs"
import { AxiosGetData } from "../../utils/Axios"
import { IHolidayType } from "./HolidayType"

export interface IHoliday {
    created_at: string
    daily_rate_id: string
    holiday_date: string | null | Dayjs
    holiday_type_id: string
    holiday_type: IHolidayType
    id: string
    is_active: number
    is_local: string
    name: string
    updated_at: string
    description: string | null
}

export type HolidayRes = AxiosGetData<IHoliday>