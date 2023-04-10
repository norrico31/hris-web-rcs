import { IUser, AxiosGetData } from ".."

export interface IEmployeeDocument extends IUser {
    id: string;
    name: string;
    description: string;
}

export type EmployeeDocumentRes = AxiosGetData<IEmployeeDocument>