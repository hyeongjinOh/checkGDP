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
import {
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
  useResetRecoilState,
} from "recoil";
import { userInfoState, authState } from "../../../recoil/userState";
import {
  curSpgTreeState,
  nextSpgTreeState,
  beforeSpgTreeState,
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
  doneAssessmentState,
  checkStep,
  getStepDone,
} from "../../../recoil/assessmentState";

//
import $ from "jquery";
//import "/static/css/style.css"
//
import { useTrans } from "../../../utils/langs/useTrans";
//
import * as HttpUtil from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import useScript from "../../../utils/hooks/useHooks";
/**
 * @brief EHP Tree 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function TreeMenu(props) {
  const userInfo = useRecoilValue(userInfoState);
  //
  const curTreeData = useRecoilValue(curSpgTreeState);
  const setRecoilCurTreeData = useSetRecoilState(curSpgTreeState);

  //
  const [treeItem, setTreeItem] = useState([]);
  const setParentCurTreeData = props.setCurTreeData;
  //const [curTreeData, setCurTreeData] = useState({});
  const isOpen = props.hasOwnProperty("isOpen") ? props.isOpen : true;
  const setParentTreeOpen = props.hasOwnProperty("setTreeOpen") ? props.setTreeOpen : null;

  clog("IN TREEMENU : isOpen : " + isOpen);

  const {
    data: data,
    error,
    isLoading,
    reload,
    run,
  } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: `/api/v2/tree/${userInfo.userId}`,
    appQuery: {},
  });

  let defTreeData: any = {};

  useEffect(() => {
    if (data) {
      if (data.codeNum == 200) {
        data.body
          .filter((data, idx) => idx === 0)
          .map((company, idx) => {
            const zoneList = company.zone;
            zoneList &&
              zoneList
                .filter((data, idx) => idx === 0)
                .map((zone, idx) => {
                  const subZoneList = zone.subZone;
                  subZoneList &&
                    subZoneList
                      .filter((data, idx) => idx === 0)
                      .map((subZone, idx) => {
                        const roomList = subZone.room;
                        roomList &&
                          roomList
                            .filter((data, idx) => idx === 0)
                            .map((room, idx) => {
                              const spgList = room.spg;

                              spgList &&
                                spgList
                                  .filter((data, idx) => idx === 0)
                                  .map((spg, idx) => {
                                    defTreeData = {
                                      company: {
                                        id: company.companyId,
                                        name: company.companyName,
                                      },
                                      zone: {
                                        zoneId: zone.zoneId,
                                        zoneName: zone.zoneName,
                                      },
                                      subZone: {
                                        subZoneId: subZone.zoneId,
                                        subZoneName: subZone.zoneName,
                                      },
                                      room: {
                                        roomId: room.roomId,
                                        roomName: room.roomName,
                                      },
                                      spg: {
                                        spgId: spg.spgId,
                                        spgName: spg.spgName,
                                      },
                                    };
                                  });
                            });
                      });
                });
          });
        setTreeItem(data.body);
        setRecoilCurTreeData(defTreeData);
        //setParentCurTreeData(defTreeData);
        clog("IN TREEMENU : TREE-RETURN : " + JSON.stringify(data.body));
        //setCurTreeData(defTreeData);
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

  let isSelect: boolean = Object.keys(curTreeData).length > 0 ? true : false;
  //clog("IN TREEMENU : IS SELECTED : " + isSelect);
  return (
    <>
      {/* <!-- .treebar, 메뉴트리영역 --> */}
      <div className={`box treebar ${isOpen ? "" : "close"}`}>
        <div className="box__header">
          <p className="box__title">{isSelect && curTreeData.company.companyName}</p>
          <div className="box__etc">
            <button
              type="button"
              className="btn btn-tree"
              onClick={(e) => treeMenuOnClick(e)}
            >
              <span className="hide">트리메뉴접기펼치기</span>
            </button>
          </div>
        </div>
        <div className="box__search">
          <input type="text" placeholder="search..." />
          <button type="button" className="btn btn-search">
            <span className="hide">조회</span>
          </button>
        </div>
        {/* <!--220530, treearea를 감싸는 div class="scrollH treescroll" 태그 추가 : 스크롤스타일때문 추가함--> */}
        <div className="scrollH treescroll">
          <div className="treearea">
            {/* <!--220520, 트리영역 전체 수정--> */}
            {treeItem.map((company, idx) => (
              <ul key={company.companyId}>
                {/* <li> */}
                <div className="tree__title">LS전자</div>
                <ul id="tree" className="tree">
                  {isSelect && (
                    <TreeZone
                      curTreeData={curTreeData}
                      data={company.zone}
                      company={{ id: company.companyId, name: company.companyName }}
                      handleSpgClick={handleSpgClick}
                    />
                  )}
                </ul>
                {/* </li> */}
              </ul>
            ))}
          </div>
        </div>
      </div>
      {/* <!-- //.treebar, 메뉴트리영역 --> */}
    </>
  );
}
export default TreeMenu;

