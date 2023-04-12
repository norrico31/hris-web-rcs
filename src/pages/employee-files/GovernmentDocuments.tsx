import { Form as AntDForm, Row, Col } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'

const { useForm, Item } = AntDForm

export default function GovernmentDocs() {
    const { employeeId, employeeInfo } = useEmployeeCtx()
    const [form] = useForm()

    function fetchData(search: string) {
        console.log(search)
    }

    function handleDownload() {
        alert('download')
    }

    return (
        <Card title='Government Docs'>
            <Row gutter={[24, 24]} wrap>
                <Col xs={8} sm={24} md={12} lg={8} xl={8}>
                    <Card title='Pagibig'># {employeeInfo?.pagibig.pagibig_number}</Card>
                </Col>
                <Col xs={8} sm={24} md={12} lg={8} xl={8}>
                    <Card title='Philhealth'># {employeeInfo?.philhealth.philhealth_number}</Card>
                </Col>
                <Col xs={8} sm={24} md={12} lg={8} xl={8}>
                    <Card title='SSS'># {employeeInfo?.sss.sss_number}</Card>
                </Col>
                <Col xs={8} sm={24} md={12} lg={8} xl={8}>
                    <Card title='Tin'># {employeeInfo?.tin.tin_number}</Card>
                </Col>
            </Row>
        </Card>
    )
}
