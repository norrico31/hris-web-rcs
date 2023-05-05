import { AxiosGetData } from "../utils/Axios";

export interface IPermissions {
    id: string
    name: string
    action: string
    module: string
    create_at: string
    updated_at: any
}

export type PermissionRes = AxiosGetData<IPermissions>
