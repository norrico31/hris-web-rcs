import { ReactNode } from 'react'
import { Form as AntDForm, FormInstance } from 'antd'
import { Store } from 'antd/es/form/interface'

type Props<T> = {
    form: FormInstance<T>;
    disabled?: boolean
    children: ReactNode
    onFinish: (val: T) => void
    initialValues?: Store
}

export default function Form<V>({ form, disabled, onFinish, initialValues, children }: Props<V>) {
    return (
        <AntDForm
            form={form as any}
            onFinish={onFinish}
            autoComplete="off"
            requiredMark='optional'
            layout='vertical'
            initialValues={initialValues}
            disabled={disabled}
        >
            {children}
        </AntDForm>
    )
}