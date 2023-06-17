import { Dayjs } from "dayjs"
import { AxiosGetData } from "./utils/Axios"

export interface IAnnouncements {
    content: string
    created_at: string
    deleted_at: string | null
    id: string
    external_link?: string
    file_path: string | null | string[]
    file_name: string | null
    posted_by: string
    title: string
    updated_at: string
    publish_date: Dayjs | string | null
}

export type AnnouncementRes = AxiosGetData<IAnnouncements>
