/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP Status 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue } from "recoil";
import { userInfoState, authState, } from '../../../recoil/userState';
//utils
import clog from "../../../utils/logUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
//
import $ from "jquery";
import { cp } from "fs/promises";
//
import { useTrans } from "../../../utils/langs/useTrans";

/**
 * @brief EHP Status 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function StatusTest(props) {
  const selectedSpg = props.selectedSpg;
  const userInfo = useRecoilValue(userInfoState);
  const [spgInfo, setSpgInfo] = useState({ "basic": 0, "premium": 0, "advanced": 0, "normal": 0, "totalCount": 0, "period": 0 });

  // const t = useTrans();

  let currentSpg: any = selectedSpg;
  const { data: data, error, isLoading, reload, run } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: "/api/v2/item/status", //?companyId=1&zoneId=1공장&roomId=1공장:전기실1&spgId="+{curSpgId},
    appQuery: {
      // companyId: currentSpg.company.companyId, 
      // zoneId: currentSpg.zone.zoneId,
      // roomId: currentSpg.room.roomId,
      // spgId: currentSpg.spg.spgId

      companyId: 1,
      zoneId: "1공장",
      roomId: "1공장:전기실1",
      spgId: 4
    },
    //userToken: userInfo.userInfo.token,
    //watch: curCompId + curZoneId + curRoomId + curSpgId,
    // watch: currentSpg.company.companyId+currentSpg.zone.zoneId+currentSpg.room.roomId+currentSpg.spg.spgId,
  });

  useEffect(() => {
    if (data) {
      if (data.codeNum == 200) {
        //clog("IN MAIN : TREE LIST : " + JSON.stringify(data.body));
        setSpgInfo(data.body);
      }
    }
  }, [data]);

  // if (isLoading) return <div>로딩중..</div>;
  // if (error) { // 에러가 안잡힌다.
  //   { clog("IN TREE : ERR : " + error.name) }
  //   { clog("IN TREE : ERR : " + error.stack) }
  //   { clog("IN TREE : ERR : " + JSON.stringify(error)) }
  // }

  //설정 토글 액션
  function setttingToggle(e) {
    // 클래스 변수
    var settingBtn = (e.target.className == "btn btn-setting toggle") ? e.currentTarget : e.target
    $(settingBtn).parent().parent().next().children(".box__setting").toggle();
    $(settingBtn).parent().parent().parent(".box").toggleClass("on");
    $(".box__setting .close").on("click", function () {
      $(".btn-setting.toggle").click();
    });

  }

  //selet  Action
  function select(e) {
    // select active 액션
    const selectBoxElements = document.querySelectorAll(".select");
    function toggleSelectBox(selectBox) {
      selectBox.classList.toggle("active");
    }
    // option 선택 시  값 변경 액션
    function selectOption(optionElement) {
      const selectBox = optionElement.closest(".select");
      //option 값 selected-value 로 변경
      const selectedElement = selectBox.querySelector(".selected-value ");
      selectedElement.textContent = optionElement.textContent;
    }
    // 펼쳐졌을 시 otption 값
    selectBoxElements.forEach((selectBoxElement) => {
      const targetElement = e.target;
      const isOptionElement = selectBoxElement.classList.contains("option");
      if (isOptionElement.valueOf) {
        selectOption(targetElement);
      }
      toggleSelectBox(selectBoxElement);
    });
    //select active remove 옵션
    const targetElement = e.target;
    const isSelect = targetElement.classList.contains("select") || targetElement.closest(".select");
    if (isSelect) {
      return;
    }
    const allSelectBoxElements = document.querySelectorAll(".select");
    allSelectBoxElements.forEach((boxElement) => {
      boxElement.classList.remove("active");
    });
  }
  /*
    if ( isLoading ) return <div>로딩중..</div>;
    if ( !data ) return <div>로딩중..</div>;
    if ( data&&(data.condeNum !== 200) ) return <div>로딩중..</div>;
  */
  return (
    <>
      <div className="box__header">
        <p className="box__title">e-HC Status </p>
        <div className="box__etc">
          {/* <!--220524 추가, toggle클래스--> */}
          <button type="button" data-testid="setting" className="btn btn-setting toggle" onClick={(e) => setttingToggle(e)}><span className="hide">점검주기 설정</span></button>
        </div>
      </div>
      <div className="box__body" >
        <div className="box__status">
          <ul className="status__info">
            <li>
              <p>전기실1 / VCB</p>
              {/* <p>{currentSpg.room.roomName} / {currentSpg.spg.spgName}</p> */}
              <p><strong>4</strong><span>개</span></p>
              {/* <p><strong>{spgInfo.totalCount}</strong><span>{t("MAIN_STATUS.개")}</span></p> */}
            </li>
            <li>
              <p>점검주기</p>
              <p><strong>180</strong><span>일</span></p>
              {/* <p><strong>{spgInfo.period}</strong><span>일</span></p> */}
            </li>
          </ul>
          <ul className="status__data">
            <li>
              <a href="#" data-testid="basic" >
                <p className="name">Basic</p>
                {/* <p className="txt" >{spgInfo.basic}</p> */}
                <p className="txt" >3</p>

              </a>
            </li>
            <li>
              <a href="#" data-testid="advanced">
                <p className="name">Advanced</p>
                {/* <p className="txt" >{spgInfo.advanced}</p> */}
                <p className="txt" >0</p>

              </a>
            </li>
            <li>
              <a href="#" data-testid="premium">
                <p className="name" >Premium</p>
                {/* <p className="txt" >{spgInfo.premium}</p> */}
                <p className="txt" >1</p>
              </a>
            </li>
            <li>
              <a href="#" data-testid="noraml">
                <p className="name">Normal</p>
                {/* <p className="txt">{spgInfo.normal}</p> */}
                <p className="txt">0</p>

              </a>
            </li>
          </ul>
        </div>
        {/* <!--220524 추가, 토글버튼 클릭시 오픈--> */}
        <div className="box__setting">
          <ul className="form__input">
            <li>
              <label htmlFor="checkcycle">점검주기</label>
              <div className="input__area">
                <div className="select" onClick={select} data-testid="select" >
                  {/* <!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. --> */}
                  <div className="selected">
                    <div className="selected-value" data-testid="selected-value"><span >180 일</span></div>
                    <div className="arrow"></div>
                  </div>
                  <ul>
                    <li className="option">365 일</li>
                    <li className="option">180 일</li>
                    <li className="option">90 일</li>
                    <li className="option">30 일</li>
                  </ul>
                </div>
                <p className="input-errortxt">필수 입력 항목입니다.</p>
              </div>
            </li>
          </ul>
          <div className="popup__footer">
            {/* <!--220523, 모바일에서 버튼 하나로 갈경우 클래스에 w100p 추가해주세요--> */}
            <button type="button" data-testid="close" className="close bg-gray" onClick={(e) => setttingToggle(e)} ><span>취소</span></button>
            <button type="button" data-testid="apply" ><span>적용</span></button>
          </div>
        </div>
      </div>
    </>
  )
}



export default StatusTest;