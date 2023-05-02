import { AxiosGetData } from "../../utils/Axios"
import { IDepartment } from "./Department"

export interface ITeam {
    created_at: string
    deleted_at: string | null
    department: IDepartment
    id: string
    name: string
    updated_at: string
    description?: string
}

export type TeamRes = AxiosGetData<ITeam>