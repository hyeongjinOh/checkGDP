/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-10-08
 * @brief EHP QR 스캔 기능 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType, } from '@zxing/library';
import * as CUTIL from "../../../utils/commUtils"

/**
 * @brief EHP QR 스캔 컴포넌트
 * @param - 
 * @returns react components
 */

function Scan(props) {
  //props
  const qrSerial = props.qrSerial;
  const setQrSerial = props.setQrSerial;
  const setQrTimeOut = props.setQrTimeOut;
  const setVideo = props.setVideo;
  const errText = props.errText;
  const setErrText = props.setErrText;
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [timeOut, setTimeOut] = useState(true);
  const [text, setText] = useState("")

  const camera = useRef(null);
  const hints = new Map();
  // QR 및 바코드 모두 가능
  const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.CODE_128, BarcodeFormat.CODABAR, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_39, BarcodeFormat.CODE_93];
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  const Scan = new BrowserMultiFormatReader(hints);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      // video: { facingMode: "user" }, //전면

      video: { facingMode: { exact: "environment" } }, //후면
    })
      .then(stream => {
        setLocalStream(stream);

      }).catch(err => {
        setErrText(err)
      })
    return () => {
      Stop();
    }
  }, []);
  // text 
  useEffect(() => {

    if (text.length > 0) {

      var textvalue = text.split(" ");
      if (textvalue.length < 2) {
        if (text.includes("http://") || text.includes("https://")) {
          alert(text + "는 링크로 사용 불가능 합니다.")
          setVideo(false);
          var btnCommentOpen = document.getElementById("pop-qr-open");
          var btnCommentClose = document.getElementById("pop-qr-scan");
          var btnCommentQr = document.getElementById("pop-qr");
          var body = document.body;
          var dimm = body.querySelector(".dimm");

          if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
          if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
          if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
          setQrTimeOut(true);
        } else {

          setQrSerial(textvalue);
          setVideo(false);
          var btnCommentOpen = document.getElementById("pop-qr-open");
          var btnCommentClose = document.getElementById("pop-qr-scan");
          var btnCommentQr = document.getElementById("pop-qr");
          var body = document.body;
          var dimm = body.querySelector(".dimm");

          if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
          if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
          if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
          setQrTimeOut(false);
        }

      } else {

        if (text.includes("    ")) {
          alert(textvalue + "는 사용 불가능한 QR 번호입니다.");
          setVideo(false);
          var btnCommentOpen = document.getElementById("pop-qr-open");
          var btnCommentClose = document.getElementById("pop-qr-scan");
          var btnCommentQr = document.getElementById("pop-qr");
          var body = document.body;
          var dimm = body.querySelector(".dimm");

          if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
          if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
          if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
          setQrTimeOut(true);
        } else {
          const textArr1 = textvalue.filter((qr, idx) => (idx == 0))
          const textArr2 = textvalue[1].split("\r\n", 2)
          const textArr3 = textvalue.toString().split("\r")
          var btnCommentOpen = document.getElementById("pop-qr-open");
          var btnCommentClose = document.getElementById("pop-qr-scan");
          var btnCommentQr = document.getElementById("pop-qr");
          var body = document.body;
          var dimm = body.querySelector(".dimm");

          if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");
          if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
          if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
          if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
          setVideo(false);
          setQrTimeOut(false);

          var serialTxt = [textArr1, textArr2, textArr3.filter((qr, idx) => (idx != 0) && (idx != 1))]
          setQrSerial(serialTxt);
        }

      }
    }
  }, [text]);



  // ttme OUT
  useEffect(() => {
    let timer = setTimeout(() => { setTimeOut(false) }, 60000);
    if (timeOut === false) {
      setVideo(false);
      var btnCommentOpen = document.getElementById("pop-qr-open");
      var btnCommentClose = document.getElementById("pop-qr-scan");
      var btnCommentQr = document.getElementById("pop-qr");
      var body = document.body;
      var dimm = body.querySelector(".dimm");

      if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
      if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");
      if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
      if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
      if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
      setQrTimeOut(true);

    }
    return () => { clearTimeout(timer) }

  }, [timeOut]);
  //  
  useEffect(() => {
    if (!camera.current)
      return;
    if (localStream && camera.current) {
      Scanning();
    }
    return () => {
      Stop();
    }
  }, [localStream]);

  //
  const req = useRef<any>();
  const Scanning = () => {
    // const t = await Scan.decodeOnce();
    if (localStream && camera.current) {
      try {
        const data = Scan.decodeFromStream(localStream, camera.current, (data, err) => {
          if (data) {
            setText(data.getText());
            // Scan.stopContinuousDecode();
          }
         
        });

      } catch (error) {
        // alert("QR 이나 바코드 에러");
      }
    }

  }
  const userOrback = () => {
    if (localStream) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, //전면
      })
    } else {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }, //후면
      })
    }
  }


  const Stop = () => {
    if (localStream) {
      const vidTrack = localStream.getVideoTracks();
      vidTrack.forEach(track => {
        localStream.removeTrack(track);
      });
    }
  }
  return (
    <div>
      <video ref={camera} id="video" style={{ "width": "100%", "height": "700px", "objectFit": "cover" }} autoPlay muted playsInline />

      {/* <button onClick={() => userOrback()}>{(localStream) ?  "전면" :  "후면"}</button> */}
      {/* <div>시리얼 번호 :{(text)&&text.split(" ")[1].toString().split("\n",2)}</div> */}
      {/* <div>시리얼 번호 :{text}</div> */}
    </div>

  );
};



export default Scan;