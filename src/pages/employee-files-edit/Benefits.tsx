import { Form as AntDForm } from 'antd'
import { ColumnsType } from 'antd/es/table';
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from './../../components';

interface IBenefits {
    id: string;
    name: string;
    description: string;
}
const { useForm, Item } = AntDForm

export default function Benefits() {
    const employeeId = useEmployeeId()
    const [form] = useForm()

    const columns: ColumnsType<IBenefits> = [
        {
            title: 'Benefit',
            key: 'benefit',
            dataIndex: 'benefit',
        },
        {
            title: 'Amount',
            key: 'amount',
            dataIndex: 'amount',
        },
        {
            title: 'Schedule',
            key: 'schedule',
            dataIndex: 'schedule',
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

    const data: IBenefits[] = []

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Benefits'>
            <TabHeader
                name='benefits'
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
