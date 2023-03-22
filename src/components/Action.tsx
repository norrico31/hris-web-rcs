import { Button, Space, Popconfirm } from 'antd'
import { BsFillTrashFill } from 'react-icons/bs'
import { AiOutlineEdit } from 'react-icons/ai'

type ActionProps = {
    title: string
    name: string
    onConfirm: () => void
    onClick: () => void
}

export default function Action({ title, name, onConfirm, onClick }: ActionProps) {
    return (
        <Space>
            <Button id='edit' type='default' size='middle' onClick={onClick} className='btn-edit'>
                <AiOutlineEdit color='white' />
            </Button>
            <Popconfirm
                title={`Delete the ${title}`}
                description={`Are you sure want to delete ${name}?`}
                onConfirm={onConfirm}
                okText="Delete"
                cancelText="Cancel"
            >
                <Button id='delete' type='primary' size='middle' onClick={() => null}>
                    <BsFillTrashFill />
                </Button>
            </Popconfirm>
        </Space>

    )
}
