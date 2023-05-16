import { IUser, AxiosGetData, ITeam } from "."

interface IRelations {
    id: string
    name: string
}

export interface ITasks extends IUser {
    created_at: string
    date: string
    deleted_at: string | null
    description: string | null
    id: string
    manhours: string
    sprint: IRelations
    sprint_id: string | null
    task_activity: IRelations
    task_activity_id: string | null
    task_type: IRelations
    team: ITeam
    task_type_id: string | null
    updated_at: string
    user_id: string
}

export type TasksRes = AxiosGetData<ITasks>