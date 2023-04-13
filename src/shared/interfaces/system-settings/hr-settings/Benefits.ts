import { AxiosGetData } from "../../utils/Axios";

export interface IBenefits {
    created_at: string
    deleted_at: string | null
    description: string
    for_payroll_calculation: string
    id: string
    is_active: string
    name: string
    updated_at: string
}

export type BenefitsRes = AxiosGetData<IBenefits>