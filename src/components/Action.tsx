import { Button, Space, Popconfirm } from 'antd'
import { BsFillTrashFill } from 'react-icons/bs'
import { AiOutlineEdit } from 'react-icons/ai'

type ActionProps = {
    title: string
    name: string
    isDisable?: boolean
    onConfirm: () => void
    onClick: () => void
}

export default function Action({ title, name, isDisable, onConfirm, onClick }: ActionProps) {
    return (
        <Space>
            <Button id='edit' type='default' size='middle' onClick={onClick} className='btn-edit' disabled={isDisable}>
                <AiOutlineEdit color='white' />
            </Button>
            <Popconfirm
                title={`Delete the ${title}`}
                description={`Are you sure you want to delete ${name}?`}
                onConfirm={onConfirm}
                okText="Delete"
                cancelText="Cancel"
                disabled={isDisable}
            >
                <Button id='delete' type='primary' size='middle' onClick={() => null} disabled={isDisable}>
                    <BsFillTrashFill />
                </Button>
            </Popconfirm>
        </Space>
    )
}
