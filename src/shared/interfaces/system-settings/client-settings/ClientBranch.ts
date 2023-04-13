import { AxiosGetData } from "../../utils/Axios"
import { IClient } from "./Client"

export interface IClientBranch {
    branch_name: string
    client: IClient
    client_id: string
    created_at: string
    deleted_at: string | null
    id: string
    is_active: string
    updated_at: string
    description?: string
}

export type ClientBranchRes = AxiosGetData<IClientBranch>
