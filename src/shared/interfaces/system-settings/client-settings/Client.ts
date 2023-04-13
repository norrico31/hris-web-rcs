import { AxiosGetData } from "../../utils/Axios"

export interface IClient {
    address: string
    contact_number: string
    contact_person: string
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    status: string
    updated_at: string
    description?: string
}

export type ClientRes = AxiosGetData<IClient>