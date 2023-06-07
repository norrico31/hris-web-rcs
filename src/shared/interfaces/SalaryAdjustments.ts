import { IUser, IExpenseType } from "./"
import { AxiosGetData } from "./utils/Axios"

export interface ISalaryAdjustment {
    amount: number
    created_at: string
    deleted_at: string | null
    expense_date: string
    expense_description: string
    expense_type: IExpenseType
    expense_type_id: string
    file_name: string | null
    file_path: string | null
    file: string | null | string[]
    id: string
    is_active: string
    is_taxable: string
    receipt_attachment: string | null
    remarks: string
    updated_at: string
    user: IUser
    user_id: string
}

export type SalaryAdjustmentRes = AxiosGetData<ISalaryAdjustment>
