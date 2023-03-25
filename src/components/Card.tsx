import { ReactNode } from 'react'
import { Typography } from 'antd'
import styled from 'styled-components'

const { Title: AntDTitle } = Typography

export default function Card({ level = 3, title, children }: { level?: 5 | 1 | 2 | 3 | 4; title: string; children: ReactNode }) {
    return (
        <Container>
            <Title level={level}>{title}</Title>
            {children}
        </Container>
    )
}

const Container = styled.div`
    box-shadow: 0 10px 20px rgba(0,0,0,0.05), 0 6px 6px rgba(0,0,0,0.09);
    padding: 2rem;
`

const Title = styled(AntDTitle)`
    margin: 0 0 2rem 0 !important;
`