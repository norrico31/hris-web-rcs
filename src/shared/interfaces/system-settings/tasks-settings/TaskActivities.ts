import { AxiosGetData } from "../../utils/Axios"
import { ITeam } from "../hr-settings/Team"

export interface ITaskActivities {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    updated_at: string
    team_id: string
    team: ITeam
    description?: string
}

export type TasksActivitiesRes = AxiosGetData<ITaskActivities>
