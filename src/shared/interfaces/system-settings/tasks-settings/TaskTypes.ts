import { AxiosGetData } from "../../Axios"

export interface ITaskTypes {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    updated_at: string
    description?: string
}

export type TaskTypesRes = AxiosGetData<ITaskTypes>