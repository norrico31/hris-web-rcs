import { ReactNode, useState, useEffect } from 'react'
import { Form as AntDForm, Row, Col, Button, Modal, Input, Space, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons';
import { Card, Form } from '../../components'
import { useEmployeeCtx } from '../EmployeeEdit'
import { IArguments, IPagibig, IPhilhealth, ISss, ITin } from '../../shared/interfaces'
import axiosClient from '../../shared/lib/axios'
import { useEndpoints } from '../../shared/constants'
import useMessage from 'antd/es/message/useMessage';

const [{ EMPLOYEE201: { GOVERNMENTDOCS } }] = useEndpoints()

export default function GovernmentDocs() {
    const { employeeId, employeeInfo, fetchData } = useEmployeeCtx()
    const [isModalPagibig, setIsModalPagibig] = useState(false)
    const [isModalPhilHealth, setIsModalPhilHealth] = useState(false)
    const [isModalSss, setIsModalSss] = useState(false)
    const [isModalTin, setIsModalTin] = useState(false)

    const pagIbig = employeeInfo?.pagibig.pagibig_number
    const philHealth = employeeInfo?.philhealth.philhealth_number
    const sss = employeeInfo?.sss.sss_number
    const tin = employeeInfo?.tin.tin_number

    return (
        <Card title='Government Docs'>
            <Row gutter={[24, 24]} wrap>
                <CardItem
                    heading='Pagibig'
                    gov={pagIbig}
                    onClick={() => setIsModalPagibig(true)}
                >
                    <PagibigUpdateModal
                        userId={employeeId}
                        title='Pagibig'
                        keyProp='pagibig_number'
                        url={GOVERNMENTDOCS.PAGIBIG.PUT}
                        fetchData={fetchData}
                        isModalOpen={isModalPagibig}
                        handleCancel={() => setIsModalPagibig(false)}
                        selectedData={employeeInfo?.pagibig}
                    />
                </CardItem>
                <CardItem
                    heading='Philhealth'
                    gov={philHealth}
                    onClick={() => setIsModalPhilHealth(true)}
                >
                    <PagibigUpdateModal
                        userId={employeeId}
                        title='Philhealth'
                        keyProp='philhealth_number'
                        url={GOVERNMENTDOCS.PHILHEALTH.PUT}
                        fetchData={fetchData}
                        isModalOpen={isModalPhilHealth}
                        handleCancel={() => setIsModalPhilHealth(false)}
                        selectedData={employeeInfo?.philhealth}
                    />
                </CardItem>
                <CardItem
                    heading='SSS'
                    gov={sss}
                    onClick={() => setIsModalSss(true)}
                >
                    <PagibigUpdateModal
                        userId={employeeId}
                        title='SSS'
                        keyProp='sss_number'
                        url={GOVERNMENTDOCS.TIN.PUT}
                        fetchData={fetchData}
                        isModalOpen={isModalSss}
                        handleCancel={() => setIsModalSss(false)}
                        selectedData={employeeInfo?.sss}
                    />
                </CardItem>
                <CardItem
                    heading='Tin'
                    gov={tin}
                    onClick={() => setIsModalTin(true)}
                >
                    <PagibigUpdateModal
                        userId={employeeId}
                        title='Tin'
                        keyProp='tin_number'
                        url={GOVERNMENTDOCS.SSS.PUT}
                        fetchData={fetchData}
                        isModalOpen={isModalTin}
                        handleCancel={() => setIsModalTin(false)}
                        selectedData={employeeInfo?.tin}
                    />
                </CardItem>
            </Row>
        </Card>
    )
}

type CardItemProps = {
    heading: string
    gov?: string
    onClick: () => void
    children: ReactNode
}

function CardItem({ heading, gov, onClick, children }: CardItemProps) {
    return (
        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card title={heading}>
                {gov != undefined ? (
                    <Row justify='space-between'>
                        <p>Number: <b>{gov}</b></p>
                        <Button type='primary' onClick={onClick}>Update</Button>
                    </Row>
                ) : <Button type='primary' onClick={onClick}>Add</Button>}
            </Card>
            {children}
        </Col>
    )
}

const { Item: FormItem, useForm } = AntDForm

interface PagibigUpdateModalProps {
    url: string
    userId: string
    keyProp: string
    title: string
    isModalOpen: boolean
    selectedData?: any
    fetchData(args?: IArguments): void
    handleCancel: () => void
}

function PagibigUpdateModal({ title, url, userId, keyProp, selectedData, isModalOpen, fetchData, handleCancel }: PagibigUpdateModalProps) {
    const [form] = useForm<any>()
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = useMessage()

    useEffect(() => {
        form.setFieldsValue({
            ...selectedData,
            [keyProp]: selectedData?.[keyProp],
            // file: selectedData?.file_name ?? []
        })
    }, [keyProp, selectedData, isModalOpen])

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    }

    function onFinish(values: any) {
        setLoading(true)
        const formData = new FormData()
        if (selectedData?.id) formData.append('_method', 'PUT')
        formData.append('user_id', userId)
        formData.append(keyProp, values[keyProp])
        formData.append('file', values.file[0]?.originFileObj)
        axiosClient.post(url + userId, formData)
            .then(() => {
                form.resetFields()
                handleCancel()
            })
            .catch((err) => {
                // TODO: HANDLE ERROR
                messageApi.open({
                    type: 'error',
                    content: err?.response?.data?.message,
                    duration: 5
                })
            })
            .finally(() => {
                fetchData()
                setLoading(false)
            })
    }

    return <Modal title={`${title} - ${selectedData != undefined ? 'Update' : 'Add'}`} open={isModalOpen} onCancel={handleCancel} footer={null} forceRender>
        {contextHolder}
        <Form form={form} onFinish={onFinish} disabled={loading}>
            <FormItem
                label={title + ' Number'}
                name={keyProp}
                required
                rules={[{ required: true, message: '' }]}
            >
                <Input type='number' placeholder='Enter pagibig number...' />
            </FormItem>
            <FormItem label="File">
                <FormItem name="file" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                    <Upload.Dragger name="files" beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                </FormItem>
            </FormItem>
            <FormItem style={{ textAlign: 'right' }}>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                        {selectedData != undefined ? 'Update' : 'Add'} {title}
                    </Button>
                    <Button type="primary" onClick={handleCancel} loading={loading} disabled={loading}>
                        Cancel
                    </Button>
                </Space>
            </FormItem>
        </Form>
    </Modal>
}