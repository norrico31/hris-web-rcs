import { useState, useEffect } from 'react'
import { Card } from '../../../components'
import { useAxios } from '../../../shared/lib/axios'
// TODO

const { GET } = useAxios()

export default function Schedule() {

    useEffect(() => {
        GET('/schedules')
            .then((res) => {
                console.log(res)
            })
    }, [])

    return (
        <Card title='Schedules'>

        </Card>
    )
}
