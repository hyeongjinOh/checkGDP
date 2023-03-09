import { atom, DefaultValue, selector } from "recoil";
import * as CONST from "../utils/Const"
/*
export interface ITodoTypes {
  id: number;
  contents: string;
  isCompleted: boolean;
}
*/
// TodoInput에서 입력하는 값을 atom으로 관리하는 방식
export const langState = atom<string>({
  key: 'langState',
  // key의 값은 항상 고유값이어야 합니다.
  default: CONST.STR_LANG_KOR,
});

export const getApiLangState = selector({
  key: 'getApiLangState',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const langs = get(langState);
    return (
      (langs===CONST.STR_LANG_KOR)
      ? CONST.STR_APILANG_KOR
      : (langs===CONST.STR_LANG_ENG) 
        ? CONST.STR_APILANG_ENG
        : (langs===CONST.STR_LANG_CHA)
          ? CONST.STR_APILANG_CHA
          : CONST.STR_APILANG_KOR
    );
  },
});


/*
// 업데이트 시킬 Todos atom 배열
export const todosState = atom<ITodoTypes[]>({
  key: 'todos',
  
  // default에는 임의의 데이터를 넣어줍시다.
  default: [
    {
      id: 1,
      contents: 'Todo List를',
      isCompleted: false,
    },

    {
      id: 2,
      contents: '자유롭게',
      isCompleted: false,
    },

    {
      id: 3,
      contents: '추가해보세요!',
      isCompleted: false,
    }
  ],
});
*/