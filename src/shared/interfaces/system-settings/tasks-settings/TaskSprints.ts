import { AxiosGetData } from "../../Axios"

export interface ITaskSprint {
    id: string
    name: string
    start_date: string
    end_date: string
    description?: string
}

export type TaskSprintRes = AxiosGetData<ITaskSprint>