// //depth1 기존
function TreeZone(props) {
  const { data } = props;
  const zoneItem = data;
  let firstNode = 1;
  return (
    <>
      {/* <!--220520,첫번째뎁스 li에 클래스추가 tree__depth1--> */}
      {zoneItem.map((zone, idx) => (
        <li className="tree__depth1" key={zone.zoneId}>
          {/* <input type="checkbox" id={"root" + idx + "-" + zone.zoneId} value={zone.zoneId} /> */}
          <input
            type="checkbox"
            id={"root" + idx + "-" + zone.zoneName + "-" + ++firstNode}
            value={zone.zoneId}
          />
          {/* <a href="#"  ><label htmlFor={"root" + idx + "-" + zone.zoneId}>{zone.zoneName}???</label></a> */}
          {/* <a href="#"> */}
          <a>
            <label htmlFor={"root" + idx + "-" + zone.zoneName + "-" + firstNode++}>부산</label>
          </a>

          {/* <!--220520,두번째뎁스 ul에 클래스추가 tree__depth2--> */}
          <ul className="tree__depth2">
            {<TreeSubZone
              curTreeData={props.curTreeData}
              data={zone.subZone}
              company={props.company}
              zone={{ zoneId: zone.zoneId, zoneName: zone.zoneName }}
              handleSpgClick={props.handleSpgClick}
              // 20220627 id,htmlFor를 맞추기 위한 nodeId를 생성하여 중복없게 작성
              nodeId={firstNode}
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
  const subZoneItem = data;
  //20220627 nodeId 추가
  let secondNode = props.nodeId * 11;
  return (
    <>
      {subZoneItem.map((subZone, idx) => (
        <li key={subZone.subZoneId}>
          {/* <input type="checkbox" id={"node" + idx + room.roomId} value={room.roomId} /> */}
          <input
            type="checkbox"
            id={"node" + idx + "-" + subZone.subZoneName + ++secondNode}
            value={subZone.subZoneId}
          />
          {/* <a href="#" ><label htmlFor={"node" + idx + room.roomId} data-val={room.roomId}>{room.roomName}11</label></a> */}
          {/* <a href="#"> */}
          <a>
            <label
              htmlFor={"node" + idx + "-" + subZone.subZoneName + secondNode++}
              data-val={subZone.subZoneId}
            >
              메인
            </label>
          </a>

          {/* <!--220520,세번째뎁스 ul에 클래스추가 tree__depth3--> */}
          <ul className="tree__depth3">
            {
              <TreeRoom
                curTreeData={props.curTreeData}
                data={subZone.room}
                company={props.company}
                zone={props.zone}
                subZone={{
                  subZone: subZone.subZoneId,
                  subZoneName: subZone.subZoneName,
                }}
                handleSpgClick={props.handleSpgClick}
                // 20220627 id,htmlFor를 맞추기 위한 nodeId를 생성하여 중복없게 작성
                nodeId={secondNode}
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
  const roomItem = data;
  const akey = props.akey;
  let fourthNode = props.nodeId * 11;

  return roomItem.map((room, idx) => (
    <li key={akey + "_li_" + idx}>
      <input
        type="checkbox"
        id={idx + "_node1111_" + room.roomName + ++fourthNode}
      />
      {/* <a href="#"> */}
      <a>
        <label
          htmlFor={idx + "_node1111_" + room.roomName + fourthNode++}
          className="tree__depth3"
        >
          1전기실
        </label>
      </a>
      <ul className="tree__depth4">
        <TreeSpg
          curTreeData={props.curTreeData}
          data={room.spg}
          company={props.company}
          zone={props.zone}
          subZone={props.subZone}
          room={{ roomId: room.roomId, roomName: room.roomName }}
          handleSpgClick={props.handleSpgClick}
          nodeId={fourthNode}
        />
      </ul>
    </li>
  ));
}
////   depth3   ///////////////////////////   depth3   ///////////////////////////   depth3   ///////////////////////////

function TreeSpg(props) {
  const { data } = props;
  //clog("IN TREE SPG Id :" +companyId);
  const spgItem = data;
  const [depth3On, setDepth3On] = useState(false);
  const depth3Off = useState("-1");

  // 해당  spg id 이벤트
  function spgOnclick(e, handleSpgFunc, props) {
    //var activeLayer = actTag.getAttribute("data-pop");

    var spgVal =
      e.target.tagName == "LABEL" ? e.target.getAttribute("data-val") : "";
    var treeTag = e.target.tagName == "LABEL" ? e.currentTarget : e.target;
    //var treeTag = (e.target.tagName == "LABEL") ? e.target : e.currentTarget
    //alert(spgVal);

    //$(".tree .tree__depth3 li a").removeClass("on");
    const element = document.querySelector(".on");
    element.classList.remove("on");

    if (depth3Off !== treeTag.id) {
      treeTag.className = "on";
    } else {
      treeTag.className = depth3On ? "" : "on";
    }
    setDepth3On(depth3On ? false : true);
    handleSpgFunc(props);
  }
  // 20220627 nodeId 추가
  let thirdNode = props.nodeId * 11;
  return (
    <>
      {spgItem.map((spg, idx) => (
        <li key={spg.spgId}>
          {/* <input type="checkbox" id={"node" + idx + "-" + spg.spgId} value={spg.spgId} /> */}
          <input
            type="checkbox"
            id={"node" + idx + "-" + ++thirdNode}
            value={spg.spgId}
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
                ? "on"
                : ""
            }
            onClick={(e) =>
              spgOnclick(e, props.handleSpgClick, {
                company: props.company,
                zone: props.zone,
                subZone: props.subZone,
                room: props.room,
                spg: spg,
              })
            }
          >
            <label
              htmlFor={"node" + idx + props.company.companyName + "-" + thirdNode++}
              className="lastTree"
              data-val={spg.spgId}
            >
              VCB
            </label>
          </a>
        </li>
      ))}
    </>
  );
}
