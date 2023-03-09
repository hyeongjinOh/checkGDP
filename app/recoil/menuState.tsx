import { atom } from "recoil";

// 햄버거 메뉴 클릭 여부 관리 Recoil
export const menuState = atom<boolean>({
  key: 'menuState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false,
});

export const headerSettingState = atom<boolean>({
  key: 'headerSettingState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false,
});
export const headerAlarmState = atom<boolean>({
  key: 'headerAlarmState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false,
});
export const headerUserInfoState = atom<boolean>({
  key: 'headerUserInfoState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false,
});
export const treeMenuState = atom<boolean>({
  key: 'treeMenuState',
  // key의 값은 항상 고유값이어야 합니다.
  default: true,
});



// 이동할 URL 정보 관리 Recoil
export const urlState = atom<string>({
  key: 'urlState',
  // key의 값은 항상 고유값이어야 합니다.
  default: "",
});

// 전체 Loading 여부 정보 관리 Recoil
export const loadingState = atom<boolean>({
  key: 'loadingState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false,
});

// BOX Loading 여부 정보 관리 Recoil
export const loadingBoxState = atom<boolean>({
  key: 'loadingBoxState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false,
});

//{"menuCode":"MENU7_SUB5","menuName":"서비스 지정점 안내","parentCode":"MENU7","description":"서비스 지정점 안내","url":null}
export interface menuInfoType {  
  menuCode : string,
  menuName : string,
  parentCode : string,
  description : string,
  isExternalUrl : boolean,
  url : string,
}

export const menuInfoState = atom<menuInfoType>({
  key: 'menuInfoState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    menuCode : "",
    menuName : "",
    parentCode : "",
    description : "",
    isExternalUrl : false,
    url : "",
    }
});

export const menuListState = atom<menuInfoType[]>({
  key: 'menuListState',
  // key의 값은 항상 고유값이어야 합니다.
  default: [],
});

// 선택한 tree의 compnay zone info
export interface czoneTreeType {
  company : { companyId: string, companyName: string, },
  zone : { zoneId: string, zoneName: string, },
}

export const czoneInfoState = atom<czoneTreeType>({
  key: 'czoneInfoState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    company : { companyId: "", companyName: "", },
    zone : { zoneId: "", zoneName: "", },
  }
});

