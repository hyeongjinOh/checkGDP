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




function FindId(props) {
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

        <div className="popup__footer">
          <button type="button" className="js-close bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
        </div>
      </div>
      {/*<!-- //아이디 찾기 팝업 -->*/}
    </>
  );
} export default FindId;

