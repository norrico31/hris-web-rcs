import { ReactNode } from 'react'
import { Form as AntDForm, FormInstance } from 'antd'

type Props<T> = {
    form: FormInstance<T>;
    children: ReactNode
    onFinish: (val: T) => void
}

export default function Form<V>({ form, onFinish, children }: Props<V>) {
    return (
        <AntDForm
            form={form as any}
            onFinish={onFinish}
            autoComplete="off"
            requiredMark='optional'
            layout='vertical'
        >
            {children}
        </AntDForm>
    )
}
