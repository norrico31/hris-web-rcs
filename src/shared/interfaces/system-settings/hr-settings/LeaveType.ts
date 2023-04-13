import { AxiosGetData } from "../../utils/Axios";

export interface ILeaveType {
    id: string;
    name: string;
    description: string;
}
export type LeaveTypeRes = AxiosGetData<ILeaveType>
