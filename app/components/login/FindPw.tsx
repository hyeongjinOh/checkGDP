/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-17
 * @brief EHP Login-비밀번호 찾기 레이어 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect } from "react";
import { useAsync } from "react-async";
//
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// recoil
import { getApiLangState } from "../../recoil/langState";
// design
import styled from "styled-components";
import $ from "jquery"
//import "/static/css/login.css"
// recoil
// utils
import { useTrans } from "../../utils/langs/useTrans";
import * as HttpUtil from "../../utils/api/HttpUtil";
import * as i18n from '../../utils/langs/i18nUtils';
import clog from "../../utils/logUtils"

/**
 * @brief EHP 비밀번호 찾기 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function FindPw(props) {
  // recoil
  const apiLang = useRecoilValue(getApiLangState);
  //
  const isRunYn = props.isRunYn;
  const layerList = props.layerList;

  const [isFindPw, setIsFindPw] = useState(isRunYn); // false
  const [userId, setUserId] = useState("barsk@hanmail.net"); //test@test.com
  const [userName, setUserName] = useState("bsKimH"); //bsKim
  const [userPhone, setUserPhone] = useState("01012345678"); //01000000001
  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState([{ "field": "", "msg": "" }]);
  const [resUserIdMsg, setUserIdMsg] = useState(""); //test@test.com
  const [resUserNameMsg, setUserNameMsg] = useState(""); //bsKim
  const [resPhoneNumberMsg, setPhoneNumberMsg] = useState(""); //01000000001

  //20220824 추가
  const [errorList, setErrorList] = useState([]);

  const t = useTrans();
  // useAsync call axios
  const { data: data, error, isLoading, reload, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "PUT",
    appPath: "/api/v2/auth/password/init",
    appQuery: {
      userId: userId,
      userName: userName,
      phoneNumber: userPhone,
      language: apiLang
    },
  });

  if (isLoading) { <>loading ......</> }
  useEffect(() => {
    if (data) {
      if (data.codeNum == 200) {
        setResErrorCode(200);
        setUserIdMsg("아래 메일 주소로 새 비밀번호가 전송 되었으니, 로그인 후 비밀번호를 변경해 주세요.");
        setIsFindPw(true);
        // } else if (data.errorList !== null) {
      } else {
        setResErrorCode(data.codeNum);

        //20220824 추가
        setErrorList(data.errorList)

        setResErrorMsg(data.errorList);
        clog("에러 사유 : " + data.errorList);
        setUserIdMsg("");
        setUserNameMsg("");
        setPhoneNumberMsg("");
        /* data.errorList.map((errMsg) => {
          (errMsg.field === "userId") && setUserIdMsg(errMsg.msg);
          (errMsg.field === "userName") && setUserNameMsg(errMsg.msg);
          (errMsg.field === "phoneNumber") && setPhoneNumberMsg(errMsg.msg);
        }); */
      }
      //////////// 추후 Api 수정 시 else if -> else로 바꾸고 밑에 코드 삭제
      //2022 06 16 수정
      /* else {
        clog("또 에러가 나는가? : " + data.codeNum);
        clog("또 에러가 나는가? : " + data.codeNum);
        setUserIdMsg("모든 항목 필수 입력 입니다.");
        setUserNameMsg("모든 항목 필수 입력 입니다.");
        setPhoneNumberMsg("모든 항목 필수 입력 입니다.");

      } */
      ///////////////////////////////////////
    }
  }, [data]);

  // function layerClose(tagId) {
  //   var othLayer = tagId;
  //   //닫기 버튼 , 배경 클릭 시
  //   $("#" + othLayer)
  //     .children()
  //     .children(".js-close")
  //     .trigger("click", function (ee) {
  //       $("#" + othLayer).addClass("hidden"); //모든 팝업 감추기
  //       $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
  //     });
  //   //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
  //   $("#" + othLayer + ".layer-out")
  //     .children()
  //     .children(".js-close")
  //     .on("click", function (ee) {
  //       $(".dimm").stop().hide().css("z-index", "11");
  //     });
  // }


  function layerClose(tagId) {
    var othLayer = tagId;
    //닫기 버튼 , 배경 클릭 시
    $("#" + othLayer)
      .children()
      .children(".js-close")
      .trigger("click", function (ee) {
        $("#" + othLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      });
    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + othLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $(".dimm").stop().hide().css("z-index", "11");
      });
  }

  function layerOpen(e) {
    e.preventDefault();
    var actTag = (e.target.tagName == "BUTTON") ? e.target : e.currentTarget;
    var activeLayer = actTag.getAttribute("data-pop");
    //
    layerList.map((olayer) => {
      layerClose(olayer);
    });

    // 레이어 팝업 화면 가운데 정렬
    $("#" + activeLayer + ".popup-layer").css("position", "absolute");
    $("#" + activeLayer + ".popup-layer").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
    $("#" + activeLayer + ".popup-layer").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

    // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
    $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
    $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
    $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)

    //닫기 버튼 , 배경 클릭 시
    $("#" + activeLayer)
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      });

    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + activeLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $(".dimm").stop().hide().css("z-index", "11");
      });

  }

  function onClickCancelPw(e) {
    setResErrorCode(200);
    setIsFindPw(false);
    setUserId("");
    setUserName("");
    setUserPhone("");
    setUserIdMsg("");
    setUserNameMsg("");
    setPhoneNumberMsg("");

    //20220824 추가
    setErrorList([]);


    layerList.map((olayer) => {
      layerClose(olayer);
    });
  }

  function handleSetUserId(val) {
    setErrorList(
      errorList.filter((err) => (err.field !== "userId"))
    )
    setUserId(val);
  }
  function handleSetUserName(val) {
    setErrorList(
      errorList.filter((err) => (err.field !== "userName"))
    )
    setUserName(val);
  }
  function handleSetPhoneNumber(val) {
    setErrorList(
      errorList.filter((err) => (err.field !== "phoneNumber"))
    )
    setUserPhone(val);
  }
  return (
    <>
      {/*<!-- 비밀번호 찾기 팝업 -->*/}
      <div id="findPw" className="popup-layer js-layer layer-out hidden login__popup"> {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 -->*/}
        <div className="popup__head">
          <h1>비밀번호 찾기</h1>
          <button className="btn btn-close js-close" onClick={(e) => onClickCancelPw(e)}><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          {(!isFindPw) &&
            <form action="" method="" name="popfindpw">
              <ul className="form__input">
                <li>
                  <label htmlFor="userId" className="star">아이디</label>
                  <div className="input__area"> {/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건 div className="input__area" 태그로 감쌈... -->*/}
                    <input type="text" id="findUserId" placeholder="ex) abc@company.com"
                      value={userId}
                      //className={(resUserIdMsg.length <= 0) ? "" : "input-error"}
                      className={(errorList.filter(err => (err.field === "userId")).length > 0) ? "input-error" : ""}
                      onChange={(e) => handleSetUserId(e.target.value)}
                    /* onKeyUp={() => onIdKeyUp()} */
                    />  {/*<!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨, 클래스 input-error 넣으면 p태그는 자동으로 노출됨 -->*/}
                    {/* <p className="input-errortxt">{resUserIdMsg}필수 입력 항목입니다.</p> */}
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "userId")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <label htmlFor="username2" className="star">이름</label>
                  <div className="input__area"> {/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건 div className="input__area" 태그로 감쌈... -->*/}
                    <input type="text" id="username2" placeholder="이름을 입력하세요"
                      value={userName}
                      //className={(resUserNameMsg.length <= 0) ? "" : "input-error"}
                      className={(errorList.filter(err => (err.field === "userName")).length > 0) ? "input-error" : ""}
                      onChange={(e) => handleSetUserName(e.target.value)}
                    /* onKeyUp={() => onNameKeyUp()} */
                    />  {/*<!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨, 클래스 input-error 넣으면 p태그는 자동으로 노출됨 -->*/}
                    {/* <p className="input-errortxt">{resUserNameMsg}{필수 입력 항목입니다.}</p> */}
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "userName")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <label htmlFor="userphone1" className="star">연락처</label>
                  <div className="input__area">
                    <input type="tel" id="userphone1" placeholder="숫자만 입력하세요"
                      value={userPhone}
                      //className={(resPhoneNumberMsg.length <= 0) ? "" : "input-error"}
                      className={(errorList.filter(err => (err.field === "phoneNumber")).length > 0) ? "input-error" : ""}
                      onChange={(e) => handleSetPhoneNumber(e.target.value)}
                    /* onKeyUp={() => onPhoneKeyUp()} */
                    />
                    {/*<input type="tel" id="userphone1" telOnly="true" placeholder="숫자만 입력하세요" value="숫자만 입력하세요" className="input-error" />  */}
                    {/* <p className="input-errortxt">{resPhoneNumberMsg}</p> */}
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "phoneNumber")).map((err) => err.msg)}</p>
                  </div>
                </li>
              </ul>
            </form>
          }
          {(isFindPw) &&
            <div className="complete-txt"> {/*<!--비밀번호 찾기 완료일경우 form 대신 노출해주세요 / 완료일경우 하단 버튼 변경됨(확인)-->*/}
              <p className="tit">{resUserIdMsg}{/*아래 메일 주소로 새 비밀번호가 전송 되었으니,
               로그인 후 비밀번호를 변경해 주세요.*/}</p>
              <p>{userId}</p>
            </div>
          }
        </div>
        <div className="popup__footer">
          {(!isFindPw) && <button type="button" className="js-close bg-gray" onClick={(e) => onClickCancelPw(e)}><span>취소</span></button>}
          {(!isFindPw) && <button type="button" onClick={run}><span>찾기</span></button>}
          {(isFindPw) && <button type="button" className="js-close" onClick={(e) => onClickCancelPw(e)}><span>확인</span></button>}
        </div>
      </div>
      {/*<!-- //비밀번호 찾기 팝업 -->*/}
    </>
  );
} export default FindPw;




