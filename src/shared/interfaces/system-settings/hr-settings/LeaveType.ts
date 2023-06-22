import { AxiosGetData } from "../../utils/Axios";

export interface ILeaveType {
    id: string;
    name: string;
    description: string;
    type: string;
    date_period: number | null
}
export type LeaveTypeRes = AxiosGetData<ILeaveType>
