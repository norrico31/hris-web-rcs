import { AxiosGetData } from "../../utils/Axios"
import { ITeam } from "../hr-settings/Team"

export interface ITaskSprint {
    id: string
    name: string
    start_date: string
    end_date: string
    team_id: string
    team: ITeam
    description: string
}
export type TaskSprintRes = AxiosGetData<ITaskSprint>