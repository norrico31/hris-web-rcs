import { AxiosGetData } from "../../utils/Axios"

export interface IExpenseType {
    created_at: string
    deleted_at: string | null
    entry: string
    for_client_adjustment: string
    id: string
    is_active: number
    is_taxable: string
    name: string
    updated_at: string
    description: string | null
}

export type ExpenseTypeRes = AxiosGetData<IExpenseType>