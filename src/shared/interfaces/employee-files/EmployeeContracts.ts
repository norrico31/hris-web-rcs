import { AxiosGetData } from "../utils/Axios"

export interface IEmployeeContracts {
    description: string
    file_name: string | null
    file_path: string | null
    id: string
    type: string
    user_id: string
}

export type EmployeeContractsRes = AxiosGetData<IEmployeeContracts>
