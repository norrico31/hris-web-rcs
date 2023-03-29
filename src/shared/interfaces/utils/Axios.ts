
export interface AxiosGet<T> {
    data: {
        message: string
        data: AxiosGetData<T>
    }
    status: number
    statusText: "OK"
}

export interface AxiosGetData<T> {
    current_page: number
    data: T[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    next_page_url: string
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
}

export interface AxiosError {
    code: string
    message: string
    name: string
    response: {
        data: {
            errors?: {
                [k: string]: string
            }[]
            message: string
        }
        status: number
        statusText: string
    }
}