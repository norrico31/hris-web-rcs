import { ReactNode } from 'react'
import { Card } from "antd"
import styled from 'styled-components'

type Props = {
    children: ReactNode
    title: string
}

export default function Box({ children, title }: Props) {
    return (
        <CardBox title={title} >
            {children}
        </CardBox>
    )
}

const CardBox = styled(Card)`
    width: 100%;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05), 0 6px 6px rgba(0,0,0,0.09);

    .ant-card-head-title {
        font-size: 1.3rem;
    }
`