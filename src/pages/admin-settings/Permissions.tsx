import { useEffect, useState } from "react"
import { Card } from "antd"

const items = [
    {
        id: '1',
        name: 'norrico'
    },
    {
        id: '2',
        name: 'makima'
    },
    {
        id: '3',
        name: 'gojou'
    },
]

export default function Permissions() {
    const [lists, setLists] = useState<Map<string, typeof items[0]>>(new Map())
    const firstData: typeof items[0] = lists.values().next().value

    useEffect(() => {
        const newLists = new Map(items.map((itm) => [itm.id, itm]))
        setLists(newLists)
    }, [])

    return (
        <Card>
            {Array.from(lists.values()).map(d => (
                JSON.stringify(d.name)
            ))}
            {/* {firstData.name} */}
        </Card>
    )
}
