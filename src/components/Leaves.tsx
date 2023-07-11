import React from 'react'
import styled from 'styled-components'
import { useAuthContext } from '../shared/contexts/Auth'

export default function Leaves() {
    const { user } = useAuthContext()
    const latestVl = user?.latest_vl
    const latestSL = user?.latest_sl

    return (
        <Table>
            <thead>
                <tr>
                    <td colSpan={2}>Leaves</td>
                </tr>
                <tr>
                    <th>VL</th>
                    <th>SL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{latestVl?.balance ?? 0}</td>
                    <td>{latestSL?.balance ?? 0}</td>
                </tr>
            </tbody>
        </Table>
    )
}

const Table = styled.table`
    text-align: center;
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #c5c5c5dd;

    thead tr td {
        font-size: 1.3rem;
        font-weight: bold;
    }
    
    thead tr th  {
        background-color: rgba(0, 0, 0, 0.02);
        color: #606060dd;
    }
    tbody tr {
        background-color: #ffffff;
    box-shadow: 0px 0px 9px 0px rgba(0,0,0,0.1);
    }
`