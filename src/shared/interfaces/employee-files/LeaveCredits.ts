import { AxiosGetData } from "../utils/Axios"

export interface ILeaveCredits {
    balance: number
    created_at: string
    credit: number
    date: string
    debit: number
    deleted_at: null
    remarks: string | null
    transfer_type: string | null
    id: string
    type: string
    updated_at: string
    user_id: string
}

export interface ILeaveCreditsHistory {
    id: string
    user_id: string
    type: string
    transfer_type: string
    credit: number
    debit: number
    balance: number
    remarks: string
    date: string
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export type LeaveCreditsHistoryRes = AxiosGetData<ILeaveCreditsHistory>