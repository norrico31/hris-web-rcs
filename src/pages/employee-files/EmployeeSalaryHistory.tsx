import { Form as AntDForm } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ColumnsType } from 'antd/es/table'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { TabHeader, Table } from '../../components'
import { IEmployeeSalary } from '../../shared/interfaces'

export default function EmployeeSalaryHistory() {
    const { employeeInfo } = useEmployeeCtx()

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
            render: (_, record) => record?.salary_rate?.rate
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

    return (
        <Card title='Salary History'>
            <TabHeader
                handleSearch={fetchData}
            />
            <Table
                columns={columns}
                dataList={employeeInfo?.salary_history ?? []}
                onChange={(evt) => console.log(evt)}
            />
        </Card>
    )
}
