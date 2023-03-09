export interface INativeInfo {
    language: string
}
 
export const EmptyNativeInfo: INativeInfo = {
    language: '',
}
 
export interface INativeInfoResult {
    result: INativeInfo | null
}