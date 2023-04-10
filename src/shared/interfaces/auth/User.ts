import { Dayjs } from "dayjs"

export interface IUser {
    address: string | null
    birthday: string | null | Dayjs
    client_branch_id: string | null
    client_id: string | null
    created_at: string
    date_hired: string | null
    deleted_at: string | null
    email: string
    employee_code: string | null
    employee_status: string | null
    ext_name: string | null
    first_name: string
    full_name: string
    gender: string | null
    id: string
    is_active: string
    last_name: string
    marital_status: string | null
    middle_name: string | null
    mobile_number1: string | null
    mobile_number2: string | null
    no_of_children: number
    photo: string | null
    position_id: string
    position_name: string | null
    resignation_date: string | null
    role_id: string
    status: string | null
    suffix: string | null
    updated_at: string
}

export interface IAuthContext {
    token?: string
    user?: IUser
    setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>
    setToken: React.Dispatch<React.SetStateAction<string | undefined>>
}

export interface AuthUserRes {
    message: string
    data: IUser
    status: number
    statusText: "OK"
}