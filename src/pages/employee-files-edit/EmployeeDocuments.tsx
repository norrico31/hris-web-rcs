import { Form as AntDForm } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from './../../components';

interface IEmployeeDocuments {
    id: string;
    name: string;
    description: string;
}
const { useForm, Item } = AntDForm

export default function EmployeeDocuments() {
    const employeeId = useEmployeeId()
    const [form] = useForm()

    const columns: ColumnsType<IEmployeeDocuments> = [
        {
            title: 'Document Type',
            key: 'document_type',
            dataIndex: 'document_type',
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

    const data: IEmployeeDocuments[] = []

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Employee Documents'>
            <TabHeader
                name='employee documents'
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
