import { Form as AntDForm } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from '../../components'

interface IEmployeeSalaryHistory {
    id: string;
    name: string;
    description: string;
}
const { useForm, Item } = AntDForm

export default function EmployeeSalaryHistory() {
    const { employeeId } = useEmployeeId()
    const [form] = useForm()

    const columns: ColumnsType<IEmployeeSalaryHistory> = [
        {
            title: 'Gross Salary',
            key: 'gross_salary',
            dataIndex: 'gross_salary',
        },
        {
            title: 'Salary Rate',
            key: 'salary_rate',
            dataIndex: 'salary_rate',
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },

    ];

    const data: IEmployeeSalaryHistory[] = []

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Salary'>
            <TabHeader
                name='salary'
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
