import { useTranslation } from 'react-i18next'
 
export function useTrans() {
    const { t } = useTranslation()
 
	// 다국어 처리할 메시지, 공통으로 들어갈 메세지
    return function $(key: string, data?: string[]): string {
        return t(key, Object.assign({}, data))
    }
}