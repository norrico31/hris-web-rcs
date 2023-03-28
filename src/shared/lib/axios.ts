import axios from 'axios'
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
    const GET = (url: string, tableParams?: { page: number; search: string }) => {
        let query = tableParams?.page && "?page=" + tableParams?.page
        query = (tableParams?.search ? (query + '&search=' + tableParams?.search) : query) ?? ''
        return axiosClient.get(url + query)
    }

    const POST = async <T>(url: string, data: T) => {
        try {
            const res = await axiosClient.post(url, data)
            Alert.success('Create Success', res.data.message)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const PUT = async <T extends Partial<{ id: string }>>(url: string, data: T) => {
        try {
            const res = await axiosClient.put(url + data.id, data)
            Alert.information('Update Success', res.data.message)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const DELETE = async (url: string, id: string) => {
        try {
            const res = await axiosClient.delete(url + id)
            Alert.warning('Delete Success', res.data.message)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
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