import { useState, useCallback, ReactNode } from 'react'
import { Row, Col, Space, Button, Input, Divider as AntDDivider, Popconfirm } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import styled from 'styled-components'

type Props = {
    name: string
    handleCreate?: () => void
    handleDownload?: () => void
    handleSearch: (term: string) => void
    children?: ReactNode
}

export default function TabHeader({ name, handleSearch, handleCreate, handleDownload, children }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const debouncedSearch = useCallback(debounce((handleSearch), 500), [])

    const onChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(value)
        debouncedSearch(value)
    }

    return (
        <>
            <Row justify={children ? 'space-between' : 'end'} align='middle'>
                {children}
                <Space>
                    {handleDownload != undefined && (
                        <Popconfirm
                            title={`Download`}
                            description={`Are you sure you want to download ${name} template?`}
                            icon={<DownloadOutlined />}
                            onConfirm={handleDownload}
                            okText='Download'
                        >
                            <Button type='primary'>Download template</Button>
                        </Popconfirm>
                    )}
                    <Input.Search placeholder='Search...' value={searchTerm} onChange={onChange} />
                    {handleCreate && (<Button className='btn-secondary' onClick={handleCreate}>Create</Button>)}
                </Space>
            </Row>
            <Divider dashed={false} />
        </>
    )
}

export const Divider = styled(AntDDivider)`
    border-block-start: none;
    margin: .5rem;
`

function debounce(cb: (...search: string[]) => void, delay: number) {
    let timerId: NodeJS.Timeout
    return (...args: string[]) => {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}