import { IBenefits } from ".."

export interface IEmployeeBenefits {
    benefit: IBenefits
    amount: number
    benefit_id: string
    benefit_schedule: string
    id: string
    user_id: string
    is_active: string
    description: string | null
}