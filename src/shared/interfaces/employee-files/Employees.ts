import { IUser, AxiosGetData } from ".."

export interface IEmployee extends IUser {
    id: string
    employee_no: string
    employee_name: string
    position: string
    date_hired: string
    status: string
}

export type Employee201Res = AxiosGetData<IEmployee>