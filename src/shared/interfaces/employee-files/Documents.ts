import { AxiosGetData } from ".."

export interface IEmployeeDocument {
    id: string;
    name: string;
    description: string;
}

export type EmployeeDocumentRes = AxiosGetData<IEmployeeDocument>