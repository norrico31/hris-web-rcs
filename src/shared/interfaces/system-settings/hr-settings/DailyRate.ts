import { AxiosGetData } from "../../utils/Axios";

export interface IDailyRate {
    id: string;
    name: string;
    bank_branch: string
    description?: string;
}

export type DailyRateRes = AxiosGetData<IDailyRate>
