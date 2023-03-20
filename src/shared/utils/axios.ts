import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})

axiosClient.interceptors.request.use((req) => {
    let token = localStorage.getItem('t') as any satisfies string
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
    // const GET = (url: string) => axiosSanctum(axiosClient.get('/api' + url)) as Promise<any>
    // const POST = <T>(url: string, data: T) => axiosSanctum(axiosClient.post('/api' + url, data))
    const GET = (url: string) => axiosClient.get('/api' + url) as Promise<any>
    const POST = <T>(url: string, data: T) => axiosClient.post('/api' + url, data)

    return {
        GET,
        POST
    }
}

export default axiosClient