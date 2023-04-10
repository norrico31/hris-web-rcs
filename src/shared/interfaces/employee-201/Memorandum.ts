import { IUser, AxiosGetData } from ".."

export interface IMemorandum extends IUser {
    id: string;
    name: string;
    description: string;
}

export type MemorandumRes = AxiosGetData<IMemorandum>