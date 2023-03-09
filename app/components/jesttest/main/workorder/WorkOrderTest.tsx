/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-12-06
 * @brief EHP WorkOrder 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../../recoil/userState';

//utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const";
import * as HTTPUTIL from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
//
import { useTrans } from "../../../../utils/langs/useTrans";
import { urlState } from "../../../../recoil/menuState";
import { useNavigate } from "react-router-dom";


/**
 * @brief EHP WorkOrder 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function WorkOrderTest(props) {
  //t
  const t = useTrans();
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  //
  //props
  const { company, zone, subZone, room, spg } = props.curTreeData;
  const statusReload = props.statusReload;
  //
  const [WorkorderItem, setWorkorderItem] = useState(null);


  const { data: data, error, isLoading, reload, run } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: "/api/v2/product/company/zone/subzone/room/workorder/count",
    appQuery: {
      //companyId: company.companyId, 
      //zoneId: zone.zoneId,
      roomId: room.roomId,
      spgName: spg.spgName
    },
    userToken: userInfo.loginInfo.token,
    watch: room.roomId + spg.spgName + statusReload,
  });

  useEffect(() => {
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setWorkorderItem(data.body)
      } else {
        alert(data.errorList.map((err) => (err.msg)));
      }
    }
  }, [data, spg]);

  function onClickGoLink(url) {
    setRecoilUrlInfo(url);
    navigate(url);
  }


  return (
    <>
      {/* <!-- 221206, Work Order 추가 --> */}
      <article className="box">
        <div className="box__header">
          <p className="box__title">Work Order</p>
          <div className="box__etc">
            <button type="button" className="btn btn-go" onClick={e=>onClickGoLink(CONST.URL_SERVICEWORKORDER)} ><span className="hide">바로가기</span></button>
          </div>
        </div>
        {(WorkorderItem) &&
          <div className="box__body">
            <div className="box__status">
              <ul className="status__info">
                <li>
                  <p>{room.roomName + "/" + spg.spgName}</p>
                  <p><strong>{WorkorderItem.totalCount}</strong><span>개</span></p>
                </li>
              </ul>
              <p className="txt-info mt-6 ml-15 mr-20 mb-52">* Work Order는 LS일렉트릭의 Engineer에게 e-HC [Premium] , [Advanced] 점검을 요청한 내역만 표시됩니다.</p>
              <ul className="step-order">
                <li>
                  <p className="tit">요청</p>
                  <p className="total-num"><strong>{WorkorderItem.requestCount}</strong><span> ea</span></p>
                </li>
                <li>
                  <p className="tit">접수</p>
                  <p className="total-num"><strong>{WorkorderItem.acceptedCount}</strong><span> ea</span></p>
                </li>
                <li>
                  <p className="tit">진행 중</p>
                  <p className="total-num"><strong>{WorkorderItem.ingCount}</strong><span> ea</span></p>
                </li>
                <li>
                  <p className="tit">완료</p>
                  <p className="total-num"><strong>{WorkorderItem.doneCount}</strong><span> ea</span></p>
                </li>
              </ul>
            </div>
          </div>
        }
      </article>
    </>
  )
}



export default WorkOrderTest;