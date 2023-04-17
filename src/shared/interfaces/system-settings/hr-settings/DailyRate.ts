import { AxiosGetData } from "../../utils/Axios";

export interface IDailyRate {
    created_at: string
    daily_rate_code: string
    daily_rate_per_hour: string
    description: string | null
    id: string
    is_active: number
    name: string
    night_diff_ot_rate_per_hour: string
    night_diff_rate_per_hour: string
    overtime_rate_per_hour: string
    updated_at: string
}

export type DailyRateRes = AxiosGetData<IDailyRate>
