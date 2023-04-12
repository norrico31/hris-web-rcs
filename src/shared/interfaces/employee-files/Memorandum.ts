import { AxiosGetData } from ".."

export interface IMemorandum {
    description: string
    file_name: string | null
    file_path: string | null
    id: string
    type: string
    user_id: string
}

export type MemorandumRes = AxiosGetData<IMemorandum>