export interface ApiResult<T extends { [key: string]: unknown; } = { [key: string]: unknown; }> {
    code: string;
    data?: T;
}