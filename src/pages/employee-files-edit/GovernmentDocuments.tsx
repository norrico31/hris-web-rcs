import { Form as AntDForm } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from './../../components';

interface IGovernmentDocs {
    id: string;
    name: string;
    description: string;
}
const { useForm, Item } = AntDForm

export default function GovernmentDocs() {
    const employeeId = useEmployeeId()
    const [form] = useForm()

    const columns: ColumnsType<IGovernmentDocs> = [
        {
            title: 'Philhealth',
            key: 'philhealth',
            dataIndex: 'philhealth',
        },
        {
            title: 'ID No.',
            key: 'id_no',
            dataIndex: 'id_no',
        },
        {
            title: 'Attachments',
            key: 'attachments',
            dataIndex: 'attachments',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },

    ];

    const data: IGovernmentDocs[] = []

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Government Docs'>
            <TabHeader
                name='government documents'
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
