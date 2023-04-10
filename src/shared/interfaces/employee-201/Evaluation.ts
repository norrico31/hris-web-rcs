import { IUser, AxiosGetData } from ".."

interface IRelations {
    id: string
    name: string
}

export interface IEmployeeEvaluation extends IUser {
    created_at: string
    date: string
    deleted_at: string | null
    description: string | null
    id: string
    manhours: string
    sprint: IRelations
    sprint_id: string
    task_activity: IRelations
    task_activity_id: string
    task_type: IRelations
    task_type_id: string
    updated_at: string
    user_id: string
}

export type EmployeeEvaluationRes = AxiosGetData<IEmployeeEvaluation>