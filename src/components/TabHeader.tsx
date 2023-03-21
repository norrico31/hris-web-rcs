import { useState, useCallback } from 'react'
import { Row, Col, Space, Button, Input, Divider as AntDDivider } from 'antd'
import styled from 'styled-components'

type Props = {
    name: string
    handleSearchData: (term: string) => void
    handleCreate: () => void
    handleDownload: () => void
}

export default function TabHeader({ name, handleSearchData, handleCreate, handleDownload }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const debouncedSearch = useCallback(debounce((searchTerm: string) => {
        handleSearchData(searchTerm)
    }, 500), [])

    const onChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(value)
        debouncedSearch(value)
    }

    return (
        <>
            <Row justify='space-between' align='middle'>
                <Col>
                    <Space align='end'>
                        <Input.Search placeholder='Search...' value={searchTerm} onChange={onChange} />
                        <Button type='default' onClick={handleCreate}>Create</Button>
                    </Space>
                </Col>
            </Row>
            <Divider dashed={false} />
        </>
    )
}

const Divider = styled(AntDDivider)`
    border-block-start: none;
    margin: 1rem;
`

function debounce(cb: (...search: string[]) => void, delay: any) {
    let timerId: any
    return (...args: string[]) => {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}