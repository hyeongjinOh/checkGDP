/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

/**
 * @brief EHP 사업장 전기실 관리 - 전기실 List 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */


//component
function RoomView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const isMobile = props.isMobile;
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;
  const setParentCurTree = props.setCurTree;
  const setParentWorkMode = props.setWorkMode;
  const setParentCurTabMenu = props.setCurTabMenu;


  //mobile check
  const mobileRef = useRef(null); // Mobile Check용

  useEffect(() => { // resize handler
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);
  useEffect(() => { // re-rendering mobile check
    if (CUTIL.isnull(mobileRef)) return;
    const mobileTag = mobileRef.current;
    if (!CUTIL.isnull(mobileTag)) {
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);

  ////////////////////////////////////////////////////////////////////////////
  const [roomInfo, setRoomInfo] = useState(null);
  const [errorList, setErrorList] = useState([]);
  const { data: retRoom, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/subzone/room/detail`,
    appQuery: { roomId: curTree.room.roomId },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: curTree.room.roomId + curTree.reload
  });

  useEffect(() => {
    if (retRoom) {
      if (retRoom.codeNum == CONST.API_200) {
        //clog("IN ROOM : RES : " + JSON.stringify(retRoom.body));
        setParentPopWin("pop-area-right-page-info",
          <MobileRoomView
            curTree={curTree}
            roomInfo={retRoom.body}
            errorList={errorList}
            onClickTreeOnOff={onClickTreeOnOff}
            onClickUpdateRoom={onClickUpdateRoom}
            onClickDoDeleteRoom={onClickDoDeleteRoom}
            onClickDeviceInsert={onClickDeviceInsert}
          />
        );
        setRoomInfo(retRoom.body);
      } else {
        setErrorList(retRoom.body.errorList);
      }
    }
  }, [curTree, retRoom]);
  //////////////////////////////////////////////////////////////////////////

  //(roomInfo)
  //?clog("IN ROOMVIEW : INIT : roomInfo : " + JSON.stringify(roomInfo))
  //:clog("IN ROOMVIEW : INIT : roomInfo : " + "null");
  //clog("IN SITEIVEW : INIT : zoneInfo : " + (roomInfo)?JSON.stringify(roomInfo.zone):"null");

  async function onClickDoDeleteRoom(e, room) {
    clog("IN ROOMVIEW : onClickDoDeleteRoom : " + JSON.stringify(room));
    var isOk = confirm(`${room.roomName}을(를) 삭제하시겠습니까?`);
    if (!isOk) return;


    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": "/api/v2/product/usertree",
      appQuery: {
        "productId": room.roomId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN ROOM-DELETE: ret : " + JSON.stringify(data.body));
        alert(CONST.FLD_MSG_DELETE_COMMON);
        setParentCurTree("SUBZONE", // 하위 삭제시 상위 호출
          {
            ...curTree,
            room: { "roomId": "", "roomName": "" },
          }
        );
        setParentWorkMode("READ");

      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
        //alert(`ERROR : ${room.roomName} : ` + JSON.stringify(data.body.errorList));
        alert(data.body.errorList[0].msg);
      }
    }
    //return data;
  }

  // 기기등록 tab 및 목록으로 이동
  function onClickDeviceInsert(e) {
    e.stopPropagation();
    CUTIL.jsclose_Popup("pop-area-right-page-info");
    //mainlayout tab 데이터 확인 필요
    setParentCurTabMenu({ tabId: 1, tabName: "기기 등록 관리", tabType: "TAB_DEVICE" });
    setParentWorkMode("LIST");
    //setParentAdminType("ROOM")
    CUTIL.jsopen_s_Popup(e, isMobile);
  }

  async function onClickTreeOnOff(e, room) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/product/usertree",
      appQuery: {
        "product": "room",
        "productId": room.roomId,
        "approval": room.approval,
        "isontree": !room.isontree,
        "sort": room.sort
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == 200) {
        /*
        setParentCurTree("SUBZONE", // 업데이트시 자신 호출
          {
            ...curTree,
            room: { "roomId": "", "roomName": "" },
          }
        );
        */
        setParentCurTree("ROOM", // 업데이트시 자신 호출
          {
            ...curTree,
            room: { "roomId": room.roomId, "roomName": room.roomName },
            reload: true
          }
        );

        setParentWorkMode("READ");
      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
      }
    }
    //return data;
  }

  function onClickUpdateRoom(e, room) {
    setParentCurTree("ROOM", // 업데이트시 자신 호출
      {
        ...curTree,
        room: { "roomId": room.roomId, "roomName": room.roomName },
        //reload : true
      }
    );

    setParentWorkMode("UPDATE");
  }

  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
      {(roomInfo) && <div className="area__right" ref={mobileRef} >
        <ul className="page-loca">
          <li>{curTree.company.companyName}</li>
          <li>{curTree.zone.zoneName}</li>
          <li>{curTree.subZone.subZoneName}</li>
          <li>{roomInfo.roomName}</li>
        </ul>
        <div className="page-top">
          <h2>{roomInfo.roomName}</h2>
          <div className="top-button">
            <button type="button" className="btn-edit"
              onClick={(e) => onClickUpdateRoom(e, roomInfo)}
            >
              <span className="hide">수정</span>
            </button>
            <button type="button"
              className="btn-delete"
              onClick={(e) => onClickDoDeleteRoom(e, roomInfo)}>
              <span className="hide">삭제</span>
            </button>
          </div>
        </div>

        {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지 workplace__info 클래스 추가 -->*/}
        <div className="area__right_content workplace__info">
          <div className="content__info">
            <h3 className="hide">상세사업장 정보</h3>
            <ul>
              {(userInfo.loginInfo.role == CONST.USERROLE_ADMIN) ?
                "" :
                <li>
                  <p className="tit">TREE</p>
                  {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                  {/**className={(errorList.filter(err=>(err.field==="roomName")).length>0)?"input-error":""} */}
                  <p className={`txt ${(roomInfo.isontree) ? "treeon" : "treeoff"}`}
                    onClick={(e) => onClickTreeOnOff(e, roomInfo)}
                  >
                    <span className="hide">{(roomInfo.isontree) ? "on" : "off"}</span>
                  </p>
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "isontree")).map((err) => err.msg)}</p>
                </li>
              }
              {/* <li>
                <p className="tit">전기실 담당자</p>
                <p className="txt">{roomInfo.inCharge}</p>
              </li>
              <li>
                <p className="tit">연락처</p>
                <p className="txt">{roomInfo.contact}</p>
              </li> */}
              <li>
                <p className="tit">메모</p>
                <p className="txt">{roomInfo.memo}</p>
              </li>
              <li>
                <p className="tit">전기실 도면</p>
                <ul className="filelist">
                  {(roomInfo.fileList) && roomInfo.fileList.map((file, idx) => (
                    <li key={`file_${idx.toString()}`}>
                      <a href={file.url} target="_blank" rel='noreferrer'>
                        <span>{file.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <p className="tit">등록 설비 수</p>
                <p className="txt">{roomInfo.itemCount}
                  <button type="button" className="btn-add"
                    data-pop="pop-list"
                    onClick={(e) => onClickDeviceInsert(e)}>
                    <span>기기 등록</span>
                  </button>
                </p>
              </li>
            </ul>
          </div>
          {/*<!--20220914 jihoon -->*/}
          <div className="content__list scrollH">
            <div className="listbox__top">
              <h3>사용자 목록</h3>
            </div>
            <div className="tbl-list">
              <table summary="번호,사용자 타입,이름,회사,연락처,마지막 로그인 항목으로 구성된 사용자 목록 입니다.">
                <caption>
                  사용자 목록
                </caption>
                <colgroup>
                  <col style={{}} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="txt-center">번호</th>
                    <th scope="col">사용자 타입</th>
                    <th scope="col">이름</th>
                    <th scope="col">회사</th>
                    <th scope="col">연락처</th>
                    <th scope="col">마지막 로그인</th>
                  </tr>
                </thead>
                <tbody>
                  {roomInfo.userList.map((user, idx) => (
                    <tr key={`room_user_${idx.toString()}`}>
                      <td className="txt-center">{user.rownumber}</td>
                      <td><span /* className="siteadmin" */>
                        {(user.role == CONST.USERROLE_ADMIN) ? "Admin"
                          : (user.role == CONST.USERROLE_ENGINEER) ?
                            "Engineer"
                            : (user.role == CONST.USERROLE_USER) ?
                              "User"
                              : "nodata"
                        }
                      </span></td>
                      <td className="d-sm-none">{user.userName}</td>
                      <td className="d-sm-none">{user.companyName}</td>
                      <td className="d-sm-none">{user.phoneNumber}</td>
                      <td className="d-sm-none">{user.updatedTime}</td>
                      <td className="d-lm-none">
                        <p>{user.userName}</p>
                        <p>{user.phoneNumber}</p>
                      </td>
                      <td className="d-lm-none">
                        <p>{user.companyName}</p>
                        <p>{user.updatedTime}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
      </div>
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )
};
export default RoomView;


function MobileRoomView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curTree = props.curTree;
  const roomInfo = props.roomInfo;
  const errorList = props.errorList;
  const onClickTreeOnOff = props.onClickTreeOnOff;
  const onClickUpdateRoom = props.onClickUpdateRoom;
  const onClickDoDeleteRoom = props.onClickDoDeleteRoom;
  const onClickDeviceInsert = props.onClickDeviceInsert;
  return (
    <>
      {(roomInfo) &&
        <div className="popup__body">
          {/*<!--area__right, 오른쪽 영역-->*/}
          <ul className="page-loca">
            <li>{curTree.company.companyName}</li>
            <li>{curTree.zone.zoneName}</li>
            <li>{curTree.subZone.subZoneName}</li>
            <li>{roomInfo.roomName}</li>
          </ul>
          <div className="page-top">
            <h2>{roomInfo.roomName}</h2>
            <div className="top-button">
              <button type="button" className="btn-edit"
                onClick={(e) => onClickUpdateRoom(e, roomInfo)}
              >
                <span className="hide">수정</span>
              </button>
              <button type="button" className="btn-delete" onClick={(e) => onClickDoDeleteRoom(e, roomInfo)}>
                <span className="hide">삭제</span>
              </button>
            </div>
          </div>
          {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지 workplace__info 클래스 추가 -->*/}
          <div className="area__right_content workplace__info">
            <div className="content__info">
              <h3 className="hide">상세사업장 정보</h3>
              <ul>
                {(userInfo.loginInfo.role == CONST.USERROLE_ADMIN) ?
                  "" :
                  <li>
                    <p className="tit">TREE</p>
                    {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                    <p className={`txt ${(roomInfo.isontree) ? "treeon" : "treeoff"}`}
                      onClick={(e) => onClickTreeOnOff(e, roomInfo)}
                    >
                      <span className="hide">{(roomInfo.isontree) ? "on" : "off"}</span>
                    </p>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "isontree")).map((err) => err.msg)}</p>
                  </li>
                }
                {/* <li>
                  <p className="tit">전기실 담당자</p>
                  <p className="txt">{roomInfo.inCharge}</p>
                </li>
                <li>
                  <p className="tit">연락처</p>
                  <p className="txt">{roomInfo.contact}</p>
                </li> */}
                <li>
                  <p className="tit">메모</p>
                  <p className="txt">{roomInfo.memo}</p>
                </li>
                <li>
                  <p className="tit">전기실 도면</p>
                  <ul className="filelist">
                    {(roomInfo.fileList) && roomInfo.fileList.map((file, idx) => (
                      <li key={`file_${idx.toString()}`}>
                        <a href={file.url} target="_blank" rel='noreferrer'>
                          <span>{file.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <p className="tit">등록 설비 수</p>
                  <p className="txt">{roomInfo.itemCount}
                    <button type="button" className="btn-add"
                      data-pop="pop-list"
                      onClick={(e) => onClickDeviceInsert(e)}>
                      <span>기기 등록</span>
                    </button>
                  </p>
                </li>
              </ul>
            </div>
            {/*<!--20220914 jihoon -->*/}
            <div className="content__list scrollH">
              <div className="listbox__top">
                <h3>사용자 목록</h3>
              </div>
              <div className="tbl-list">
                <table summary="번호,사용자 타입,이름,회사,연락처,마지막 로그인 항목으로 구성된 사용자 목록 입니다.">
                  <caption>
                    사용자 목록
                  </caption>
                  <colgroup>
                    <col style={{}} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="txt-center w12p">번호</th>
                      <th scope="col" className="w12p">사용자 타입</th>
                      <th scope="col">이름</th>
                      <th scope="col">회사</th>
                      <th scope="col">연락처</th>
                      <th scope="col">마지막 로그인</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomInfo.userList.map((user, idx) => (
                      <tr key={`room_user_${idx.toString()}`}>
                        <td className="txt-center w12p">{user.rownumber}</td>
                        <td className="w12p"><span /* className="siteadmin" */> {(user.role == CONST.USERROLE_ADMIN) ? "Admin"
                          : (user.role == CONST.USERROLE_ENGINEER) ?
                            "Engineer"
                            : (user.role == CONST.USERROLE_USER) ?
                              "User"
                              : "nodata"
                        }</span></td>
                        <td className="d-sm-none">{user.userName}</td>
                        <td className="d-sm-none">{user.companyName}</td>
                        <td className="d-sm-none">{user.phoneNumber}</td>
                        <td className="d-sm-none">{user.updatedTime}</td>
                        <td className="d-lm-none">
                          <p>{user.userName}</p>
                          <p>{user.phoneNumber}</p>
                        </td>
                        <td className="d-lm-none">
                          <p>{user.companyName}</p>
                          <p>{user.updatedTime}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      }
      {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
    </>

  )

}