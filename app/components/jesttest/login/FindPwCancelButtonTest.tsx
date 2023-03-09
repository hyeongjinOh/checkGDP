
import React, { useState, useEffect } from "react";
import { useAsync } from "react-async";
// design
import styled from "styled-components";
import $ from "jquery"
import "/static/css/login.css"
// recoil
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as i18n from '../../../utils/langs/i18nUtils';
import clog from "../../../utils/logUtils"

function FindPw(props) {
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

  function onClickCancelPw(e) {
    setResErrorCode(200);
    setIsFindPw(false);
    setUserId("");
    setUserName("");
    setUserPhone("");
    setUserIdMsg("");
    setUserNameMsg("");
    setPhoneNumberMsg("");
  }

  return (
    <>
      {/*<!-- 비밀번호 찾기 팝업 -->*/}
      <div id="findPw" className="popup-layer js-layer layer-out hidden"> {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 -->*/}
        <div className="popup__head">
          <h1>비밀번호 찾기</h1>
          <button className="btn btn-close js-close" onClick={(e) => onClickCancelPw(e)}><span className="hide">닫기</span></button>
        </div>

        <div className="popup__footer">
          <button type="button" className="js-close bg-gray" onClick={(e) => onClickCancelPw(e)}><span>취소</span></button>
        </div>
      </div>
      {/*<!-- //비밀번호 찾기 팝업 -->*/}

    </>
  );
} export default FindPw;




