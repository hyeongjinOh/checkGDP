/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */  
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-09
 * @brief Alarm 컴포넌트
 * 1초당 rerandering 발생
 *
 ********************************************************************/
import React, {useState, useEffect} from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
// recoil state
import { userInfoLoginState, authState } from '../../recoil/userState';
import { useTrans } from "../../utils/langs/useTrans";
//
import clog from "../../utils/logUtils"
import * as HTTPUTIL from "../../utils/api/HttpUtil"
import * as CONST from "../../utils/Const"
/**
* @brief Alarm 컴포넌트
* @param 
* @returns react components
*/
function AlarmCount(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const setParentAlarmCount = props.setAlarmCount;
  const alarmCountReload = props.alarmCountReload;
  const setParentAlarmCountReload = props.setAlarmCountReload;
  //
  const [alarmCount, setAlarmCount] = useState(0);

  useEffect(()=>{
    getAlarmCountUnRead();
  }, [alarmCountReload])

  let timer: any = null;
    
  async function getAlarmCountUnRead() {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "GET",
      appPath: `/api/v2/notice/unreadcount`,
      appQuery: {
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      if (data.codeNum == CONST.API_200) {
        //clog("IN ALARM COUNT : RES : " + JSON.stringify(data.body));
        setAlarmCount(data.body);
        setParentAlarmCount(data.body);
        setParentAlarmCountReload(false);
      } else {
      }
    }
  }

  useEffect(() => {
    timer = setInterval(() => {
      getAlarmCountUnRead();
    }, 60000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <p>{(alarmCount>99)?"99+":alarmCount}</p>
  );
}
export default AlarmCount;