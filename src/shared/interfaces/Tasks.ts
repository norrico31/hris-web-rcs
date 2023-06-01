import { Dayjs } from "dayjs"
import { IUser, AxiosGetData, ITeam, IDepartment } from "."

interface IRelations {
    id: string
    name: string
}

export interface ITasks {
    created_at: string
    date: string | Dayjs | null
    deleted_at: string | null
    description: string | null
    id: string
    name: string
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
    user: IUser
}

export interface ITeamTask {
    created_at: string
    deleted_at: string | null
    department: IDepartment
    department_id: string
    description: string
    id: string
    name: string
    updated_at: string
}
export interface ITeamProjects {
    created_at: string
    id: string
    team_id: string
    teams: ITeamTask[]
    updated_at: string
    user_id: string
}

export type TasksRes = AxiosGetData<ITasks>