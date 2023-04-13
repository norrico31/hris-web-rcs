import { AxiosGetData } from "../../utils/Axios";

export interface IDepartment {
    id: string;
    name: string;
    description: string;
}

export type DepartmentRes = AxiosGetData<IDepartment>
