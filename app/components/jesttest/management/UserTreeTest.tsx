/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-09-22
 * @brief EHP UserManageMent 개발
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
 * @brief EHP UserManageMent 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */


export default function UserTree(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const setParentPopWin = props.setPopWin;
    const selTree = props.selTree;
    const setSelTree = props.setSelTree;

    const [companyDto, setCompanyDto] = useState([]);

    // const { data: data, error, isLoading, reload, run, } = useAsync({
    //     promiseFn: HTTPUTIL.PromiseHttp,
    //     httpMethod: "GET",
    //     appPath: `/api/v2/user/companies`,//${appPath}`
    //     appQuery: {},
    //     //userToken: userInfo.loginInfo.token,
    //     //watch: selTree.reload
    // });

    // useEffect(() => {
    //     /*   // error page 이동
    //       const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);

    //       if (ERR_URL.length > 0) navigate(ERR_URL);
    //      */
    //     if (data) {
    //         if (data.codeNum == CONST.API_200) {
    //             setCompanyDto(data.body);
    //             /*  setSelTree({
    //                company: { companyId: data.body[0], companyName: data.body[0] },
    //                reload: false
    //              }); */
    //         }
    //     }
    // }, [data]);

    function onclickCompany(item) {
        setSelTree({
            company: { companyId: item, companyName: item },
            reload: false
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
                <div className="lnb" >
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a >
                                    <span>마시는오트밀</span>
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
                <div className="lnb" >
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a >
                                    <span>테스트회사</span>
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
                <div className="lnb" >
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a >
                                    <span>LS산전</span>
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
                <div className="lnb" >
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a >
                                    <span>LS전자</span>
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
                {/*<!--//왼쪽 회사 관리 메뉴 영역-->*/}
            </div>
            {/*<!--//왼쪽 영역-->*/}
        </>
    );
}