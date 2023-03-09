import React, { useState, useEffect } from "react";
import { useAsync } from "react-async";
// design
import styled from "styled-components";
import $ from "jquery"
import "/static/css/login.css"
// recoil
// utils

import * as HttpUtil from "../../../utils/api/HttpUtil";


function FindPwMatchTest(props) {
  const isRunYn = props.isRunYn;
  const layerList = props.layerList;

  const [isFindPw, setIsFindPw] = useState(isRunYn); // false
  const [userId, setUserId] = useState("barsk@hanmail.net"); //test@test.com
  const [userName, setUserName] = useState("bsKimH"); //bsKim
  const [userPhone, setUserPhone] = useState("01012345678"); //01000000001
  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState([{ "field": "", "msg": "" }]);
  const [resUserIdMsg, setUserIdMsg] = useState(""); //test@test.com
  const [resUserNameMsg, setUserNameMsg] = useState(""); //bsKim
  const [resPhoneNumberMsg, setPhoneNumberMsg] = useState(""); //01000000001


  // useAsync call axios
  const { data: data, error, isLoading, reload, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "PUT",
    appPath: "/api/v2/auth/password/init",
    appQuery: { userId: userId, userName: userName, phoneNumber: userPhone, },
  });

  if (isLoading) { <>loading ......</> }
  useEffect(() => {
    if (data) {
      if (data.codeNum == 200) {
        setResErrorCode(200);
        setUserIdMsg(data.data.msg);
        setIsFindPw(true);
      } else {
        setResErrorCode(data.codeNum);
        setResErrorMsg(data.errorList);
        setUserIdMsg("");
        setUserNameMsg("");
        setPhoneNumberMsg("");
        data.errorList.map((errMsg) => {
          (errMsg.field === "userId") && setUserIdMsg(errMsg.msg);
          (errMsg.field === "userName") && setUserNameMsg(errMsg.msg);
          (errMsg.field === "phoneNumber") && setPhoneNumberMsg(errMsg.msg);
        });
      }
    }
  }, [data]);

  function layerClose(tagId) {
    var othLayer = tagId;
    //닫기 버튼 , 배경 클릭 시
    $("#" + othLayer)
      .children()
      .children(".js-close")
      .trigger("click", function (ee) {
        $("#" + othLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      });
    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + othLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $(".dimm").stop().hide().css("z-index", "11");
      });
  }

  function onClickCancelPw(e) {
    setResErrorCode(200);
    setIsFindPw(false);
    setUserId("");
    setUserName("");
    setUserPhone("");
    setUserIdMsg("");
    setUserNameMsg("");
    setPhoneNumberMsg("");

    layerList.map((olayer) => {
      layerClose(olayer);
    });
  }

  return (
    <>
      {/*<!-- 비밀번호 찾기 팝업 -->*/}
      <div id="findPw" className="popup-layer js-layer layer-out hidden"> {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 -->*/}
        <div className="popup__head">
          <h1>비밀번호 찾기</h1>
          <button className="btn btn-close js-close" onClick={(e) => onClickCancelPw(e)}><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          {(!isFindPw) &&
            <form action="" method="" name="popfindpw">
              <ul className="form__input">
                <li>
                  <label htmlFor="userId" className="star">아이디</label>
                  <div className="input__area"> {/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건 div className="input__area" 태그로 감쌈... -->*/}
                    <input type="text" data-testid="findpwId" id="findUserId" placeholder="ex) abc@company.com"
                      value={userId}
                      className={(resUserIdMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserId(e.target.value)}
                    />  {/*<!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨, 클래스 input-error 넣으면 p태그는 자동으로 노출됨 -->*/}
                    <p data-testid="findpwerrortxt1" className="input-errortxt">{resUserIdMsg}{/*필수 입력 항목입니다.*/}</p>
                  </div>
                </li>
                <li>
                  <label htmlFor="username2" className="star">이름</label>
                  <div className="input__area"> {/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건 div className="input__area" 태그로 감쌈... -->*/}
                    <input type="text" data-testid="findpwName" id="username2" placeholder="이름을 입력하세요"
                      value={userName}
                      className={(resUserNameMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserName(e.target.value)}
                    />  {/*<!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨, 클래스 input-error 넣으면 p태그는 자동으로 노출됨 -->*/}
                    <p className="input-errortxt">{resUserNameMsg}{/*필수 입력 항목입니다.*/}</p>
                  </div>
                </li>
                <li>
                  <label htmlFor="userphone1" className="star">연락처</label>
                  <div className="input__area">
                    <input type="tel" data-testid="findpwPhone" id="userphone1" placeholder="숫자만 입력하세요"
                      value={userPhone}
                      className={(resPhoneNumberMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                    {/*<input type="tel" id="userphone1" telOnly="true" placeholder="숫자만 입력하세요" value="숫자만 입력하세요" className="input-error" />  */}
                    <p className="input-errortxt">{resPhoneNumberMsg}{/*필수 입력 항목입니다.*/}</p>
                  </div>
                </li>
              </ul>
            </form>
          }
          {(isFindPw) &&
            <div className="complete-txt"> {/*<!--비밀번호 찾기 완료일경우 form 대신 노출해주세요 / 완료일경우 하단 버튼 변경됨(확인)-->*/}
              <p className="tit">{resUserIdMsg}{/*아래 메일 주소로 새 비밀번호가 전송 되었으니,
             로그인 후 비밀번호를 변경해 주세요.*/}</p>
              <p>{userId}</p>
            </div>
          }
        </div>
        <div className="popup__footer">
          {(!isFindPw) && <button type="button" className="js-close bg-gray" onClick={(e) => onClickCancelPw(e)}><span>취소</span></button>}
          <button data-testid="findPwButton" type="button" onClick={run}><span data-testid="findpwButtonId">찾기</span></button>
          {(isFindPw) && <button type="button" className="js-close" onClick={(e) => onClickCancelPw(e)}><span>확인</span></button>}
        </div>
      </div>
      {/*<!-- //비밀번호 찾기 팝업 -->*/}
    </>
  );
} export default FindPwMatchTest; 