import { Tabs as AntDTabs, Typography } from 'antd'
import styled from 'styled-components'

interface Props {
    title: string
    activeKey: string
    onChange(key: string): void
    items: {
        label: string;
        key: string;
        children: JSX.Element;
    }[]
}

export default function Tabs(props: Props) {
    return (
        <>
            <Title level={3}>{props.title}</Title>
            <TabContainer
                destroyInactiveTabPane
                type="card"
                size='small'
                activeKey={props.activeKey}
                tabPosition='top'
                onChange={props.onChange}
                items={props.items}
            />
        </>
    )
}

const { Title: AntDTitle } = Typography

const Title = styled(AntDTitle)`
    margin: 0 0 2rem 0 !important;
`

const TabContainer = styled(AntDTabs)`
   .ant-tabs-nav-list {
        gap: 10px;
    }
    .ant-tabs-tab.ant-tabs-tab-active {
        background: #9B3423;
        color: #fff;
    }
    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #fff;
    }
`