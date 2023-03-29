import { AxiosGetData } from "../../utils/Axios"

export interface IHolidayType {
    created_at: string
    deleted_at: string | null
    id: string
    is_active: number
    name: string
    updated_at: string
    description?: string
}

export type HolidayTypeRes = AxiosGetData<IHolidayType>