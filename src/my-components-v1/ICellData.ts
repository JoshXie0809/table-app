export interface ICellData {
    readonly type: string,
    payload: {
        value: any,
        label: string,
        [field: string]: any,
    }
}