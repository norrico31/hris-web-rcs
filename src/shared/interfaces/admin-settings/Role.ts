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
<<<<<<< HEAD
    permissions: IPermissions[]
=======
    modules: IPermissions[]
    permissions: IRolePermission[]
>>>>>>> afb834a4839c3b622da8d280faebdc0f4835f29c
}

export interface ILineManager {
    email: string
    first_name: string
    full_name: string
    id: string
    last_name: string
    middle_name: string | null
}

export interface IRolePermission {
    module: string;
    submodule: string;
    description: string;
    add: IPermissionStatus | IPermissionToggle[];
    edit: IPermissionStatus | IPermissionToggle[];
    delete: IPermissionStatus | IPermissionToggle[];
    view: IPermissionStatus;
    additional_toggles: IPermissionToggle[];
  }
  
  export interface IPermissionStatus {
    id: string;
    enabled: boolean;
  }
  
  export interface IPermissionToggle {
    id: string;
    enabled: boolean;
    name: string;
  }

export type RoleRes = AxiosGetData<IRole>
export type LineManagerRes = AxiosGetData<ILineManager>
