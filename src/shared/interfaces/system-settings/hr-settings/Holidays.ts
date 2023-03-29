import { AxiosGetData } from "../../utils/Axios"

export interface IHoliday {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    updated_at: string
    description?: string
}

export type HolidayRes = AxiosGetData<IHoliday>