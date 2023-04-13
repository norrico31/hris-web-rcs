import { AxiosGetData } from "../../utils/Axios";

export interface IEmployeeStatus {
    id: string;
    name: string;
    description?: string;
}

export type EmployeeStatusRes = AxiosGetData<IEmployeeStatus>
