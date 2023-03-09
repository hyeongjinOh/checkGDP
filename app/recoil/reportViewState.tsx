import { atom, selector, DefaultValue } from "recoil";
import * as CONST from "../utils/Const"
import * as CUTIL from "../utils/commUtils"
import clog from "../utils/logUtils";
import { userInfo } from "os";

// isAuthentication
// Authentication : 인증
// Authorization : 권한부여
/*
export const userIdState = atom<string>({
  key: 'userIdState',
  // key의 값은 항상 고유값이어야 합니다.
  default: "",
});
*/
//useRecoilState — atom의 값을 구독하여 업데이트할 수 있는 hook. useState와 동일한 방식으로 사용할 수 있다.
//useRecoilValue — setter 함수 없이 atom의 값을 반환만 한다.
//useSetRecoilState — setter 함수만 반환한다.

//export interface userType {
export interface itemReportType {  
  itemReportId : string;
}

// 다른 컴포넌트의 체크 여부 관리
export const itemReportListState = atom<itemReportType[]>({
  key: 'itemReportListState',
  // key의 값은 항상 고유값이어야 합니다.
  default: [],
});