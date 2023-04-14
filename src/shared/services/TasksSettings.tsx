import { useState, useEffect } from 'react'
import { useEndpoints } from '../constants'
import { AxiosGetData, ITaskActivities, ITaskSprint, ITaskTypes } from '../interfaces'
import axiosClient from './../lib/axios'

const [{ SYSTEMSETTINGS: { TASKSSETTINGS } }] = useEndpoints()

interface ITasksServices {
    activities: ITaskActivities[]
    types: ITaskTypes[]
    sprints: ITaskSprint[]
}

const initState: ITasksServices = {
    activities: [],
    types: [],
    sprints: []
}

const propNames = ['activities', 'types', 'sprints']

export const useTasksServices = () => {
    const [tasksSettings, setTasksSettings] = useState(initState)
    useEffect(function fetchData() {
        const controller = new AbortController();
        (async () => {
            try {
                const results = await Promise.allSettled(promises(urls, controller.signal)) as any satisfies ITasksServices
                const objectKeyed: any = {} as ITasksServices satisfies ITasksServices
                for (let i = 0; i < results.length; i++) {
                    if (results[i].status == 'fulfilled') {
                        const arrays = results[i].value?.data;
                        objectKeyed[propNames[i]] = arrays;
                    }
                }
                setTasksSettings({ ...objectKeyed })
            } catch (error) {
                return error
            }
        })();
        return () => {
            controller.abort()
        }
    }, [])
    return [tasksSettings, setTasksSettings] as const
}

const urls = [
    TASKSSETTINGS.ACTIVITIES.LISTS,
    TASKSSETTINGS.TYPES.LISTS,
    TASKSSETTINGS.SPRINT.LISTS,
]

const promises = (urls: string[], signal: AbortSignal) => {
    return urls.map(async (url) => {
        return await axiosClient.get<AxiosGetData<ITaskActivities | ITaskTypes | ITaskSprint>>(url, { signal })
    })
}