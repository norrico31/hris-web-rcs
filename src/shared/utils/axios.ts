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

const axiosSanctum = (reqFunc?: Promise<void>) => axiosClient.get('/sanctum/csrf-cookie')
    .then(res => {
        // TODO: handle res
        return Promise.resolve(reqFunc)
    })
    .catch(err => Promise.reject(err));
axiosSanctum()

export const useAxios = () => {
    const GET = async (url: string) => axiosSanctum(axiosClient.get('/api' + url)) as Promise<any>
    return {
        GET
    }
}

export default axiosClient