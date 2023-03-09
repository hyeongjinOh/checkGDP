/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-09-22
 * @brief EHP 사용자 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import NoUserView from "./NoUserView";
import UserView from "./UserView";
import UserTree from "./UserTree";
//


/**
 * @brief EHP 사용자 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

export default function UserMain(props) {
  // tree 선택 시 이동 
  const [selTree, setSelTree] = useState({
    company: { companyId: "", companyName: "" },
    reload: false
  })

  return (
    <>
      <UserTree
        setPopWin={props.setPopWin}
        selTree={selTree}
        setSelTree={setSelTree}

      />
      {(selTree.company.companyId.length > 0) ?
        < UserView
          setPopWin={props.setPopWin}
          selTree={selTree}
          setSelTree={setSelTree}
        />
        :
        <NoUserView
          setPopWin={props.setPopWin}

        />

      }
    </>
  );
}

