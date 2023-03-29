import { AxiosGetData } from "../../Axios"

export interface IHolidayType {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    updated_at: string
    description?: string
}

export type HolidayTypeRes = AxiosGetData<IHolidayType>