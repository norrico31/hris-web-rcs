import { ReactNode } from 'react'
import { Typography } from 'antd'
import styled from 'styled-components'

const { Title } = Typography

type Props = {
    level?: 5 | 1 | 2 | 3 | 4;
    title?: string | ReactNode;
    children: ReactNode;
    style?: React.CSSProperties
}

export default function Card({ level = 3, title, style, children }: Props) {
    return (
        <Container style={style}>
            {title && <Title level={level}>{title}</Title>}
            {children}
        </Container>
    )
}

const Container = styled.div`
    box-shadow: 0 0 5px rgba(0,0,0,0.05), 0 0 10px rgba(0,0,0,0.15);
    padding: 2rem;
`