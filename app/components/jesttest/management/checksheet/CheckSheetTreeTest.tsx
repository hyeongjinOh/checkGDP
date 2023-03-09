/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState } from "../../../../recoil/menuState";

//utils
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"


function CheckSheetTree(props) {
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

    const [spgList, setSpgList] = useState([]);

    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/spgs`,
        appQuery: {},
        //userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        //watch: adminType + selTree.reload
    });

    function onClickGoMenu(e, spg) {
        e.stopPropagation();
        setParentSelTree(`SPG-${spg.spgName}`, {
            spg: { "spgId": spg.spgId, "spgName": spg.spgName, },
        })
        setParentWorkMode("LIST");
    }

    clog("IN TREE : INIT : adminType : " + adminType + " : workMode : " + workMode);


    return (
        <>
            {/*<!--왼쪽 영역-->*/}
            <div className="area__left">
                {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
                <div className="lnb">
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a>
                                    <span>배전반</span>
                                </a>
                            </p>
                        </li>
                        <li className={"active"}>
                            <p>
                                <a>
                                    <span>유입식TR</span>
                                </a>
                            </p>
                        </li>
                        <li className={"active"}>
                            <p>
                                <a>
                                    <span>ACB</span>
                                </a>
                            </p>
                        </li>
                        <li className={"active"}>
                            <p>
                                <a>
                                    <span>GIS</span>
                                </a>
                            </p>
                        </li>
                        <li className={"active"}>
                            <p>
                                <a>
                                    <span>MoldTR</span>
                                </a>
                            </p>
                        </li>
                        <li className={"active"}>
                            <p>
                                <a>
                                    <span>VCB</span>
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
                {/*<!--//왼쪽 회사 관리 메뉴 영역-->*/}
            </div>
            {/*<!--//왼쪽 영역-->*/}
        </>
    )
};
export default CheckSheetTree;

