import { AxiosGetData } from "../utils/Axios";

export interface IPermissions {
    code: string
    created_at: string
    deleted_at: string | null
    description: string
    id: string
    name: string
    permission_group_id: string
    route: string
    updated_at: string
}

export type PermissionRes = AxiosGetData<IPermissions>
