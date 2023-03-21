import { useState, useCallback } from 'react'
import { Row, Col, Space, Button, Input, Divider as AntDDivider, Popconfirm } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import styled from 'styled-components'

type Props = {
    name: string
    handleSearchData: (term: string) => void
    handleCreate: () => void
    handleDownload?: () => void
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
                {handleDownload != undefined && (
                    <Col>
                        <Popconfirm
                            title={`Download`}
                            description={`Are you sure you want to download ${name} template?`}
                            icon={<DownloadOutlined />}
                            onConfirm={handleDownload}
                            okText='Download'
                        >
                            <Button>Download template</Button>
                        </Popconfirm>
                    </Col>
                )}
            </Row>
            <Divider dashed={false} />
        </>
    )
}

const Divider = styled(AntDDivider)`
    border-block-start: none;
    margin: 1rem;
`

function debounce(cb: (...search: string[]) => void, delay: number) {
    let timerId: number
    return (...args: string[]) => {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}