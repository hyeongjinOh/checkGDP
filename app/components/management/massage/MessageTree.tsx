/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-05
 * @brief EHP 메시지 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"

/**
 * @brief EHP 메시지 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function MessageTree(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  // props
  const isMobile = props.isMobile;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const setParentWorkMode = props.setWorkMode;
  const workMode = props.workMode;
  const tabType = props.tabType;
  const setParentPopWin = props.setPopWin;
  //
  //화면 이동
  const navigate = useNavigate();
  //
  const [menuList, setMenuList] = useState([
    {"menuId":0, "menuName":"e-Health Checker 메세지", "adminType":"CHECK"},
    {"menuId":1, "menuName":"에러 메세지", "adminType":"ERROR"},
    {"menuId":2, "menuName":"HTTP 메세지", "adminType":"HTTP"},
    {"menuId":3, "menuName":"알람 메세지", "adminType":"ALARM"},
  ]);

  useEffect(()=>{
    // tree 초기화 - 선택
    setParentSelTree(menuList[0].adminType, {
      menu: { "menuId": menuList[0].menuId, "menuName": menuList[0].menuName, },
    })
  }, [])

  function onClickGoMenu(e, menu) {
    e.stopPropagation();
    setParentPopWin("pop-message-add", null);
    setParentPopWin("pop-message", null);
    setParentPopWin("pop-delete", null);
    setParentPopWin("pop-message-edit", null);

    setParentSelTree(menu.adminType, {
      menu: { "menuId": menu.menuId, "menuName": menu.menuName, },
    })

    setParentWorkMode("LIST");
  }

  return (
  <>
  {/*<!--왼쪽 영역-->*/}
  <div className="area__left">
    {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
    <div className="lnb">
      <ul className="lnb-depth1">
        {menuList.map((menu, idx)=>(
        <li key={`menu_${idx.toString()}`}
          className={(menu.menuId===selTree.menu.menuId)?"active":""}
        >
          <p>
            <a onClick={(e)=>onClickGoMenu(e, menu)}>
              <span>{menu.menuName}</span>
            </a>
          </p>
        </li>
        ))
        }
      </ul>
    </div>
    {/*<!--//왼쪽 회사 관리 메뉴 영역-->*/}
  </div>
  {/*<!--//왼쪽 영역-->*/}
  </>
  )
};
export default MessageTree;

