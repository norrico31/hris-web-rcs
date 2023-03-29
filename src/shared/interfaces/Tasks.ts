import { AxiosGetData } from "./utils/Axios";

export interface ITasks extends Partial<{ id: string; user_id: string }> {
    name: string;
    task_activity_id: string
    task_type_id: string
    sprint_id: string
    manhours: string
    date: string
    description: string;
}

export type TasksRes = AxiosGetData<ITasks>