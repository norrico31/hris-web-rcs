import { AxiosGetData } from "./utils/Axios"

export interface IAnnouncements {
    content: string
    created_at: string
    deleted_at: string | null
    id: string
    img: string | null
    posted_by: string
    title: string
    updated_at: string
}

export type AnnouncementRes = AxiosGetData<IAnnouncements>
