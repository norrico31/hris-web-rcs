import { AxiosGetData } from "../../utils/Axios"

export interface IBankDetails {
    id: string;
    name: string;
    bank_branch: string
    description?: string;
}

export type BankDetailsRes = AxiosGetData<IBankDetails>