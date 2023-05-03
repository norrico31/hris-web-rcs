import { AxiosGetData } from "../utils/Axios";
import { IPermissions } from "./Permissions";

export interface IRole {
    id: string;
    name: string;
    description: string;
    create_at: string
    updated_at: string
    deleted_at: string | null
    position_type_id: string | null
    modules: IPermissions[]
}

export interface ILineManager {
    email: string
    first_name: string
    full_name: string
    id: string
    last_name: string
    middle_name: string | null
}

export type RoleRes = AxiosGetData<IRole>
export type LineManagerRes = AxiosGetData<ILineManager>
