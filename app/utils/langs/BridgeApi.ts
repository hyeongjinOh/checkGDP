import { INativeInfoResult } from './getNativeInfo'
 
export const getNativeInfo = (): Promise<INativeInfoResult> => {
    const result: INativeInfoResult = {
        result: {
        	// 사용자의 언어 받아오기
            language: window.navigator.language
        }
    }
 
    return new Promise((resolve): void => {
        resolve(result)
    })
}