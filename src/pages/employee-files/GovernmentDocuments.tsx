import { Form as AntDForm, Row, Col, Button } from 'antd'
import { Card } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'

const { useForm, Item } = AntDForm
// TODO
export default function GovernmentDocs() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()

    const pagIbig = employeeInfo?.pagibig.pagibig_number
    const philHealth = employeeInfo?.philhealth.philhealth_number
    const sss = employeeInfo?.sss.sss_number
    const tin = employeeInfo?.tin.tin_number;

    return (
        <Card title='Government Docs'>
            <Row gutter={[24, 24]} wrap>
                <CardItem
                    heading='Pagibig'
                    gov={pagIbig}
                    onClick={() => alert('pag ibig')}
                />
                <CardItem
                    heading='Philhealth'
                    gov={philHealth}
                    onClick={() => alert('Philhealth')}
                />
                <CardItem
                    heading='SSS'
                    gov={sss}
                    onClick={() => alert('SSS')}
                />
                <CardItem
                    heading='Tin'
                    gov={tin}
                    onClick={() => alert('Tin')}
                />
            </Row>
        </Card>
    )
}

type CardItemProps = {
    heading: string
    gov?: string
    onClick: () => void
}

function CardItem({ heading, gov, onClick }: CardItemProps) {
    return (
        <Col xs={8} sm={24} md={12} lg={8} xl={8}>
            <Card title={heading}>{gov != undefined ? gov : <Button type='primary' onClick={onClick}>Update</Button>}</Card>
        </Col>
    )
}