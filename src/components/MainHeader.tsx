import { ReactNode } from 'react'
import { Row, Divider } from 'antd'
import styled from 'styled-components'

type Props = {
    children: ReactNode
}

export default function MainHeader({ children }: Props) {
    return (
        <>
            <Main align='middle' justify='space-between'>
                {children}
            </Main>
            <Divider />
        </>
    )
}

const Main = styled(Row)`
    width: 100%;
    background: rgb(155, 52, 35);
    height: 60px;
    padding: 0 3rem;
    border-radius: 8px;
    display: flex;

    h2, h3, h4 {
        color: #fff;
    }
    h3 {
        margin-top: 2px;
    }
    .btn-timeinout {
        background: #F9C921;
        border: none;
        /* color: #fff; */
        display: flex;
        align-items: center;
        gap: .5rem;

        svg {
            font-size: 1.5rem !important;
        }

    }
`