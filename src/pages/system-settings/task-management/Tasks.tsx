import { Tabs } from "../../../components"

const els = [
    {
        label: 'Task Activities',
        key: '/taskmanagement/activities',
    },
    {
        label: 'Task Types',
        key: '/taskmanagement/types',
    },
    {
        label: 'Sprint',
        key: '/taskmanagement/sprint',
    },
]

export default function Tasks() {
    return <Tabs els={els} title='Tasks' />
}
