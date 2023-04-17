import { AxiosGetData } from "../../utils/Axios"

export interface ISalaryRates {
    created_at: string
    deleted_at: string | null
    id: string
    rate: string
    updated_at: string
    description: string | null
}

export type SalaryRatesRes = AxiosGetData<ISalaryRates>