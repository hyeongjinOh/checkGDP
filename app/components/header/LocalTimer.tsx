/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */  
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-09
 * @brief Local Clock 시계 컴포넌트
 * 1초당 rerandering 발생
 *
 ********************************************************************/
 import React, {useState, useEffect} from "react";
 import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
 // recoil state
 import { userInfoState, authState } from '../../recoil/userState';
 //
 import clog from "../../utils/logUtils"
 /**
  * @brief Local Clock 컴포넌트
  * @param 
  * @returns react components
  */
 function LocalTimer() {
   //const setRecoilUserInfo = useSetRecoilState(userState); // recoil userState
   const userInfo = useRecoilValue(userInfoState);
   const isAuth = useRecoilValue(authState);
 
   const [localTime, setLocalTime] = useState(new Date());
   let timer: any = null;
     
   useEffect(() => {
     timer = setInterval(() => {
       setLocalTime(new Date());
     }, 1000);
     return () => {
       clearInterval(timer);
     };
   }, []);
 
   return (
     <time>{localTime.toLocaleString()}</time>
   );
 }
 export default LocalTimer;