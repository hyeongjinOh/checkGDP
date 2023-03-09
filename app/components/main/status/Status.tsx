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
import React, { useEffect, useState, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState,  } from '../../../recoil/userState';
import { 
  curEhcTypeState,
  nextEhcTypeState,
  beforeEhcTypeState,
  itemState, 
  itemSelectState,
  beforeItemState,
  nextItemState,
  tempCheckValue,
  getTempSave,
  curCheckValueDto,
  doneAssessmentState
 } from '../../../recoil/assessmentState';
 
 
 //utils
 import clog from "../../../utils/logUtils";
 import * as CONST from "../../../utils/Const";
 import * as HTTPUTIL from "../../../utils/api/HttpUtil";
 import * as CUTIL from "../../../utils/commUtils";
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
function Status(props) {
  //trans, navigate, ref
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [curEhcType, setRecoilCurEhcType] = useRecoilState(curEhcTypeState);
  const nextEhcType = useRecoilValue(nextEhcTypeState);
  const curItem = useRecoilValue(itemState);  
  const resetRecoilCurItem = useResetRecoilState(itemState);  
  const tempCheckVal = useRecoilValue(tempCheckValue);  
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  const isTempSave = useRecoilValue(getTempSave); 
  //
  //props
  const {company, zone, subZone, room, spg} = props.curTreeData;
  const setParentEhcType = props.setEhcType;
  const statusReload = props.statusReload;
  const setParentStatusReload = props.setStatusReload;

   const [spgInfo, setSpgInfo] = useState({
     "basic":0,
     "premium":0,
     "advanced":0,
     "normal":0,
     "totalCount":0,
     "period":0
   });
   const [selectedPeriod, setSelectedPeriod] = useState(0);
   //const [ehcTypeList, setEhcTypeList] = useState([]);
   const [ehcTypeList, setEhcTypeList] = useState(null);
   /*
   useState([{ ehcType : null, score : null, },]);
   useState([
    { ehcType : "BASIC", score : -1, },
    { ehcType : "PREMIUM", score : -1, },
    { ehcType : "ADVANCED", score : -1, },
    { ehcType : "NORMAL", score : -1, },
   ]);
  */
   const savedCallback:any = useRef();
   useEffect(() => {
     savedCallback.current = onClickSettingPutCallback;
   });

  useEffect(()=>{
    //onClickSettingToggle(); // 팝업창 초기화
    handleSettingToggleWithType("INIT");    
  }, [company, zone, subZone, room, spg]);

  /*useEffect(()=>{
    // item reset
    // itemSelectState 변경
    clog("IN STATUS : INIT : curEhcType : " +  curEhcType + " : event chought .......");
    //(ehcTypeList.length>0)&&ehcTypeList.map(ehc=> (ehc.ehcType === curEhcType)?{...ehc, class:"on"}:{...ehc, class:""})
    //resetRecoilCurItem();
    //resetRecoilTempCheckVal(); // 임시 체크 정보 (점수 선택하고 다음-저장 진행하지 않은 경우) // 진단점검 완료 상태를 초기화
  }, [curEhcType]);

  useEffect(()=>{
    clog("IN STATUS : INIT : nextEhcType : " +  curEhcType + " : " + nextEhcType + " : event chought .......");
    //(ehcTypeList.length>0)&&ehcTypeList.map(ehc=> (ehc.ehcType === curEhcType)?{...ehc, class:"on"}:{...ehc, class:""})

  }, [nextEhcType]);*/
 

  const { data: data, error, isLoading, reload, run } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    //appPath: "/api/v2/item/status", //?companyId=1&zoneId=1공장&roomId=1공장:전기실1&spgId="+{curSpgId},
    appPath: "/api/v2/product/company/zone/subzone/room/panel/item/status", //?companyId=1&zoneId=1공장&roomId=1공장:전기실1&spgId="+{curSpgId},
    appQuery: { 
      //companyId: company.companyId, 
      //zoneId: zone.zoneId,
      roomId: room.roomId,
      spgId: spg.spgId },
    userToken: userInfo.loginInfo.token,
    //watch: curCompId + curZoneId + curRoomId + curSpgId,
    //watch: company.companyId+zone.zoneId+room.roomId+spg.spgId,
    watch: room.roomId+spg.spgId+statusReload,
  });

  useEffect(() => {
    if (data) {
      //clog("IN STATUS : STATUS-RETURN : " + JSON.stringify(data) + " : " + curEhcType);
      if (data.codeNum === CONST.API_200) {
        //setRecoilCurEhcType("BASIC");
        setSpgInfo(data.body);
        setEhcTypeList([
          //...ehcTypeList, 
          {ehcType:"BASIC", score : data.body.basic, class:(curEhcType==="BASIC")?"on":""},
          {ehcType:"PREMIUM", score : data.body.premium, class:(curEhcType==="PREMIUM")?"on":""},
          {ehcType:"ADVANCED", score : data.body.advanced, class:(curEhcType==="ADVANCED")?"on":""},
          {ehcType:"NORMAL", score : data.body.normal, class:(curEhcType==="NORMAL")?"on":""},  
        ]);
        setSelectedPeriod(data.body.period);
        setParentStatusReload(false);
      } else {
      }
    }
  }, [data]);

  async function onClickSettingPutCallback(e, putPeriod) {
    //alert("selected-data : " + selectedPeriod);
    let data:any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod" : "PUT", 
      "appPath" : "/api/v2/product/company/zone/subzone/room/panel/item/status/period", 
      "appQuery" : {
        //companyId: company.companyId,
        //zoneId: zone.zoneId,
        roomId: room.roomId,
        spgId: spg.spgId,
        //period: selectedPeriod
        period : putPeriod
      },
      userToken : userInfo.loginInfo.token,
    });
    if (data) {
      if ( data.codeNum == 200 ) {
        clog("IN STATUS : PUT PERIOD CALLBACK : " + JSON.stringify(data));
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  function onClickSettingPut(e) {
    /*
    var curTag = e.target as unknown as HTMLElement;
    clog("onClickSettingPut : " + curTag);    
    var actTag = curTag.closest("#status_selected-value");
    if ( CUTIL.isnull(actTag) ) return;
    var selPeriod = actTag.getAttribute("data-value");    
    */
    var selPeriod = $("#status_selected-value").attr("data-value");

    clog("onClickSettingPut : " + selPeriod);
    setSelectedPeriod(parseInt(selPeriod));
    // 설정 기간 콜백 저장 및 spgInfo preiod 항목 변경..
    savedCallback.current(e, parseInt(selPeriod));
    setSpgInfo({...spgInfo, period : parseInt(selPeriod)});
    //
    onClickSettingToggle();
  }

  //설정 토글 액션
  function onClickSettingToggle() {
    $(".box__setting").toggle();
    $(".box").toggleClass("on");
    $(".box__setting .close").on("click", function () {
      $(".btn-setting .toggle").trigger("click");
    });
  }

  //설정 토글 액션
  function handleSettingToggleWithType(rtype) {
    var sttTag = document.querySelector(".box__setting") as unknown as HTMLElement;
    if ( CUTIL.isnull(sttTag) ) return;
    if ( rtype == "INIT" ) {
      sttTag.style.setProperty("display", "none"); // jquery.toggle
    }
    var boxTag = document.querySelector(".box") as unknown as HTMLElement;
    if ( CUTIL.isnull(boxTag) ) return;
    if ( rtype == "INIT" ) {
      if ( boxTag.classList.contains("on") ) {
        boxTag.classList.remove("on")
      }
    }
  }

  // select active 액션
  function toggleSelectBox(selectBox) {
    selectBox.classList.toggle("active");
  }

  // option 선택 시  값 변경 액션
  function selectOption(optionElement) {
    const selectBox = optionElement.closest(".select");
    //option 값 selected-value 로 변경
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    // by sjpark
    //selectedElement.textContent = optionElement.textContent;
    clog("OPT VAL : " + optionElement.value);
    clog("OPT VAL : " + optionElement.getAttribute("data-value"));
    selectedElement.setAttribute("data-value", optionElement.getAttribute("data-value"))
  }

  function onClickSelect(e) {
    const selectBoxElement = e.currentTarget;
    const targetElement = e.target;
    const isOptionElement = targetElement.classList.contains("option");
    if (isOptionElement) {
      selectOption(targetElement);
    }
    toggleSelectBox(selectBoxElement);
  }
 
   // 
  function onClickCheckType(e, cardType) {
    var curTag = (e.target.tagName == "A")?e.target:e.currentTarget;
    if ( curTag.classList.contains("on") ) return;
    setParentEhcType(cardType);
  }
 
  return (
    <>
    <article className={(isLoading)?"box loading__box":"box"}>
      <div className="box__header">
        <p className="box__title">e-HC Status</p>
        <div className="box__etc">
          {/* <!--220524 추가, toggle클래스--> */}
          <button type="button" className="btn btn-setting toggle" onClick={(e) => onClickSettingToggle()}>
            <span className="hide">점검주기 설정</span>
          </button>
        </div>
      </div>
      <div className="box__body" >
        <div className="box__status">
          <ul className="status__info">
            <li>
              <p>{room.roomName} / {spg.spgName}</p>
              <p><strong>{spgInfo.totalCount}</strong><span>{t("LABEL.개")}</span></p>
            </li>
            <li>
              <p>{t("LABEL.점검주기")}</p>
              <p><strong>{selectedPeriod}</strong><span>{t("LABEL.일")}</span></p>
            </li>
          </ul>
          {
          (ehcTypeList != null )&&<EhcTypeList
            curEhcType = {curEhcType}
            ehcTypeList = {ehcTypeList}
            onClickCheckType = {onClickCheckType}
          />
          }
          {/*
          (ehcTypeList.length > 0 )&&<EhcTypeList
            curEhcType = {curEhcType}
            ehcTypeList = {ehcTypeList}
            onClickCheckType = {onClickCheckType}
          />
        */}
        </div>
        {/* <!--220524 추가, 토글버튼 클릭시 오픈--> */}
        <div className="box__setting">
          <ul className="form__input">
            <li>
              <label htmlFor="checkcycle">점검주기</label>
              <div className="input__area">
                <div id="search_select" className="select" onClick={(e)=>onClickSelect(e)}>
                  <div className="selected">
                    <div id="status_selected-value" className="selected-value" data-value={spgInfo.period}>{spgInfo.period}일</div>
                    <div className="arrow"></div>
                  </div>
                  <ul>
                    <li className={(spgInfo.period===365)?"option disabled":"option"} value="0" data-value="365">365일</li>
                    <li className={(spgInfo.period===180)?"option disabled":"option"} value="1" data-value="180">180일</li>
                    <li className={(spgInfo.period===90)?"option disabled":"option"} value="2" data-value="90">90일</li>
                    <li className={(spgInfo.period===30)?"option disabled":"option"} value="3" data-value="30">30일</li>
                  </ul>
                </div>
                <p className="input-errortxt">필수 입력 항목입니다.</p>
              </div>
            </li>
          </ul>
          <div className="popup__footer">
            {/* <!--220523, 모바일에서 버튼 하나로 갈경우 클래스에 w100p 추가해주세요--> */}
            <button type="button" className="close bg-gray" onClick={(e) => onClickSettingToggle()} ><span>취소</span></button>
            <button type="button" onClick={(e)=>onClickSettingPut(e)}><span>적용</span></button>
          </div>
        </div>
      </div>
    </article>
    </>
  )
}

export default Status;

function EhcTypeList(props) {
  const curEhcType = props.curEhcType;
  const ehcTypeList = props.ehcTypeList;
  const onClickCheckType = props.onClickCheckType;
  return (
    <ul className="status__data">
    {/*(ehcTypeList[0].score>-1)&&ehcTypeList.map((ehc, idx)=>(*/
      ehcTypeList.map((ehc, idx)=>(
      <li key={"ehctypelist_"+idx}>
        {/*clog("IN STATUS EHCTYPELIST : RENDER : " + ehc.ehcType + " : " + ehc.class + " / " + curEhcType)*/}
        <a className={(ehc.ehcType === curEhcType)?"on":""} onClick={(e)=>onClickCheckType(e, ehc.ehcType)}>
        {/*<a className={ehc.class} onClick={(e)=>onClickCheckType(e, ehc.ehcType)}>*/}
          <p className="name" >{ehc.ehcType}</p>
          <p className="txt" >{ehc.score}</p>
        </a>
      </li>
      ))
    }
    </ul>
  )
}
