import { ReactNode } from 'react'
import { Typography } from 'antd'
import styled from 'styled-components'

const { Title: AntDTitle } = Typography

export default function Card({ level = 3, title, children }: { level?: 5 | 1 | 2 | 3 | 4; title: string; children: ReactNode }) {
    return (
        <>
            <Title level={level}>{title}</Title>
            {children}
        </>
    )
}

const Title = styled(AntDTitle)`
    margin: 0 0 2rem 0 !important;
`