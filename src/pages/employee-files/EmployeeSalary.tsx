import { Form as AntDForm, Descriptions } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'

const { useForm, Item } = AntDForm
// TODO: PUT method
export default function EmployeeSalary() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [form] = useForm()

    console.log(employeeInfo?.salary)

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Salary'>
            <Descriptions
                layout='vertical'
                bordered
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Salary">{employeeInfo?.salary?.gross_salary}</Descriptions.Item>
                <Descriptions.Item label="Salary Rate">{employeeInfo?.salary?.salary_rate?.rate}</Descriptions.Item>
                <Descriptions.Item label="Description">{employeeInfo?.salary?.description}</Descriptions.Item>
            </Descriptions>
        </Card>
    )
}
