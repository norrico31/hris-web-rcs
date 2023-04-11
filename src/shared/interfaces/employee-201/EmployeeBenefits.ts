import { IBenefits } from ".."

export interface IEmployeeBenefits extends IBenefits {
    benefit_amount: number
    benefit_id: string
    benefit_schedule: string
    id: string
    user_id: string
}