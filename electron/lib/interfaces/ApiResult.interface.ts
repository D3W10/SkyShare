export interface ApiResult<T> {
    code: string;
    data?: T;
}