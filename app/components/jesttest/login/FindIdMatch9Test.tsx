import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAsync } from "react-async";
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
// design
import styled from "styled-components";
import $ from "jquery"
import "/static/css/login.css"
// recoil
import { langState } from '../../../recoil/langState';
import { userInfoState, authState } from '../../../recoil/userState';
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as i18n from '../../../utils/langs/i18nUtils';
import clog from "../../../utils/logUtils"

function FindIdMatch9Test(props) {
  const isRunYn = props.isRunYn;
  const layerList = props.layerList;
  const [isFindId, setIsFindId] = useState(isRunYn); // false
  const [userName, setUserName] = useState(""); //bsKim
  const [userPhone, setUserPhone] = useState(""); //01000000001
  const [userId, setUserId] = useState("");
  const [resErrorCode, setresErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState([{ "field": "", "msg": "" }]);
  const [resUserNameMsg, setUserNameMsg] = useState("");
  const [resPhoneNumberMsg, setPhoneNumberMsg] = useState("");


  // useAsync call axios
  const { data: data, error, isLoading, reload, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: "/api/v2/user/id",
    appQuery: { userName: userName, phoneNumber: userPhone, },
  });

  useEffect(() => {
    if (data) {
      if (data.codeNum == 200) {
        setresErrorCode(data.codeNum);
        setUserNameMsg("아이디 찾기를 완료하였습니다");
        setUserId(data.body.userId);
        setIsFindId(true);
      } else {
        setresErrorCode(data.codeNum);
        setResErrorMsg(data.errorList);
        setUserNameMsg("");
        setPhoneNumberMsg("");
        data.errorList.map((errMsg) => {
          (errMsg.field === "userName") && setUserNameMsg(errMsg.msg);
          (errMsg.field === "phoneNumber") && setPhoneNumberMsg(errMsg.msg);
        });
      }
    }
  }, [data]);

  function onClickCancel(e) {
    setresErrorCode(200);
    setIsFindId(false);
    setUserName("");
    setUserPhone("");
    setUserNameMsg("");
    setPhoneNumberMsg("");
  }

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

  return (
    <>
      {/*<!-- 아이디 찾기 팝업 -->*/}
      <div id="findId" className="popup-layer js-layer layer-out hidden"> {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 -->*/}
        <div className="popup__head">
          <h1>아이디 찾기</h1>
          <button className="btn btn-close js-close" onClick={(e) => onClickCancel(e)}><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          {(!isFindId) &&
            <form action="" method="" name="popfindId">
              <ul className="form__input">
                <li>
                  <label htmlFor="username" className="star">이름</label>
                  <div className="input__area"> {/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건 div className="input__area" 태그로 감쌈... -->*/}
                    <input type="text" id="username" placeholder="이름을 입력하세요"
                      data-testid={"loginName"}
                      value={userName}
                      className={(resUserNameMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <p data-testid="nameerrortxt" className="input-errortxt">{resUserNameMsg}</p>
                    {/*<!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨, 클래스 input-error 넣으면 p태그는 자동으로 노출됨(아이디찾기는 에러문구 연락처 아래 하나만 노출) -->*/}
                  </div>
                </li>
                <li>
                  <label htmlFor="userphone" className="star">연락처</label>
                  <div className="input__area">
                    <input type="tel" id="userphone" placeholder="숫자만 입력하세요"
                      data-testid={"loginPhone"}
                      value={userPhone}
                      className={(resPhoneNumberMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                    <p data-testid="phoneerrortxt" className="input-errortxt">{resPhoneNumberMsg}</p>
                  </div>
                </li>
              </ul>
            </form>
          }
          {(isFindId) &&
            <div className="complete-txt"> {/*<!--아이디 찾기 완료일경우 form 대신 노출해주세요 / 완료일경우 하단 버튼 변경됨(취소,비밀번호 찾기)-->*/}
              <div><p data-testid="foundID" className="tit">{resUserNameMsg}{/*아이디 찾기를 완료하였습니다*/}</p></div>
              <div><p data-testid="foundIDis">{userId}{/*sample123@lselectric.co.kr*/}</p></div>
            </div>
          }
        </div>
        <div className="popup__footer">
          <button type="button" role="cancelbutton" className="js-close bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
          {(!isFindId) && <button data-testid="findbutton1" role="findbutton1" type="button" onClick={run}><span>찾기</span></button>}
          {/*(isFindId)&&<button type="button" ><span>비밀번호 찾기</span></button>*/}
          {(isFindId) && <button role="passbutton" type="button" className="btn btn-txt js-open" data-pop="findPw" onClick={(e) => layerOpen(e)}><span>비밀번호 찾기</span></button>}
        </div>
      </div>
      {/*<!-- //아이디 찾기 팝업 -->*/}
    </>
  );
} export default FindIdMatch9Test;

