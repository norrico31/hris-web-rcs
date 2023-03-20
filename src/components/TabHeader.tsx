import { Row, Col, Space, Button, Input, Divider as AntDDivider, Popconfirm } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import styled from 'styled-components'

type Props = {
    name: string
    handleCreate: () => void
    handleDownload: () => void
}

export default function TabHeader({ name, handleCreate, handleDownload }: Props) {
    return (
        <>
            <Row justify='space-between' align='middle'>
                <Col>
                    <Space align='end'>
                        <Input.Search placeholder='Search...' />
                        <Button onClick={handleCreate}>Create</Button>
                    </Space>
                </Col>
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
            </Row>
            <Divider dashed={false} />
        </>
    )
}

const Divider = styled(AntDDivider)`
    border-block-start: none;
    margin: 1rem;
`