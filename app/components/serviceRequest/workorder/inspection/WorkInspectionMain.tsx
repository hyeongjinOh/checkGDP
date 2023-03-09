/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-20
 * @brief EHP WorkOrder - 점검 출동 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";

//utils
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"
import WorkInspectioList from "./WorkInspectioList";
/**
 * @brief EHP WorkOrder - 점검 출동 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
//component

function WorkInspectionMain(props) {
    //props
    const setPopWin = props.setPopWin
    const setNodata = props.setNodata;
    const [adminType, setAdminType] = useState("AUTH"); // AUTH, LANG
    // LIST, CREATE, UPDATE, DELETE, READ, BATCH, SET
    const [workMode, setWorkMode] = useState("READ");
    return (
        <>
            <WorkInspectioList
                nodata={props.nodata}
                setPopWin={setPopWin}
                setNodata={setNodata}
            />
        </>
    )
}

export default WorkInspectionMain;