import { AxiosGetData } from ".."

export interface IEmployeeEvaluation {
    copy: string
    description: string
    file_name: string
    file_path: string
    id: string
    type: string
    user_id: string
}

export type EmployeeEvaluationRes = AxiosGetData<IEmployeeEvaluation>