import { IUser, AxiosGetData } from ".."

interface IRelations {
    id: string
    name: string
}

export interface IEmployee extends IUser {
    id: string
    employee_no: string
    employee_name: string
    position: string
    department: string
    date_hired: string
    status: string
}

export type Employee201Res = AxiosGetData<IEmployee>