import { useState } from 'react';
import { Action, HeaderContent, Table } from '../components';
import { ColumnsType } from "antd/es/table"
import Card from './../components/Card';

interface ITasks extends Partial<{ id: string }> {
    task_activity: string
    task_type: string
    sprint_name: string
    manhours: string
    date: string
    description: string;
}

export default function Tasks() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedData, setSelectedData] = useState<ITasks | undefined>(undefined)

    const columns: ColumnsType<ITasks> = [
        {
            title: 'Task Activity',
            key: 'task_activity',
            dataIndex: 'task_activity',
        },
        {
            title: 'Task Type',
            key: 'task_type',
            dataIndex: 'task_type',
        },
        {
            title: 'Sprint',
            key: 'sprint_name',
            dataIndex: 'sprint_name',
        },
        {
            title: 'Manhours',
            key: 'manhours',
            dataIndex: 'manhours',
        },
        {
            title: 'Date',
            key: 'date',
            dataIndex: 'date',
        },
        // {
        //     title: 'Start Date',
        //     key: 'start_date',
        //     dataIndex: 'start_date',
        // },
        // {
        //     title: 'End Date',
        //     key: 'end_date',
        //     dataIndex: 'end_date',
        // },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            align: 'center',
            render: (_: any, record: ITasks) => <Action
                title='Tasks'
                name={record.task_activity}
                onConfirm={() => handleDelete(record?.id!)}
                onClick={() => handleEdit(record)}
            />
        },

    ];

    const data: ITasks[] = [
        {
            id: '1',
            task_activity: 'John Brown',
            task_type: 'John Brown',
            sprint_name: 'John Brown',
            date: '2023/03/20',
            manhours: '7',
            description: 'New York No. 1 Lake Park',
        },
        {
            id: '2',
            task_activity: 'Jim Green',
            task_type: 'Jim Green',
            sprint_name: 'Jim Green',
            date: '2023/03/22',
            manhours: '8',
            description: 'London No. 1 Lake Park',
        },
        {
            id: '3',
            task_activity: 'Joe Black',
            task_type: 'Joe Black',
            sprint_name: 'Joe Black',
            date: '10',
            manhours: '2023/03/28',
            description: 'Sydney No. 1 Lake Park',
        },
        {
            id: '4',
            task_activity: 'Disabled User',
            task_type: 'Disabled User',
            sprint_name: 'Disabled User',
            date: '2023/04/09',
            manhours: '7',
            description: 'Sydney No. 1 Lake Park',
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }


    function handleDelete(id: string) {
        console.log(id)
    }

    function handleEdit(data: ITasks) {
        setIsModalOpen(true)
        setSelectedData(data)
    }

    function handleDownload() {
        console.log('dowwnload')
    }

    function handleCloseModal() {
        setSelectedData(undefined)
        setIsModalOpen(false)
    }
    return (
        <Card title='Tasks' level={2}>
            <HeaderContent
                name='Tasks'
                handleSearchData={fetchData}
                handleCreate={() => setIsModalOpen(true)}
                handleDownload={() => handleDownload()}
            />
            <Table loading={false} columns={columns} dataList={data} />
        </Card>
    )
}
