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
import { useRecoilValue, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import { useNavigate } from "react-router-dom";

/**
 * @brief EHP 사용자 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

export default function UserTree(props) {
  // recoil
  const userInfo = useRecoilValue(userInfoLoginState);
    //화면 이동
    const navigate = useNavigate();
  //props
  const setParentPopWin = props.setPopWin;
  const selTree = props.selTree;
  const setSelTree = props.setSelTree;

  const [companyDto, setCompanyDto] = useState([]);

  const { data: data, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/user/companies`,//${appPath}`
    appQuery: {},
    userToken: userInfo.loginInfo.token,
    watch:  selTree.reload
  });

  useEffect(() => {
       // error page 이동
      const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);
    
      if (ERR_URL.length > 0) navigate(ERR_URL);
     
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setCompanyDto(data.body);

      }
    }
  }, [data]);

  function onclickCompany(item) {
    setSelTree({
      company: { companyId: item, companyName: item },
      reload: true
    });
  }
  const treeItem = (companyDto == null) ? null : companyDto

  return (
    <>
      {/*<!--//왼쪽 영역-->*/}
      <div className="area__left">
        <div className="lnb__top">
          <p className="tit">*사용자 소속 기준</p>
        </div>
        {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
        {treeItem.map((tree, idx) => (
          <div key={"companyTree_" + idx} className="lnb" onClick={(e) => onclickCompany(tree.companyName)}>
            <ul className="lnb-depth1">
              <li className={(tree.companyName == selTree.company.companyId) ? "active" : ""}>
                <p>
                  <a >
                    <span>{tree.companyName}</span>
                  </a>
                </p>
              </li>
            </ul>
          </div>
        ))}

        {/*<!--//왼쪽 회사 관리 메뉴 영역-->*/}
      </div>
      {/*<!--//왼쪽 영역-->*/}
    </>
  );
}

