import { AxiosGetData } from ".."

export interface IEmployeeDocument {
    id: string;
    name: string;
    description: string;
    file_name: string | null;
    file_path: string | null;
}

export type EmployeeDocumentRes = AxiosGetData<IEmployeeDocument>