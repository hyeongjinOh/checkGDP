/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
*/
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-20
 * @brief EHP Tree 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState, DependencyList } from "react";
import { useNavigate, Link } from 'react-router-dom';
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { czoneInfoState } from "../../../recoil/menuState";
import { userInfoState, authState, userInfoLoginState } from "../../../recoil/userState";
import {
  curSpgTreeState,
  tempCheckValue,
} from "../../../recoil/assessmentState";
import { headerSettingState, headerAlarmState, headerUserInfoState, treeMenuState } from '../../../recoil/menuState';

//
import $ from "jquery";
//import "/static/css/style.css"
//
import { useTrans } from "../../../utils/langs/useTrans";
//
import * as HttpUtil from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import * as USERUTILS from "../../../utils/user/userUtils"
import useScript from "../../../utils/hooks/useHooks";
/**
 * @brief EHP Tree 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function TreeMenu(props) {
  //navi, ref
  const navigate = useNavigate();
  //recoil
  const isAuth = useRecoilValue(authState);
  const userInfo = useRecoilValue(userInfoLoginState);
  const [czoneInfo, setRecoilCZoneInfo] = useRecoilState(czoneInfoState);
  const curTreeData = useRecoilValue(curSpgTreeState);
  const setRecoilCurTreeData = useSetRecoilState(curSpgTreeState);
  const [settingPopup, setRecoilSettingPopup] = useRecoilState(headerSettingState);
  const [alarmPopup, setRecoilAlarmPopup] = useRecoilState(headerAlarmState);
  const [userInfoPopup, setRecoilUserInfoPopup] = useRecoilState(headerUserInfoState);
  const [treeOpen, setRecoilTreeOpen] = useRecoilState(treeMenuState);

  //props
  const setParentCurTreeData = props.setCurTreeData;
  const isOpen = props.hasOwnProperty("isOpen") ? props.isOpen : true;
  const setParentTreeOpen = props.hasOwnProperty("setTreeOpen") ? props.setTreeOpen : null;
  //
  const [treeItem, setTreeItem] = useState([]);

  //20220713 트리 검색어
  const [treeSearch, setTreeSearch] = useState("");
  //20220713 트리 검색 결과 갯수
  const [countSearch, setCountSearch] = useState(0);
  //20220714  검색 결과 div의 위로 아래로 화살표
  const [directArrow, setDirectArrow] = useState(0);
  //20220717 include적용한 배열
  const [makeIncludes, setmakeIncludes] = useState([]);
  const [makeIncludesIndex, setMakeIncludeIndex] = useState([]);


  // isMobile 여부 랜더링 후 확인
  useDebounceEffect(
    async () => {
      if ( czoneInfo.zone.zoneId.length > 0) {
        //const zoneTag = document.querySelector(`#li_focus_${czoneInfo.zone.zoneId}`);
        const zoneTag = document.getElementById(`li_focus_${czoneInfo.zone.zoneId}`);
        if (!CUTIL.isnull(zoneTag)) {
          zoneTag.scrollIntoView();
          setRecoilCZoneInfo({company:{companyId:"", companyName:""}, zone:{zoneId:"", zoneName:""}});        
        }
      }
    }, 100, [treeItem],
  )

  const { data: data, error, isLoading, reload, run, } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    //appPath: `/api/v2/tree/${userInfo.userId}`, // url 직접 접근시 로그인 정보 사라짐..
    //appPath: `/api/v2/product/usertree`,
    appPath: `/api/v2/product/dashboard/usertree`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    //userToken : userToken,
  });

  //let defTreeData: any = {};
  let defTreeData: any = null;

  useEffect(() => {
    if (data) {
      if (data.codeNum == 200) {
        if (data.body.length <= 0 ) {
          // 20221014 by 최효일 : 할당된 회사/사업장이 없는 경우, 운영관리 페이지로 이동..
          navigate(CONST.URL_ADMIN);
        }

        {clog("IN TREE : RESULT : CZONEINFO : " + JSON.stringify(czoneInfo));}
        if ( czoneInfo.zone.zoneId.length <= 0 ) {
          (defTreeData===null)&&data.body.map((company, idx) => {
            const zoneList = company.hasOwnProperty("zone") ? company.zone : null;
            (defTreeData===null)&&(zoneList)&&zoneList.map((zone, idx) => {
              const subZoneList = zone.hasOwnProperty("subZone") ? zone.subZone : null;
              (defTreeData===null)&&(subZoneList)&&subZoneList.map((subZone, idx) => {
                const roomList = subZone.hasOwnProperty("room") ? subZone.room : null;
                (defTreeData===null)&&(roomList)&&roomList.filter((data, idx) => idx === 0).map((room, idx) => {
                  const spgList = room.hasOwnProperty("spg") ? room.spg : null;
                  (defTreeData===null)&&(spgList)&&spgList.filter((data, idx) => idx === 0).map((spg, idx) => {
                    if (defTreeData===null){
                      defTreeData = {
                        company: { companyId: company.companyId, companyName: company.companyName, },
                        zone: { zoneId: zone.zoneId, zoneName: zone.zoneName, },
                        subZone: { subZoneId: subZone.zoneId, subZoneName: subZone.zoneName, },
                        room: { roomId: room.roomId, roomName: room.roomName, },
                        spg: { spgId: spg.spgId, spgName: spg.spgName, },
                      };
                    }
                  });
                });
              });
            });
          });
        } else {
          data.body.filter(company=>company.companyId===czoneInfo.company.companyId).map((company, idx) => {
            const zoneList = company.hasOwnProperty("zone") ? company.zone : null;
            (zoneList)&&zoneList.filter(zone=>zone.zoneId===czoneInfo.zone.zoneId).map((zone, idx) => {
              const subZoneList = zone.hasOwnProperty("subZone") ? zone.subZone : null;
              (subZoneList)&&subZoneList.map((subZone, idx) => {
                const roomList = subZone.hasOwnProperty("room") ? subZone.room : null;
                (roomList)&&roomList.filter((data, idx) => idx === 0).map((room, idx) => {
                  const spgList = room.hasOwnProperty("spg") ? room.spg : null;
                  (spgList)&&spgList.filter((data, idx) => idx === 0).map((spg, idx) => {
                    if (defTreeData===null){
                      defTreeData = {
                        company: { companyId: company.companyId, companyName: company.companyName, },
                        zone: { zoneId: zone.zoneId, zoneName: zone.zoneName, },
                        subZone: { subZoneId: subZone.zoneId, subZoneName: subZone.zoneName, },
                        room: { roomId: room.roomId, roomName: room.roomName, },
                        spg: { spgId: spg.spgId, spgName: spg.spgName, },
                      };
                    }
                  });
                });
              });
            })
          })
        }
        /*
        data.body.filter((data, idx) => idx === 0).map((company, idx) => {
          //const zoneList = company.zone;
          const zoneList = company.hasOwnProperty("zone") ? company.zone : null;
          zoneList && zoneList.filter((data, idx) => idx === 0).map((zone, idx) => {
            const subZoneList = zone.hasOwnProperty("subZone") ? zone.subZone : null;
            subZoneList && subZoneList.filter((data, idx) => idx === 0).map((subZone, idx) => {
              const roomList = subZone.hasOwnProperty("room") ? subZone.room : null;
              roomList && roomList.filter((data, idx) => idx === 0).map((room, idx) => {
                const spgList = room.hasOwnProperty("spg") ? room.spg : null;
                spgList && spgList.filter((data, idx) => idx === 0).map((spg, idx) => {
                  defTreeData = {
                    //company: { id: company.companyId, name: company.companyName, },
                    company: { companyId: company.companyId, companyName: company.companyName, },
                    zone: { zoneId: zone.zoneId, zoneName: zone.zoneName, },
                    subZone: { subZoneId: subZone.zoneId, subZoneName: subZone.zoneName, },
                    room: { roomId: room.roomId, roomName: room.roomName, },
                    spg: { spgId: spg.spgId, spgName: spg.spgName, },
                  };
                });
              });
            });
          });
        });*/
        if (CUTIL.isnull(defTreeData) ) {
          // 20221014 by 최효일 : 할당된 회사/사업장이 없는 경우, 운영관리 페이지로 이동..
          navigate(CONST.URL_ADMIN);
        }

        setTreeItem(data.body);
        if ( CUTIL.isnull(defTreeData) ) {
          setRecoilCurTreeData({
            company:{companyId:"", companyName:""}, 
            zone:{zoneId:"", zoneName:""}, 
            subZone:{subZoneId:"", subZoneName:""}, 
            room:{roomId:"", roomName:""}, 
            spg:{spgId:-1, spgName:""}
          });
        } else {
          setRecoilCurTreeData(defTreeData);
        }
      } else {
        clog("IN MAIN USERTREE : " + JSON.stringify(data));
      }
    }
  }, [data]);
  //
  /* if (isLoading) return <div>로딩중..</div>; */

  //clog("IN TREEMENU : CUR DATA : " + JSON.stringify(curTreeData));
  // 트리메뉴 접고 펼쳐지는 버튼 액션
  function treeMenuOnClickSelf(e) {
    e.preventDefault();
    let tree_class = document.querySelector(".treebar");
    let section_class = document.querySelector(".content");

    if (!tree_class.classList.contains("close")) {
      tree_class.classList.add("close");
      section_class.setAttribute("style", "width: calc(100% - 40px)");
    } else {
      tree_class.classList.remove("close");
      section_class.setAttribute("style", "");
    }
  }

  function treeMenuOnClick(e) {
    if (setParentTreeOpen != null) {
      setParentTreeOpen(!isOpen);
    } else {
      treeMenuOnClickSelf(e);
    }
  }

  function handleSpgClick(spgData) {
    //clog("IN TREEMENU : handleSpgClick : " + JSON.stringify(spgData));
    setParentCurTreeData(spgData);
  }
  //20220922 jhpark수정 검색어 결과 클릭시 바로 인풋박스로 전환
  function treeRetying() {
    treeSearchResultClose();
  }
  //20220713 트리 검색어 입력
  const changeInputSearch = (e) => {
    setTreeSearch(e.target.value);
  };

  // 20220718 sjpark tree all 펼치기/접기
  // false 펼치기, true 접기
  function handleFoldTree(val) {
    const treeArea = document.querySelector(".treearea");
    if (CUTIL.isnull(treeArea)) return;
    const selBox = treeArea.querySelectorAll("input");
    if (CUTIL.isnull(selBox)) return;

    for (var i = 0; i < selBox.length; i++) {
      var child = selBox[i];
      child.checked = val;
    }
  }

  // 20220712 트리 검색 ========================================================================================================
  let treeSearchUpper = treeSearch.toUpperCase();
  function treeSearching(e) {
    if (treeSearch.length <= 0) return;
    const deleteClass = document.querySelectorAll(".ehc_treeleaf");
    clog("트리 검색 닫기 테스트: deleteClass :" + deleteClass.length);
    for (let i = 0; i < deleteClass.length; i++) {
      deleteClass[i].classList.remove("on");
    }

    /*
    const deleteClass = document.querySelectorAll(".on");
    for (let i = 0; i < deleteClass.length; i++) {
      deleteClass[i].classList.remove("on");
    }
    */

    //let strSearch = JSON.stringify(data.body, null, 2);
    let exceptCompanyArr: string[] = [];
    let exceptzoneNameArr: string[] = [];
    let exceptsubZoneNameArr: string[] = [];
    let exceptroomNameArr: string[] = [];
    let exceptspgNameArr: string[] = [];
    for (let i = 0; i < data.body.length; i++) {
      exceptCompanyArr.push(data.body[i].companyName.replace(/ /gi, "").toUpperCase());
      if (!data.body[i].hasOwnProperty("zone") || !data.body[i].zone) { continue; } // add by sjpark 20220921수정
      for (let j = 0; j < data.body[i].zone.length; j++) {
        exceptzoneNameArr.push(data.body[i].zone[j].zoneName.replace(/ /gi, ""));
        if (!data.body[i].zone[j].hasOwnProperty("subZone")) { continue; } // add by sjpark 20220921수정
        for (let k = 0; k < data.body[i].zone[j].subZone.length; k++) {
          exceptsubZoneNameArr.push(data.body[i].zone[j].subZone[k].subZoneName.replace(/ /gi, ""));
          if (!data.body[i].zone[j].subZone[k].hasOwnProperty("room")) { continue; } // add by sjpark 20220921수정
          for (let l = 0; l < data.body[i].zone[j].subZone[k].room.length; l++) {
            exceptroomNameArr.push(data.body[i].zone[j].subZone[k].room[l].roomName.replace(/ /gi, ""));
            if (!data.body[i].zone[j].subZone[k].room[l].hasOwnProperty("spg")) { continue; } // add by sjpark 20220921수정
            for (let m = 0; m < data.body[i].zone[j].subZone[k].room[l].spg.length; m++) {
              // 원래 문자 -> 대문자변환
              exceptspgNameArr.push(data.body[i].zone[j].subZone[k].room[l].spg[m].spgName.replace(/ /gi, ""));
            }
          }
        }
      }
    }

    let allSearchArrAdd: any[] = [...exceptCompanyArr, ...exceptzoneNameArr, ...exceptsubZoneNameArr, ...exceptroomNameArr, ...exceptspgNameArr];
    let strSearch = JSON.stringify(allSearchArrAdd, null, 2);
    let replaceJson = strSearch.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").toUpperCase();

    if (treeSearchUpper != "") {
      let countSearch = replaceJson.split(treeSearchUpper).length - 1;
    } else {
      clog("error");
    }

    allSearchArrAdd.includes(treeSearchUpper);
    for (let i = 0; i < allSearchArrAdd.length; i++) {
      if (allSearchArrAdd[i].includes(treeSearchUpper) == true) {
        //makeIncludes.push([i, allArrAdd[i]]);
        makeIncludes.push(allSearchArrAdd[i].replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, ""));
        makeIncludesIndex.push(i);
        setmakeIncludes(makeIncludes);
        setMakeIncludeIndex(makeIncludesIndex);
      }
    }
    setCountSearch(makeIncludesIndex.length);
    const set = new Set(makeIncludes);
    const classItemNames = [...set];

    //20221020 jhpark 수정
    for (let k = 0; k < classItemNames.length; k++) {
      const companyClassHigh = document.querySelectorAll(`.companyTreeSearch__${classItemNames[k]}`);
      if (companyClassHigh.length > 0) {
        for (let i = 0; i < companyClassHigh.length; i++) {
          companyClassHigh[i].classList.add("on");
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const zoneClassHigh = document.querySelectorAll(`.zoneTreeSearch__${classItemNames[k]}`);
      if (zoneClassHigh.length > 0) {
        for (let i = 0; i < zoneClassHigh.length; i++) {
          zoneClassHigh[i].classList.add("on");
          //zoneClassHigh[i].setAttribute("id", `high_${classItemNames[k]}_${[i + 1]}`);
          // zoneClassHigh[i].setAttribute("id", `high_${idNode}`);
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const subZoneClassHigh = document.querySelectorAll(`.subZoneTreeSearch__${classItemNames[k]}`);
      if (subZoneClassHigh.length > 0) {
        for (let i = 0; i < subZoneClassHigh.length; i++) {
          subZoneClassHigh[i].classList.add("on");
          //subZoneClassHigh[i].setAttribute("id", `high_${classItemNames[k]}_${[i + 1]}`);
          //subZoneClassHigh[i].setAttribute("id", `high_${classItemNames[k]}_${[i + 1]}`);
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const roomClassHigh = document.querySelectorAll(`.roomTreeSearch__${classItemNames[k]}`);
      if (roomClassHigh.length > 0) {
        for (let i = 0; i < roomClassHigh.length; i++) {
          roomClassHigh[i].classList.add("on");
          // roomClassHigh[i].setAttribute("id", `high_${classItemNames[k]}_${[i + 1]}`);
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const spgClassHigh = document.querySelectorAll(`.spgTreeSearch__${classItemNames[k]}`);
      if (spgClassHigh.length > 0) {
        for (let i = 0; i < spgClassHigh.length; i++) {
          spgClassHigh[i].classList.add("on");
          //spgClassHigh[i].setAttribute("id", `high_${classItemNames[k]}_${[i + 1]}`);
          //spgClassHigh[i].setAttribute("id", `high_${idNode}`);
        }
      }
    }
    document.getElementById("tr__search").style.display = "none";
    if (document.getElementById("tr__result").style.display = "none") {
      document.getElementById("tr__result").style.display = "";
    }

    //20220922 jhpark수정
    const treeLeaf = document.querySelectorAll(".ehc_treeleaf");
    var modClassCSS = [];
    for (var i = 0; i < treeLeaf.length; i++) {
      if (treeLeaf[i].classList.contains("on")) {
        modClassCSS.push(treeLeaf[i]);
      }
    }
    for (let i = 0; i < modClassCSS.length; i++) {
      modClassCSS[i].setAttribute("id", `high_${[i + 1]}`);
    }

    if (makeIncludesIndex.length !== 0) {
      setDirectArrow(1)
      document.getElementById(`high_${1}`).classList.add("highlight");
    } else {
      return;
    }


    // tree all 펼치기/접기
    handleFoldTree(false); // false 펼치기, true 접기
  }
  // 20220712 트리 검색 닫기 버튼
  function treeSearchResultClose() {
    setTreeSearch("");
    setCountSearch(0);
    setDirectArrow(0);
    setmakeIncludes([]);
    setMakeIncludeIndex([]);

    const set = new Set(makeIncludes);
    const classItemNames = [...set];
    
    //const deleteClass = document.querySelectorAll(".on");
    
    const deleteClass = document.querySelectorAll(".ehc_treeleaf");
    clog("트리 검색 닫기 테스트: deleteClass :" + deleteClass.length);
    for (let i = 0; i < deleteClass.length; i++) {
      clog("treeSearchResultClose : DATA-VAL : " + deleteClass[i].getAttribute("data-val") + " : " + JSON.stringify(curTreeData));
      deleteClass[i].classList.remove("on");
    }
    
    const deleteHighlight = document.querySelectorAll(".highlight");
    for (let i = 0; i < deleteHighlight.length; i++) {
      deleteHighlight[i].classList.remove("highlight");
    }
    //20221020 jhpark 수정
    for (let k = 0; k < classItemNames.length; k++) {
      const companyClassHigh = document.querySelectorAll(`.companyTreeSearch__${classItemNames[k]}`);
      if (companyClassHigh.length > 0) {
        for (let i = 0; i < companyClassHigh.length; i++) {
          //zoneClassHigh[i].classList.remove("on");
          //zoneClassHigh[i].classList.remove("highlight");
          companyClassHigh[i].removeAttribute('id');
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const zoneClassHigh = document.querySelectorAll(`.zoneTreeSearch__${classItemNames[k]}`);
      if (zoneClassHigh.length > 0) {
        for (let i = 0; i < zoneClassHigh.length; i++) {
          //zoneClassHigh[i].classList.remove("on");
          //zoneClassHigh[i].classList.remove("highlight");
          zoneClassHigh[i].removeAttribute('id');
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const subZoneClassHigh = document.querySelectorAll(`.subZoneTreeSearch__${classItemNames[k]}`);
      if (subZoneClassHigh.length > 0) {
        for (let i = 0; i < subZoneClassHigh.length; i++) {
          subZoneClassHigh[i].removeAttribute('id');
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const roomClassHigh = document.querySelectorAll(`.roomTreeSearch__${classItemNames[k]}`);
      if (roomClassHigh.length > 0) {
        for (let i = 0; i < roomClassHigh.length; i++) {
          roomClassHigh[i].removeAttribute('id');
        }
      }
    }

    for (let k = 0; k < classItemNames.length; k++) {
      const spgClassHigh = document.querySelectorAll(`.spgTreeSearch__${classItemNames[k]}`);
      if (spgClassHigh.length > 0) {
        for (let i = 0; i < spgClassHigh.length; i++) {
          spgClassHigh[i].removeAttribute('id');
        }
      }
    }

    if (document.getElementById("tr__search").style.display == "none") {
      document.getElementById("tr__search").style.display = "";
      //20220922 수정
      document.getElementById("inputfocus").focus();
    }
    document.getElementById("tr__result").style.display = "none";
  }
  // 20220714 검색 화살표 동작 down down down down treeSearchArrowDown
  function treeSearchArrowDown() {
    //const aaa = document.querySelectorAll(".on");
    const treeLeaf = document.querySelectorAll(".ehc_treeleaf");
    var modClassCSS = [];
    for (var i = 0; i < treeLeaf.length; i++) {
      if (treeLeaf[i].classList.contains("on")) {
        modClassCSS.push(treeLeaf[i]);
      }
    }
    for (let i = 0; i < modClassCSS.length; i++) {
      modClassCSS[i].setAttribute("id", `high_${[i + 1]}`);
    }

    if (countSearch == 0) {
      setDirectArrow(0);
      return;
    }
    //검색 결과 단건인 경우
    if (countSearch == 1) {
      setDirectArrow(1);
      document.getElementById(`high_${countSearch}`).classList.add("highlight");
      document.getElementById(`high_${countSearch}`).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      return;
    }
    if (directArrow == countSearch) {

      document.getElementById(`high_${directArrow - countSearch + 1}`).classList.add("highlight");
      document.getElementById(`high_${directArrow - countSearch + 1}`).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      document.getElementById(`high_${countSearch}`).classList.remove("highlight");
      setDirectArrow((directArrow - countSearch + 1));
    } else {

      document.getElementById(`high_${directArrow + 1}`).classList.add("highlight");
      document.getElementById(`high_${directArrow + 1}`).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setDirectArrow(directArrow + 1);
      if (directArrow) {
        document.getElementById(`high_${directArrow}`).classList.remove("highlight");
      }
    }
  }
  // 20220714 검색 화살표 동작 Up Up Up Up
  function treeSearchArrowUp() {
    //const aaa = document.querySelectorAll(".on");
    const treeLeaf = document.querySelectorAll(".ehc_treeleaf");
    var modClassCSS = [];
    for (var i = 0; i < treeLeaf.length; i++) {
      if (treeLeaf[i].classList.contains("on")) {
        modClassCSS.push(treeLeaf[i]);
      }
    }

    for (let i = 0; i < modClassCSS.length; i++) {
      modClassCSS[i].setAttribute("id", `high_${[i + 1]}`);
    }

    if (countSearch == 0) {
      setDirectArrow(0);
      return;
    }
    //검색 결과 단건인 경우
    if (countSearch == 1) {
      setDirectArrow(1);
      document.getElementById(`high_${countSearch}`).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      document.getElementById(`high_${countSearch}`).classList.add("highlight");
      return;
    }
    if (directArrow <= 1) {
      setDirectArrow(countSearch);
      document.getElementById(`high_${countSearch}`).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      document.getElementById(`high_${countSearch}`).classList.add("highlight");
    } else {
      document.getElementById(`high_${directArrow - 1}`).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      document.getElementById(`high_${directArrow - 1}`).classList.add("highlight");
      setDirectArrow(directArrow - 1);
    }
    if (directArrow) {
      document.getElementById(`high_${directArrow}`).classList.remove("highlight");
    }
  }

  function enterkeyOperate(e) {
    if (e.keyCode === 13) {
      treeSearching(e)
    };
  };
  //clog("IN TREE : RENDERING : " + JSON.stringify(curTreeData));
  let isSelect: boolean = Object.keys(curTreeData).length > 0 ? true : false;
  clog("IN TREEMENU : settingPopup : " + treeOpen);

  return (
    <>
      {/* <!-- .treebar, 메뉴트리영역 --> */}
      <div className={`box treebar ${(treeOpen)&&(isOpen)?"":"close"}`}>
        <div className="box__header">
          <p className="box__title">{isSelect && curTreeData.company.companyName}</p>
          <div className="box__etc">
            <button type="button" className="btn btn-tree" onClick={(e) => treeMenuOnClick(e)}            >
              <span className="hide">트리메뉴접기펼치기</span>
            </button>
          </div>
        </div>
        {/* <!--220704, 기본 디자인경--> */}
        <div id="tr__search" className="box__search">
          <input id="inputfocus" type="text" placeholder="search..." onChange={changeInputSearch} value={treeSearch} onKeyDown={(e) => enterkeyOperate(e)} />
          <button type="button" className="btn btn-search" onClick={(e) => treeSearching(e)}>
            <span className="hide">조회</span>
          </button>
        </div>
        {/* <!--220704, 포커스 갈때 검색부분 디자인 변경--> */}
        <div id="tr__result" className="box__search focus" style={{ display: "none" }}>
          <div className="focus__search">
            <input type="text" placeholder="Search…" defaultValue={treeSearch} onClick={treeRetying} />
            <span>{directArrow} / {countSearch}</span>
          </div>
          <div className="focus__btn">
            <button type="button" className="arrow-down" onClick={treeSearchArrowDown}><span className="hide">아래쪽으로</span></button>
            <button type="button" className="arrow-up" onClick={treeSearchArrowUp}><span className="hide">위쪽으로</span></button>
            <button type="button" className="close" onClick={() => treeSearchResultClose()}><span className="hide">버튼닫기</span></button>
          </div>
        </div>
        {/*<!--220602, treescroll 태그 전체 삭제-->*/}
        <div className="treearea" >
          {/* <!--220520, 트리영역 전체 수정--> */}
          {treeItem.map((company, idx) => (
            (company.zone)&&<React.Fragment key={`_treefrag_${idx.toString()}`}>
              {/*clog("TREE INFO : " + JSON.stringify(company))*/}
              <div className="tree__title">
                <a className={"ehc_treeleaf companyTreeSearch__" + company.companyName.toUpperCase().replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "")}>{company.companyName}</a>
              </div>
              <ul id="tree" className="tree">
                {(isSelect && company.hasOwnProperty("zone")) &&
                  <TreeZone
                    curTreeData={curTreeData}
                    zone={company.zone}
                    company={{ companyId: company.companyId, companyName: company.companyName }}
                    handleSpgClick={handleSpgClick}
                    treeSearchResultClose={treeSearchResultClose}
                  />
                }
              </ul>
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* <!-- //.treebar, 메뉴트리영역 --> */}
    </>
  );
}
export default TreeMenu;

// //depth1 기존
function TreeZone(props) {
  const companyItem = props.company;
  const { data } = props;
  const zoneItem = props.zone;
  let firstNode = 1;
  //clog("IN TREE : ZONE : " + JSON.stringify(zoneItem))

  return (
    <>
      {/* <!--220520,첫번째뎁스 li에 클래스추가 tree__depth1--> */}
      {/* //20221020 jhpark 수정 사업장 이름 겹치는 이슈 수정 */}
      {(zoneItem) && zoneItem.map((zone, idx) => (
        <li className="tree__depth1" key={zone.zoneId + "_" + idx} id={`li_focus_${zone.zoneId}`}>
          <input type="checkbox" id={"root" + idx + "-" + companyItem.companyId + zone.zoneName + "-" + ++firstNode} defaultValue={zone.zoneId} />
          {/*<input type="checkbox" id={`focus_${zone.zoneId}`} defaultValue={zone.zoneId} />*/}
          <a className={"ehc_treeleaf zoneTreeSearch__" + zone.zoneName.toUpperCase().replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "")}>
            <label htmlFor={"root" + idx + "-" + companyItem.companyId + zone.zoneName + "-" + firstNode++}>{zone.zoneName}</label>
          </a>
          {/* <!--220520,두번째뎁스 ul에 클래스추가 tree__depth2--> */}
          <ul className="tree__depth2">
            {(zone.hasOwnProperty("subZone")) && <TreeSubZone
              curTreeData={props.curTreeData}
              subZone={zone.subZone}
              company={props.company}
              zone={{ zoneId: zone.zoneId, zoneName: zone.zoneName }}
              handleSpgClick={props.handleSpgClick}
              // 20220627 id,htmlFor를 맞추기 위한 nodeId를 생성하여 중복없게 작성
              nodeId={firstNode}
              treeSearchResultClose={props.treeSearchResultClose}
            />}
          </ul>
        </li>
      ))}
    </>
  );
}

////   depth2   ///////////////////////////   depth2   ///////////////////////////   depth2   ///////////////////////////
function TreeSubZone(props) {
  const { data } = props;
  const subZoneItem = props.subZone;
  //20220627 nodeId 추가
  let secondNode = props.nodeId * 11;
  //clog("IN TREE : SUBZONE : " + JSON.stringify(subZoneItem))


  return (
    <>
      {(subZoneItem) && subZoneItem.map((subZone, idx) => (
        <li key={subZone.subZoneId + "_" + idx}>
          {/* <input type="checkbox" id={"node" + idx + room.roomId} value={room.roomId} /> */}
          <input type="checkbox" id={"node" + idx + "-" + subZone.subZoneName + ++secondNode} defaultValue={subZone.subZoneId} />
          {/* <a href="#" ><label htmlFor={"node" + idx + room.roomId} data-val={room.roomId}>{room.roomName}11</label></a> */}
          {/* <a href="#"> */}
          <a className={"ehc_treeleaf subZoneTreeSearch__" + subZone.subZoneName.toUpperCase().replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "")}>
            <label htmlFor={"node" + idx + "-" + subZone.subZoneName + secondNode++} data-val={subZone.subZoneId}>
              {subZone.subZoneName}
            </label>
          </a>

          {/* <!--220520,세번째뎁스 ul에 클래스추가 tree__depth3--> */}
          <ul className="tree__depth3">
            {(subZone.hasOwnProperty("room")) &&
              <TreeRoom
                curTreeData={props.curTreeData}
                room={subZone.room}
                company={props.company}
                zone={props.zone}
                subZone={{
                  subZone: subZone.subZoneId,
                  subZoneName: subZone.subZoneName,
                }}
                handleSpgClick={props.handleSpgClick}
                // 20220627 id,htmlFor를 맞추기 위한 nodeId를 생성하여 중복없게 작성
                nodeId={secondNode}
                treeSearchResultClose={props.treeSearchResultClose}
              />
            }
          </ul>
        </li>
      ))}
    </>
  );
}
function TreeRoom(props) {
  const { data } = props;
  const roomItem = props.room;
  const akey = props.akey;
  let fourthNode = props.nodeId * 11;

  return (
    <>
      {(roomItem) && roomItem.map((room, idx) => (
        <li key={"room_" + idx}>
          <input
            type="checkbox"
            id={idx + "_node1111_" + room.roomName + ++fourthNode}
          />
          <a className={"ehc_treeleaf roomTreeSearch__" + room.roomName.toUpperCase().replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "")}>
            <label htmlFor={idx + "_node1111_" + room.roomName + fourthNode++} className="tree__depth3">
              {room.roomName}
            </label>
          </a>
          <ul className="tree__depth4">
            {(room.hasOwnProperty("spg")) && <TreeSpg
              curTreeData={props.curTreeData}
              spg={room.spg}
              company={props.company}
              zone={props.zone}
              subZone={props.subZone}
              room={{ roomId: room.roomId, roomName: room.roomName }}
              handleSpgClick={props.handleSpgClick}
              nodeId={fourthNode}
              treeSearchResultClose={props.treeSearchResultClose}
            />}
          </ul>
        </li>
      ))
      }
    </>
  )
}
////   depth3   ///////////////////////////   depth3   ///////////////////////////   depth3   ///////////////////////////

function TreeSpg(props) {
  const tempCheckVal = useRecoilValue(tempCheckValue);  
  const { data } = props;
  
  const curTreeData = props.curTreeData;
  const spgItem = props.spg;
  //clog("IN TREE SPG Id :" +JSON.stringify(spgItem));

  // 해당  spg id 이벤트
  function spgOnclick(e, handleSpgFunc, selTreeData) {
    const tsValue = (tempCheckVal.checkVal.value.length > 0)?parseInt(tempCheckVal.checkVal.value):-1;    
    if ( tsValue < 0 ) { // Main-handleSpgFunc 한번더 체크 함.
      const deleteClass = document.querySelectorAll(".ehc_treeleaf");
      for (let i=0; i < deleteClass.length; i++) {
        var treeData = JSON.parse(deleteClass[i].getAttribute("data-val"));
        if ( selTreeData !== treeData ) {
          deleteClass[i].classList.remove("on");
        }
      }
    }
    handleSpgFunc(selTreeData);
  }
  // 20220627 nodeId 추가
  let thirdNode = props.nodeId * 11;
  function otherOnClick(treeSearchResultClose) {
    treeSearchResultClose()
  }

  return (
    <>
      {(spgItem)&&spgItem.map((spg, idx) => (
        <li key={spg.spgId + "_" + idx}>
          {/* <input type="checkbox" id={"node" + idx + "-" + spg.spgId} value={spg.spgId} /> */}
          <input
            type="checkbox"
            id={"node" + idx + "-" + ++thirdNode}
            defaultValue={spg.spgId}
          />

          {/* <!--선택된 메뉴 className="on"--> */}
          {/*<a href="#" onClick={(e) =>spgOnclick(e, props.handleSpgClick, {"spg":{"spgId":`${spg.spgId}`, "sgpName":""}}) } >*/}
          <a
            className={
              props.curTreeData.company.companyId == props.company.companyId &&
                props.curTreeData.zone.zoneId == props.zone.zoneId &&
                props.curTreeData.subZone.subZoneId == props.subZone.subZoneId &&
                props.curTreeData.room.roomId == props.room.roomId &&
                props.curTreeData.spg.spgId == spg.spgId
                //20221028 수정 jhpark
                ? `ehc_treeleaf spgTreeSearch__${spg.spgName.replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "")} on`
                : `ehc_treeleaf spgTreeSearch__${spg.spgName.replace(/[\{\}\[\]\/? .,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "")}`
            }
            onClick={(e) => spgOnclick(e, props.handleSpgClick, {
              company: props.company,
              zone: props.zone,
              subZone: props.subZone,
              room: props.room,
              spg: spg,
            })
            }
            data-val={JSON.stringify({
              company: props.company,
              zone: props.zone,
              subZone: props.subZone,
              room: props.room,
              spg: spg,
              })}
          >
            <label
              htmlFor={"node" + idx + props.company.companyName + "-" + thirdNode++}
              className="lastTree"
              //onClick={() => otherOnClick(props.treeSearchResultClose)}
              data-val={spg.spgId}>
              {spg.spgName}
            </label>
          </a>
        </li>
      ))}
    </>
  );
}



export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}