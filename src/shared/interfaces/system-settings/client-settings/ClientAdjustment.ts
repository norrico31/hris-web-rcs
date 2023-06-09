import { AxiosGetData } from "../../utils/Axios"
import { IClient } from "./Client"

export interface IClientAdjustment {
    branch_name: string
    client: IClient
    client_id: string
    created_at: string
    deleted_at: string | null
    id: string
    is_active: number
    updated_at: string
    description?: string
}

export type ClientAdjustmentRes = AxiosGetData<IClientAdjustment>
