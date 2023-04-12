import { Form as AntDForm } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import { Card } from '../../components'
import { useEmployeeId } from '../EmployeeEdit'
import { TabHeader, Table } from '../../components'
import { IEmployeeSalary } from '../../shared/interfaces'

export default function EmployeeSalaryHistory() {
    const { employeeId, employeeInfo } = useEmployeeId()
    const [form] = useForm<IEmployeeSalary>()

    console.log(employeeInfo?.salary_history)

    const columns: ColumnsType<IEmployeeSalary> = [
        {
            title: 'Gross Salary',
            key: 'gross_salary',
            dataIndex: 'gross_salary',
        },
        {
            title: 'Salary Rate',
            key: 'salary_rate',
            dataIndex: 'salary_rate',
            render: (_, record) => record.salary_rate.rate
        },
        {
            title: 'Description',
            key: 'description',
            dataIndex: 'description',
        },
    ]

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Salary History'>
            <TabHeader
                name='salary history'
                handleSearchData={fetchData}
                handleDownload={handleDownload}
            />
            <Table
                loading={false}
                columns={columns}
                dataList={employeeInfo?.salary_history ?? []}
                onChange={(evt) => console.log(evt)}
            />
        </Card>
    )
}
