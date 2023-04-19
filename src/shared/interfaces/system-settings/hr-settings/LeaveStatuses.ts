import { AxiosGetData } from "../../utils/Axios";

export interface ILeaveStatuses {
    id: string;
    name: string;
    description: string;
}
export type LeaveStatusesRes = AxiosGetData<ILeaveStatuses>
