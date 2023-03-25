import { Form as AntDForm } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from './../../components';

interface IClientAndSchedule {
    id: string;
    name: string;
    description: string;
}
const { useForm, Item } = AntDForm

export default function ClientAndSchedule() {
    const employeeId = useEmployeeId()
    const [form] = useForm()

    const columns: ColumnsType<IClientAndSchedule> = [
        {
            title: 'Client',
            key: 'client',
            dataIndex: 'client',
        },
        {
            title: 'Client Branch',
            key: 'client_branch',
            dataIndex: 'client_branch',
        },
        {
            title: 'Schedule',
            key: 'schedule',
            dataIndex: 'schedule',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },

    ];

    const data: IClientAndSchedule[] = []

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Client and Schedule'>
            <TabHeader
                name='client and schedule'
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
