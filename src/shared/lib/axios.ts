import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})

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
    const GET = (url: string) => axiosClient.get('/api' + url)
    const POST = async <T>(url: string, data: T) => {
        try {
            const res = await axiosClient.post('/api' + url, data)
            // handle modal success
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    const PUT = async <T extends Partial<{ id: string }>>(url: string, data: T) => {
        try {
            const res = await axiosClient.post('/api' + url + '/' + data.id, data)
            // handle modal success
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    return {
        GET,
        POST,
        PUT
    }
}

export default axiosClient