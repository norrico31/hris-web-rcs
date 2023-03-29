import { useState, useEffect } from 'react'
import { useEndpoints } from '../constants';
import { ITaskActivities, ITaskSprint, ITaskTypes } from '../interfaces';
import { useAxios } from './../lib/axios';

const { GET } = useAxios()
const [{ SYSTEMSETTINGS: { TASKSSETTINGS } }] = useEndpoints()

interface ITasksServices {
    loading: boolean
    activities: ITaskActivities[]
    types: ITaskTypes[]
    sprints: ITaskSprint[]
}

const initState: ITasksServices = {
    loading: true,
    activities: [],
    types: [],
    sprints: []
}

const arrNames = ['activities', 'types', 'sprints']

export const useTasksServices = () => {
    const [tasksSettings, setTasksSettings] = useState(initState)

    useEffect(function fetchData() {
        const controller = new AbortController();

        (async () => {
            try {
                const activitiesRes = getActivities(controller.signal)
                const typesRes = getTypes(controller.signal)
                const sprintsRes = getSprints(controller.signal)
                const results = await Promise.allSettled([activitiesRes, typesRes, sprintsRes]) as any
                const objectKeyed: any = {} as ITasksServices satisfies ITasksServices
                for (let i = 0; i < results.length; i++) {
                    if (results[i].status == 'fulfilled') {
                        const arrays = results[i].value?.data;
                        objectKeyed[arrNames[i]] = arrays
                    }
                }
                setTasksSettings({ ...objectKeyed, loading: false, })
            } catch (error) {
                return error
            }
        })()

        return () => {
            controller.abort()
        }
    }, [])
    console.log('aha: ', tasksSettings)
    return tasksSettings
}

const getActivities = (signal: AbortSignal) => GET(TASKSSETTINGS.ACTIVITIES.GET, signal)
const getTypes = (signal: AbortSignal) => GET(TASKSSETTINGS.TYPES.GET, signal)
const getSprints = (signal: AbortSignal) => GET(TASKSSETTINGS.SPRINT.GET, signal)