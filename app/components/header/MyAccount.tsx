
/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-08-25
 * @brief My Account 컴포넌트
 * 
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
//
import { userInfoState, userInfoLoginState } from "../../recoil/userState";
import { curSpgTreeState, itemState } from "../../recoil/assessmentState";

//
import * as CUTIL from "../../utils/commUtils"
import * as CONST from "../../utils/Const"
import * as HttpUtil from "../../utils/api/HttpUtil";
import clog from "../../utils/logUtils";
import UserWithdrawal from "./UserWithdrawal";
import { useAsync } from "react-async";
/**
 * @brief My Account 컴포넌트
 * @param 
 * @returns react components
 */


export default function MyAccount(props) {
    // recoli
    const userInfo = props.userInfo
    //
    const [display, setDisplay] = useState(false);
    const [password, setPassword] = useState("");
    // 새비밀번호
    const [passwordNew, setPasswordNew] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [phoneNumber, setPhoneNumber] = useState("");
    const [zoneName, setZoneName] = useState("");
    const [department, setDepartment] = useState("");

    const [classificationItem, setclassificationItem] = useState([]);
    const [classificationCode, setClassificationCode] = useState("");
    /*  const [isAgreeMailReceipt, setIsAgreeMailReceipt] = useState(false);
     const strAgreeMailReceipt = (isAgreeMailReceipt) ? "true" : "false"; */


    const [resErrorCode, setResErrorCode] = useState(200);
    const [resErrorMsg, setResErrorMsg] = useState([{ field: "", msg: "" }]);
    const [errorList, setErrorList] = useState([]);
    const [errorListNew, setErrorListNew] = useState([]);

    const [resPasswordMsg, setResPasswordMsg] = useState("");
    // 새비밀번호
    const [resPassworNewdMsg, setResPasswordNewMsg] = useState("");
    const [resConfirmPasswordMsg, setResConfirmPasswordMsg] = useState("");
    
    // 업종구분
    const { data: data } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/user/classification`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,

    });
    useEffect(() => {
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setclassificationItem(data.body)
            } else { // api if need error handle
                setErrorList(data.errorList);
            }
        }
    }, [data]);
    //
    function displayChang(e) {
        var btnComment = document.getElementById("pop-myaccount-pass");
        if (display === false) {
            setDisplay(true);

        } else {
            setDisplay(false);
            if (!CUTIL.isnull(btnComment)) btnComment.setAttribute("style", "")
            setPassword("");
            setPasswordNew("");
            setConfirmPassword("");
            setResPasswordNewMsg("");
            setResPasswordMsg("");
            setResConfirmPasswordMsg("");
        }
    }

    useEffect(() => {
        setClassificationCode(userInfo.classificationCode);
        setPhoneNumber(userInfo.phoneNumber);
        setZoneName(userInfo.zoneName);
        setDepartment(userInfo.department);
        // setIsAgreeMailReceipt(userInfo.agreeMailReceipt);
    }, [userInfo]);

    async function onClickSave(e) {
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            httpMethod: "PUT",
            appPath: "/api/v2/user",
            appQuery: {
                userId: userInfo.userId,
                userName: userInfo.userName,
                phoneNumber: phoneNumber,
                // companyName: companyName,
                zoneName: zoneName,
                // email: userInfo.email,
                department: department,
                classificationCode: classificationCode, // 20221031 업종 추가
                // agreeMailReceipt: strAgreeMailReceipt
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                var btnCommentClose = document.getElementById("pop-myaccount");
                var body = document.body;
                var dimm = document.querySelector(".dimm");
                if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
                if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
                if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;")
                alert("정보가 변경되었습니다.");
            } else {

                setResErrorCode(data.codeNum);
                setResErrorMsg(data.errorList);
                setErrorList(data.errorList);

            }
        }
    }
    function handleSetPhoneNumber(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "phoneNumber"))
        )
        setPhoneNumber(e.target.value);
    }
    function handleSetZoneName(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "zoneName"))
        )
        setZoneName(e.target.value);
    }
    /*   function handlesetIsAgreeMailReceipt(val) {
  
          setIsAgreeMailReceipt(val);
      } */
    function handleSetPassword(val) {
        setErrorList(
            errorList.filter((err) => (err.field !== "password"))
        )
        setPassword(val);
    }
    //password 확인
    function OnChangepasswordNew(e) {
        setErrorListNew(
            errorListNew.filter((err) => (err.field !== "password"))
        )
        setPasswordNew(e.target.value);
    }

    function OnChangeConfirmPasswordNew(e) {
        setErrorListNew(
            errorListNew.filter((err) => (err.field !== "confirmPassword"))
        )
        setConfirmPassword(e.target.value);
    }


    async function onClickValid(e) {
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/auth/password/valid`,
            appQuery: {
                password: password
            },
            userToken: userInfo.loginInfo.token,
        });


        if (data) {
            if (data.codeNum == CONST.API_200) {
                setResPasswordMsg(data.data.msg)
                // 신규 비밀번호 체크
                passWordChang(e, data.body.token);
            } else {
                setResErrorCode(data.codeNum);
                setResErrorMsg(data.errorList);
                setErrorList(data.errorList);

            }
        }
    }

    async function passWordChang(e, token) {
        let data: any = null;
        if ((passwordNew == confirmPassword)) {
            data = await HttpUtil.PromiseHttp({
                httpMethod: "PUT",
                appPath: `/api/v2/auth/password/change`,
                appQuery: {
                    "password": passwordNew,
                    "token": token
                },
                userToken: userInfo.loginInfo.token,
            });
            if (data) {
                if (data.codeNum == CONST.API_200) {
                    alert("비밀번호가 변경 되었습니다. ")
                    displayChang(e)
                } else {
                    setResErrorCode(data.codeNum);
                    setResErrorMsg(data.errorList);
                    if (passwordNew == '') {
                        setErrorListNew(data.errorList);
                    } else {
                        setErrorListNew([
                            { field: "password", msg: data.errorList[0].msg },
                            { field: "confirmPassword", msg: data.errorList[0].msg },
                        ]);

                    }

                }
            }
        } else {
            setErrorListNew([
                { field: "password", msg: "비밀번호가 일치하지 않습니다." },
                { field: "confirmPassword", msg: "비밀번호가 일치하지 않습니다." },
            ])
        }
    }


    function closePop(e) {
        var btnCommentClose = document.getElementById("pop-myaccount");
        var body = document.body;
        var dimm = document.querySelector(".dimm");
        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;")
    }

    async function classificationCodeSel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = [];
        data = await HttpUtil.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/user/classification`,
            appQuery: {},
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setclassificationItem(data.body)
            } else { // api if need error handle
                setErrorList(data.errorList);

            }
        }

    }

    function handleSetclassIficationCode(code) {
        setErrorList(
            errorList.filter((err) => (err.field !== "classificationId"))
        )
        setClassificationCode(code);
    }

    return (
        <>
            {/* <!--220824, My Account 팝업 --> */}
            <div id="pop-myaccount" className="popup-layer js-layer layer-out hidden popup-basic myaccount">
                {(!display) ?
                    <div className="popup__head">
                        <h1>My Account</h1>
                        <button className="btn btn-close js-close" onClick={(e) => closePop(e)}><span className="hide">닫기</span></button>
                    </div>
                    :
                    // 비밀번호 수정 화면
                    <div className="popup__head">
                        <h1>비밀번호 변경</h1>
                        <button className="btn btn-close js-close" onClick={(e) => displayChang(e)}><span className="hide">닫기</span></button>
                    </div>

                }
                {(!display) ?
                    <div className="popup__body">
                        <form action="" method="" name="popmyaccount">
                            <ul className="form__input mt-9">
                                <li>
                                    <label htmlFor="userId2">사용자 타입</label>
                                    <div className="input__area">
                                        <div className="radioBox">
                                            <label htmlFor="rd1"><input type="radio" id="rd1" name="rd" disabled checked={(userInfo.role == "ROLE_ADMIN") ? true : false} />Admin</label>
                                            <label htmlFor="rd2"><input type="radio" id="rd2" name="rd" disabled checked={(userInfo.role == "ROLE_ENGINEER") ? true : false} />Engineer</label>
                                            <label htmlFor="rd3"><input type="radio" id="rd3" name="rd" disabled checked={(userInfo.role == "ROLE_USER") ? true : false} />User</label>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userId2">E-mail (아이디)</label>
                                    <div className="input__area">
                                        <input type="text" id="userId2" disabled value={userInfo.email} />
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userpw">비밀번호</label>
                                    <div className="input__area">
                                        <button type="button" className="btn btn-txt js-open" data-pop="pop-myaccount-pass" onClick={(e) => displayChang(e)}><span>비밀번호 변경</span></button>
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="username3">이름</label>
                                    <div className="input__area">
                                        <input type="text" id="username3" disabled value={userInfo.userName} />
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userphone2" className="star">연락처</label>
                                    <div className="input__area">
                                        <input type="tel" id="userphone2" name="phone" placeholder="숫자만 입력하세요"
                                            value={phoneNumber} onChange={(e) => handleSetPhoneNumber(e)}
                                            className={(errorList.filter(err => (err.field === "phoneNumber")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <!--telOnly="true" 숫자만 입력할때--> */}
                                        <p className="input-errortxt">{errorList.filter(err => (err.field === "phoneNumber")).map((err) => err.msg)}</p>
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userId3">회사</label>
                                    <div className="input__area">
                                        <input type="text" id="userId3" disabled value={userInfo.companyName} />
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userId4" className="star">사업장</label>
                                    <div className="input__area">
                                        <input type="text" id="userId4" name="zone" placeholder="사업장을 입력하세요"
                                            value={zoneName} onChange={(e) => handleSetZoneName(e)}
                                            className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
                                        />
                                        <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="part">부서</label>
                                    <div className="input__area">
                                        <input type="text" id="part" value={department} onChange={(e) => setDepartment(e.target.value)} />
                                    </div>
                                </li>
                                {/* <!--221028 업종 추가, 수신동의 삭제--> */}

                                <li>
                                    <label htmlFor="part" className="star">업종</label>
                                    <div className="input__area">
                                        <div className={`select ${(errorList.filter(err => (err.field === "classificationId")).length > 0) ? "input-error" : ""}`}
                                            onClick={(e) => classificationCodeSel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">{userInfo.classification}</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {classificationItem.map((list, idx) => (
                                                    <li key={"class_" + idx.toString()} className="option" onClick={(e) => handleSetclassIficationCode(list.code)}>{list.classification}</li>
                                                ))}

                                            </ul>
                                        </div>
                                        <p className="input-errortxt">{errorList.filter(err => (err.field === "classificationId")).map((err) => err.msg)}</p>
                                    </div>
                                </li>
                                {/* <li>
                                    <ul className="checkBox column mt-8">
                                        <li>
                                            <input type="checkbox" id="agree4" name="joinagree"
                                                checked={isAgreeMailReceipt} onChange={(e) => handlesetIsAgreeMailReceipt(!isAgreeMailReceipt)}
                                            />
                                            <label htmlFor="agree4"
                                            >(선택) 메일 수신 동의
                                                <p className="txt-lightgray fontRegular mt-3">수신 동의 시 LS ELECTRIC 뉴스레터를 메일로 보내드립니다.</p></label                  >
                                        </li>
                                    </ul>
                                </li> */}
                            </ul>
                        </form>
                    </div>
                    :
                    // 비밀번호 수정화면
                    <div className="popup__body">
                        <form action="" method="" name="popmyaccount">
                            <ul className="form__input mt-9">
                                <li>
                                    <label htmlFor="userPw1">현재 비밀번호</label>
                                    <div className="input__area">
                                        <input type="password" id="userPw1" value={password} onChange={(e) => handleSetPassword(e.target.value)}
                                            className={(errorList.filter(err => (err.field === "password")).length > 0) ? "input-error" : (resPasswordMsg == "success") ? "input-ok" : ""} />
                                        <p className="input-errortxt">{errorList.filter(err => (err.field === "password")).map((err) => err.msg)}</p>
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userPw2">새 비밀번호</label>
                                    <div className="input__area">
                                        <input type="password" id="userPw2" value={passwordNew} placeholder="10~16자 텍스트, 영문/숫자를 포함하여 입력하세요."
                                            onChange={(e) => OnChangepasswordNew(e)}
                                            className={(errorListNew.filter(err => (err.field === "password")).length > 0) ? "input-error" : ""} />


                                        <p className="input-errortxt">{errorListNew.filter(err => (err.field === "password")).map((err) => err.msg)}</p>
                                    </div>
                                </li>
                                <li>
                                    <label htmlFor="userPw3">새 비밀번호 확인</label>
                                    <div className="input__area">
                                        {(!passwordNew) &&
                                            <input type="text" disabled readOnly />
                                        }
                                        {(passwordNew) &&
                                            <input type="password" id="userPw3" value={confirmPassword} placeholder="10~16자 텍스트, 영문/숫자를 포함하여 입력하세요."
                                                onChange={(e) => OnChangeConfirmPasswordNew(e)}
                                                className={(errorListNew.filter(err => (err.field === "confirmPassword")).length > 0) ? "input-error" : ""}
                                            />
                                        }
                                        <p className="input-errortxt">{errorListNew.filter(err => (err.field === "confirmPassword")).map((err) => err.msg)}</p>

                                    </div>
                                </li>
                            </ul>
                        </form>
                    </div>
                }
                {(!display) ?
                    <div className="popup__footer ">{/*left class 제거 - by 20221031 hjo */}
                        <button type="button" className="bg-linegray js-open" data-pop="pop-withdrawal" onClick={(e) => CUTIL.jsopen_Popup(e)}><span data-pop="pop-withdrawal">탈퇴하기</span></button>
                        <button type="button" onClick={(e) => onClickSave(e)}><span>저장</span></button>
                    </div>
                    :
                    <div className="popup__footer">
                        <button type="button" className="bg-gray js-close" onClick={(e) => displayChang(e)}><span>취소</span></button>
                        <button type="button" onClick={(e) => onClickValid(e)}><span>저장</span></button>
                    </div>
                }
            </div>
            {/* <!--//220824, My Account 팝업 --> */}
            {/* <!-- 회원탈퇴 팝업 --> */}
            {/* <div id="pop-withdrawal" className="popup-layer js-layer layer-out hidden popup-basic popup-withdrawal">
                <div className="page-detail">
                    <div className="popup__head">
                        <h1>사용자 탈퇴</h1>
                        <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                    </div>
                    <div className="popup__body">
                        <p>회원 탈퇴를 하시겠습니까?<br />가입 시 등록된 모든 정보가 삭제됩니다.</p>
                    </div>
                    <div className="popup__footer">
                        <button type="button" className="bg-gray btn btn-close js-close"><span>취소</span></button>
                        <button type="button" className=" js-open" data-pop="pop-withdrawalcomplete" onClick={(e) => CUTIL.jsopen_Popup(e)}><span className="btn btn-txt js-open">확인</span></button>
                    </div>
                </div>
            </div> */}
            {/* <!-- //회원탈퇴 팝업 --> */}
            <UserWithdrawal userId={userInfo.userId} />
        </>
    )
}

