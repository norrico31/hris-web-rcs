import { Form as AntDForm } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from './../../components';

interface IEvaluations {
    id: string;
    name: string;
    description: string;
}
const { useForm, Item } = AntDForm

export default function Evaluations() {
    const employeeId = useEmployeeId()
    const [form] = useForm()

    const columns: ColumnsType<IEvaluations> = [
        {
            title: 'Copy',
            key: 'copy',
            dataIndex: 'copy',
        },
        {
            title: 'Type',
            key: 'type',
            dataIndex: 'type',
        },
        {
            title: 'Attachments',
            key: 'attachments',
            dataIndex: 'attachments',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },

    ];

    const data: IEvaluations[] = []

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Evaluations'>
            <TabHeader
                name='evaluations'
                handleSearchData={fetchData}
                handleDownload={handleDownload}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={data}
                onChange={(evt) => console.log(evt)}
            />
        </Card>
    )
}
