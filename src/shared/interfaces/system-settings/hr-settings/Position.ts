import { AxiosGetData } from "../../utils/Axios";

export interface IPosition {
    id: string;
    name: string;
    description: string;
}

export type PositionRes = AxiosGetData<IPosition>
