import { AxiosGetData } from "../../utils/Axios"
import { ITeam } from "../hr-settings/Team"

export interface ITaskTypes {
    created_at: string
    deleted_at: string | null
    id: string
    name: string
    team_id: string
    team: ITeam
    updated_at: string
    description: string
}
export type TaskTypesRes = AxiosGetData<ITaskTypes>