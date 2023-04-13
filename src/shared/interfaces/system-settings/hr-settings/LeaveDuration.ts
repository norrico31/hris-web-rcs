import { AxiosGetData } from "../../utils/Axios";

export interface ILeaveDuration {
    id: string;
    name: string;
    description: string;
}

export type LeaveDurationRes = AxiosGetData<ILeaveDuration>
