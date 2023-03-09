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
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState } from '../../recoil/userState';
//
import $ from "jquery";
import "/static/css/style.css"
import "/static/css/jquery.mCustomScrollbar.css"
//
import { useTrans } from "../../utils/langs/useTrans";
//
import * as HttpUtil from "../../utils/api/HttpUtil";
import clog from "../../utils/logUtils"
import useScript from "../../utils/hooks/useHooks"
import Main from "../main/Main";
/**
 * @brief EHP Tree 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
const data_ = require("./json/tree.json")
function TreeMenuTest() {
  const [treeItem, setTreeItem] = useState([]);
  const userInfo = useRecoilValue(userInfoState);
  useEffect(() => {
    setTreeItem(data_.data)
  }, [])
  //const treeItem = props.treeItem;
  //const curTreeData = props.curTreeData;
  // const setParentCurTreeData = props.handleFunc;
  const [curTreeData, setCurTreeData] = useState({});
  /**
  const status = useScript("/app/jquery.mCustomScrollbar.concat.min.js");
  useEffect(() => {
    if(status === "ready") {
      // do something
    }
  }, []);
  */

  const { data: data, error, isLoading, reload, run } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: `/api/v2/tree/${userInfo.userId}`,
    appQuery: {},
  });

  // let defTreeData:any = {};

  // useEffect(() => {
  //   if (data) {
  //     if (data.codeNum == 200) {
  //       data.body.filter((data, idx)=>(idx===0)).map((company, idx) => {
  //         const zoneList = company.zone;
  //         zoneList&&zoneList.filter((data, idx)=>(idx===0)).map((zone, idx)=>{
  //           const roomList = zone.room;
  //           roomList&&roomList.filter((data, idx)=>(idx===0)).map((room, idx)=>{
  //             const spgList = room.spg;
  //             spgList&&spgList.filter((data, idx)=>(idx===0)).map((spg, idx)=>{
  //               defTreeData = {
  //                 "company":{"id":company.companyId, "name":company.companyName},
  //                 "zone":{"zoneId":zone.zoneId, "zoneName":zone.zoneName},
  //                 "room":{"roomId":room.roomId, "roomName":room.roomName},
  //                 "spg":{"spgId":spg.spgId, "spgName":spg.spgName},
  //               };
  //             });
  //           });
  //         });
  //       });
  //       // setParentCurTreeData(defTreeData);        
  //       setTreeItem(data.body);
  //       setCurTreeData(defTreeData);
  //     }
  //   }
  // }, [data]);
  //
  // if (!isLoading) return <div><TreeMenuTest /></div>;

  // if (isLoading) return <div>로딩중 ....</div>;

  clog(data)
  //clog("IN TREEMENU : CUR DATA : " + JSON.stringify(curTreeData));
  // 트리메뉴 접고 펼쳐지는 버튼 액션 
  function treeMenuOnClick(e) {
    e.preventDefault();
    if (!$(".treebar").hasClass("close")) {
      $(".treebar").addClass("close");
      $(".content").css({ width: "calc(100% - 40px)" }); //오른쪽 컨텐츠 너비 변경
    } else {
      $(".treebar").removeClass("close");
      $(".content").css({ width: "" });
    }
  }
  //모바일 트리토글 버튼 액션
  function treeToggleOnClick(e) {
    e.preventDefault();
    //모바일 트리토글 버튼 액션 트리메뉴 open 
    $(".treebar__toggleBtn").parent(".container").children(".treebar").addClass("active");
    $(".treebar__toggleBtn").parent(".container").children(".content").addClass("w100p");
    clog("click");

    //모바일 트리토글 버튼 액션 트리메뉴 shut
    $(".treebar.active .btn-tree").on("click", function () {
      $(".treebar").removeClass("active");
      $(".treebar.active .btn-tree").hide();
      //트리메뉴 토글 사이즈 최소범위       
      var mql = window.matchMedia("screen and (min-width: 768px)");
      if (mql.matches) {
        $(".box.treebar.close .btn-tree, .box.treebar .btn-tree").css({ display: "flex" });
      } else {
        $(".box.treebar.close .btn-tree, .box.treebar .btn-tree").css({ display: "" });
      }
    });
  };
  //const treeItem = data;
  //setCurTreeData(curTreeData);
  // function handleSpgClick(spgData) {
  //   clog("IN TREEMENU : handleSpgClick : " + JSON.stringify(spgData));
  //   // setParentCurTreeData(spgData);
  // }

  let isSelect: boolean = (Object.keys(curTreeData).length > 0) ? true : false;
  clog("IN TREEMENU : IS SELECTED : " + isSelect);
  return (
    <>
      {/* <!-- .treebar, 메뉴트리영역 --> */}
      <div className="box treebar">
        <div className="box__header">
          <p className="box__title">LS일렉트릭</p>
          <div className="box__etc">
            <button type="button" className="btn btn-tree" onClick={(e) => treeMenuOnClick(e)}>
              <span className="hide">트리메뉴접기펼치기</span>
            </button>
          </div>
        </div>
        <div className="box__search">
          <input type="text" placeholder="search..." />
          <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
        </div>
        {/* <!--220530, treearea를 감싸는 div class="scrollH treescroll" 태그 추가 : 스크롤스타일때문 추가함--> */}
        <div className="scrollH treescroll">
          <div className="treearea">
            {/* <!--220520, 트리영역 전체 수정--> */}
            {treeItem.map((company, idx) => (
              <ul key={company.companyId}>
                <li className="tree__depth1" >
                  <div className="tree__title"  >{company.companyName}</div>
                  <ul id="tree" className="tree">
                    {<TreeZone
                      data={company.zone}
                    />}
                  </ul>
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
      {/* <!-- //.treebar, 메뉴트리영역 --> */}

      {/*<!--220510, 트리플로팅버튼 추가-->*/}
      <a href="#" className="treebar__toggleBtn" onClick={(e) => treeToggleOnClick(e)} >
        <span className="hide">트리메뉴보기</span>
      </a>
    </>
  );
}
export default TreeMenuTest;


// //depth1 기존 
function TreeZone(props) {
  const zoneItem = props.data

  return (
    <>
      {/* <!--220520,첫번째뎁스 li에 클래스추가 tree__depth1--> */}
      {zoneItem.map((zone, idx) => (
        <li className="tree__depth1" key={zone.zoneId}>
          <input type="checkbox" id={"root" + idx + "-" + zone.zoneId} value={zone.zoneId} />
          <a href="#"  ><label htmlFor={"root" + idx + "-" + zone.zoneId}>{zone.zoneName}</label></a>
          {/* <!--220520,두번째뎁스 ul에 클래스추가 tree__depth2--> */}
          <ul className="tree__depth2">
            {<TreeRoom
              data={zone.room}
            />}
          </ul>
        </li>
      ))}
    </>
  )
}
//depth2
function TreeRoom(props) {
  const roomItem = props.data

  return (
    <>
      {roomItem.map((room, idx) => (
        <li key={room.roomId}>
          <input type="checkbox" id={"node" + idx + room.roomId} value={room.roomId} />
          <a href="#" ><label htmlFor={"node" + idx + room.roomId} data-val={room.roomId}>{room.roomName}</label></a>
          {/* <!--220520,세번째뎁스 ul에 클래스추가 tree__depth3--> */}
          <ul className="tree__depth3">
            {<TreeSpg
              data={room.spg}
            />}
          </ul>
        </li>
      ))}
    </>
  )
}
//  //depth3 
export function TreeSpg(props) {

  const spgItem = props.data;
  const [depth3On, setDepth3On] = useState(false);
  const depth3Off = useState("-1");

  // 해당  spg id 이벤트
  function spgOnclick(e) {
    //var activeLayer = actTag.getAttribute("data-pop");

    var spgVal = (e.target.tagName == "LABEL") ? e.target.getAttribute("data-val") : "";
    var treeTag = (e.target.tagName == "LABEL") ? e.currentTarget : e.target
    //alert(spgVal);
    $(".tree .tree__depth3 li a").removeClass("on");

    if (depth3Off !== treeTag.id) {
      treeTag.className = "on";
    } else {
      treeTag.className = (depth3On) ? "" : "on";
    }
    setDepth3On(depth3On ? false : true)
    // handleSpgFunc(props);
  }

  return (
    <>
      {spgItem.map((spg, idx) => (
        <li key={spg.spgId}>
          <input type="checkbox" id={"node" + idx + "-" + spg.spgId} value={spg.spgId} />
          {/* <!--선택된 메뉴 className="on"--> */}
          <a href="#" onClick={(e) => spgOnclick(e)} >
            {/*  <a href="#" className={( (props.curTreeData.company.companyId == props.company.companyId)&&
                                   (props.curTreeData.zone.zoneId == props.zone.zoneId)&&
                                   (props.curTreeData.room.roomId == props.room.roomId)&&
                                   (props.curTreeData.spg.spgId == spg.spgId) )?"on":""}
                       onClick={(e)=>spgOnclick(e, 
                                     props.handleSpgClick,
                       {"company":props.company, "zone":props.zone, "room":props.room, "spg":spg}) } > */}
            {/*<a href="#" 
                       onClick={(e)=>spgOnclick(e, 
                                     props.handleSpgClick,
                       {"company":props.company, "zone":props.zone, "room":props.room, "spg":spg}) } >*/}
            <label data-testid="spgId" id="lastTree" htmlFor={"node" + idx + "-" + spg.spgId} className="lastTree" data-val={spg.spgId}  >
              {/* {spg.spgName} */}VCB
            </label>
          </a>
        </li>
      ))}
    </>
  )
}

