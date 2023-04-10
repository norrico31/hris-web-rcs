import { useState } from 'react'
import { renderTitle } from "../shared/utils/utilities"

const infos = [
    {
        id: '1',
        name: 'norrico',
        surname: 'biason'
    },
    {
        id: '2',
        name: 'gerald',
        surname: 'mendones'
    },
    {
        id: '3',
        name: 'jasper',
        surname: 'mendones'
    },
]

export default function Dashboard() {
    renderTitle('Dashboard')
    const [dataList, setDataList] = useState(infos)
    const [selectedId, setSelectedId] = useState('')
    const [name, setName] = useState('')
    const selectedUser: { [k: string]: string } = dataList.reduce((users, user) => ({ ...users, [user.id]: user }), {})

    return (
        <div>
            <h1>Dashboard</h1>
            {dataList.map((info, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, outline: '1px solid red', width: 200, margin: 10 }} onClick={() => {
                    setName('')
                    setSelectedId(info.id)
                }}>
                    <h2>{info.name}</h2>
                    <p>{info.surname}</p>
                </div>
            ))}
            <hr style={{ outline: '1px solid lime' }} />
            {selectedId && (

                <input type="text" style={{ margin: 10 }} value={name} onChange={(evt) => {
                    if (selectedId) {
                        setDataList(dataList.map((d) => d.id == selectedId ? { ...d, name: evt.target.value } : d))
                    }
                    setName(evt.target.value)
                }} />
            )}
            {/* {selectedUser[selectedId]?.name} */}
        </div>
    )
}
