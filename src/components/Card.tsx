import { ReactNode } from 'react'
import { Typography } from 'antd'
import styled from 'styled-components'

const { Title } = Typography

type Props = {
    level?: 5 | 1 | 2 | 3 | 4;
    title?: string | ReactNode;
    isDarkMode?: boolean
    children: ReactNode;
    style?: React.CSSProperties
}

export default function Card({ level = 3, title, isDarkMode, style, children }: Props) {
    return (
        <Container style={style} isDarkMode={isDarkMode}>
            {title && <Title level={level} style={{ color: '#888888', fontWeight: 'bold' }}>{title}</Title>}
            {children}
        </Container>
    )
}

const Container = styled.div<{ isDarkMode?: boolean }>`
    box-shadow: 0 0 5px ${({ isDarkMode }) => isDarkMode ? 'rgba(255, 0, 0, 0.20)' : 'rgba(0,0,0,0.02)'}, 0 0 10px ${({ isDarkMode }) => isDarkMode ? 'rgba(255, 0, 0, 0.20)' : 'rgba(0,0,0,0.10)'} ;
    padding: 2rem;
`