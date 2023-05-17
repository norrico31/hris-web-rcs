import axios from 'axios'
import { AxiosError, AxiosGet } from '../interfaces'
import { Alert } from './alert'

const axiosClient = axios.create({ baseURL: import.meta.env.VITE_BASE_URL })

axiosClient.interceptors.request.use((req) => {
    let token = localStorage.getItem('t')
    token &&= JSON.parse(token)
    req.headers.Authorization = 'Bearer ' + token
    return req
})

axiosClient.interceptors.response.use((res) => res, err => Promise.reject(err))

// const axiosSanctum = (reqFunc?: any) => axiosClient.get('/sanctum/csrf-cookie')
//     .then(res => Promise.resolve(reqFunc))
//     .catch(err => Promise.reject(err));
// axiosSanctum()

export const useAxios = () => {
    // const POST = <T>(url: string, data: T) => axiosSanctum(axiosClient.post('/api' + url, data))

    const GET = async <T extends unknown>(url: string, signal?: AbortSignal, tableParams?: { page: number; search: string; limit: number }) => {
        let query = tableParams?.page && `${url.includes('?') ? '&' : '?'}page=` + tableParams?.page
        query = (tableParams?.search ? (query + '&search=' + tableParams?.search) : query) ?? ''
        query = tableParams?.limit ? (query + '&limit=' + tableParams?.limit) : query
        try {
            const res = await axiosClient.get<AxiosGet<T>>(url + query, { signal })
            return Promise.resolve(res?.data?.data) as Promise<T>
        } catch (error) {
            const err = error as AxiosError
            if (err.message == 'canceled') return
            return Promise.reject(err)
        }
    }

    const POST = async <T>(url: string, data: T) => {
        try {
            const res = await axiosClient.post(url, data)
            if (res?.data?.message == 'Login Successful') return Promise.resolve(res)
            Alert.success('Create Success', res.data.message)
            return Promise.resolve(res)
        } catch (error) {
            const err = error as AxiosError
            return Promise.reject(err)
        }
    }

    const PUT = async <T>(url: string, data: T) => {
        try {
            const res = await axiosClient.put(url, data)
            Alert.information('Update Success', res.data.message)
            return Promise.resolve(res)
        } catch (error) {
            const err = error as AxiosError
            return Promise.reject(err)
        }
    }

    const DELETE = async (url: string, id: string) => {
        try {
            const res = await axiosClient.delete(url + id)
            Alert.warning('Delete Success', res.data.message)
            return Promise.resolve(res)
        } catch (error) {
            const err = error as AxiosError
            return Promise.reject(err)
        }
    }

    return {
        GET,
        POST,
        PUT,
        DELETE
    }
}

export default axiosClient