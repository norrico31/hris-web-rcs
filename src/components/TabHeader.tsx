import { useState, useCallback, ReactNode } from 'react'
import { Row, Col, Space, Button, Input, Divider as AntDDivider, Popconfirm } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import styled from 'styled-components'

type Props = {
    isRequest?: boolean
    handleCreate?: () => void
    handleSearch: (term: string) => void
    handleModalArchive?: () => void
    children?: ReactNode
}

export default function TabHeader({ isRequest, handleSearch, handleCreate, handleModalArchive, children }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const debouncedSearch = useCallback(debounce((handleSearch), 500), [])

    const onChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(value)
        debouncedSearch(value)
    }

    return (
        <>
            <Row justify={children ? 'space-between' : 'end'} align='middle' wrap>
                {children}
                <Space wrap>
                    <Input.Search placeholder='Search...' value={searchTerm} onChange={onChange} />
                    {handleModalArchive && (
                        <Button type='primary' onClick={handleModalArchive}>View Archives</Button>
                    )}
                    {handleCreate && (<Button className='btn-secondary' onClick={handleCreate}>{isRequest ? 'Request' : 'Create'}</Button>)}
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

export function debounce(cb: (...search: string[]) => void, delay: number) {
    let timerId: ReturnType<typeof setTimeout>
    return (...args: string[]) => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            cb(...args);
        }, delay);
    };
}


declare global {
    namespace NodeJS {
        interface Timeout { }
    }
}