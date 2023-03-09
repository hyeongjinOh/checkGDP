/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */  
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-29
 * @brief userUtils module
  *
********************************************************************/
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
// recoil state
import { userInfoState, userInfoLoginState } from '../../recoil/userState';
//utils
import * as CONST from "../../utils/Const"
import clog from "../../utils/logUtils"
import * as CUTIL from "../../utils/commUtils"
import * as HttpUtil from "../../utils/api/HttpUtil";
 

/**
 * @brief 사용자 상세정보 요청 및 recoil setting 컴포넌트
 * @param 
 * @returns react components
 */
export async function getDetailUserInfoR(loginInfo) {
    let userInfo = {
        loginTime:"", 
        userId:"", 
        email : "",
        userName: "",
        phoneNumber: "",
        companyName: "",
        zoneName: "",
        department: "",
        role : "",
        language : "",
        classificationCode : -1,
        classification : "",
        //socialDtoOut: {},
        agreeMailReceipt: false,
        agreeTos: false,
        agreePersonalInfo: false,
        agreeData: false,
    };
    let data:any = null;
    data = await HttpUtil.PromiseHttp({
        "httpMethod" : "GET", 
        "appPath" : "/api/v2/user", 
        appQuery : {},
        userToken : loginInfo.token,
    });
    if (data) {
        if (data.codeNum === CONST.API_200) {
            clog("IN USERUTIL : USERINFO : " + JSON.stringify(data.body));
            userInfo = {
                loginTime: CUTIL.curTimeString(),
                userId: data.body.userId,
                email : data.body.email,
                userName: data.body.userName,
                phoneNumber: data.body.phoneNumber,
                companyName: data.body.companyName,
                zoneName: data.body.zoneName,
                department: data.body.department,
                role : data.body.role,
                language : data.body.language,
                classificationCode : data.body.classificationCode,
                classification : data.body.classification,
                //socialDtoOut: data.body.socialDtoOut,
                agreeMailReceipt: data.body.agreeMailReceipt,
                agreeTos: data.body.agreeTos,
                agreePersonalInfo: data.body.agreePersonalInfo,
                agreeData: data.body.agreeData,
            };
        }
    }
    return userInfo;
}
