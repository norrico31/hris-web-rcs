import { notification } from 'antd'
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons'

type Props = {
    header: string
    message?: string
    status: 'success' | 'information' | 'warning' | 'error'
}

const NOTIFICATION_ICONS: { [key: string]: any } = {
    success: <CheckCircleOutlined style={{ color: '#65e227' }} />,
    warning: <ExclamationCircleOutlined style={{ color: '#F7C145' }} />,
    error: <CloseCircleOutlined style={{ color: '#E84749' }} />,
    information: <InfoCircleOutlined style={{ color: '#006F8A' }} />,
}

const NOTIFICATION_COLORS: {
    [key: string]: {
        borderColor: string
        backgroundColor: string
    }
} = {
    success: {
        borderColor: '#a3ed8b',
        backgroundColor: '#dcfbd1',
    },
    warning: {
        borderColor: '#ffd982',
        backgroundColor: '#fef3dd',
    },
    error: {
        borderColor: '#ff7272',
        backgroundColor: '#fddbdb',
    },
    information: {
        borderColor: '#8de1ff',
        backgroundColor: '#e2f2f9',
    },
}

const useAlert = () => {
    const openNotification = ({ header, message, status }: Props) => {
        const notifColor = NOTIFICATION_COLORS[status]
        const NotificationIcon = NOTIFICATION_ICONS[status]
        notification.open({
            placement: 'topRight',
            message: header,
            description: message,
            style: {
                backgroundColor: notifColor.backgroundColor,
                border: `1px solid ${notifColor.borderColor}`,
                borderRadius: '3px',
            },
            icon: NotificationIcon,
        })
    }
    return {
        success: (header: string, message: string) => openNotification({ header, message, status: 'success' }),
        warning: (header: string, message: string) => openNotification({ header, message, status: 'warning' }),
        error: (header: string, message: string) => openNotification({ header, message, status: 'error' }),
        information: (header: string, message: string) => openNotification({ header, message, status: 'information' }),
    }
}

export const Alert = useAlert()