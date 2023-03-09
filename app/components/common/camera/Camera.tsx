/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-10-01
 * @brief EHP Web Camera 기능 검토
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

/**
 * @brief EHP 웹캠 검토 컴포넌트
 * @param - 
 * @returns react components
 */

export default function Camera(props){
    const webcamRef = props.camera;
    // webcam 
    const videoConstraints = {
        width: 900,
        height: 1500,
        facingMode: "use"
        // facingMode:{ exact: "environment" }
    };
    //   window.open('https://frogue.danbee.ai/?chatbot_id=b5f7097d-ae5d-4bf2-b758-e5eb8929a05f','_blank','top=140,left=300,width=500,height=600,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,copyhistory=no,resizable=no');
    // window.eval("https://frogue.danbee.ai/?chatbot_id=b5f7097d-ae5d-4bf2-b758-e5eb8929a05f")
    return(
        <>
          <Webcam
           ref={webcamRef}
           audio={false}
        //    screenshotFormat ={"image/jpeg"}
           videoConstraints={videoConstraints}
           />
        </>
    )

}
