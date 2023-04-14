import { AxiosGetData } from "../utils/Axios";

export interface IRole {
    id: string;
    name: string;
    description: string;
}

export type RoleRes = AxiosGetData<IRole>
