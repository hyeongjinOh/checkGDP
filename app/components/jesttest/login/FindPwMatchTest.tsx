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
    //?????? ?????? , ?????? ?????? ???
    $("#" + othLayer)
      .children()
      .children(".js-close")
      .trigger("click", function (ee) {
        $("#" + othLayer).addClass("hidden"); //?????? ?????? ?????????
        $("body").css("overflow-y", "auto"); //body ????????? ?????? ??????
      });
    //?????? ????????? ????????? ??????????????? ?????? ????????? (???????????? ????????? ??? ?????? ????????? ?????? ??????)
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
      {/*<!-- ???????????? ?????? ?????? -->*/}
      <div id="findPw" className="popup-layer js-layer layer-out hidden"> {/*<!-- layer-out ????????? : ?????? ?????? ????????? ????????? ?????? -->*/}
        <div className="popup__head">
          <h1>???????????? ??????</h1>
          <button className="btn btn-close js-close" onClick={(e) => onClickCancelPw(e)}><span className="hide">??????</span></button>
        </div>
        <div className="popup__body">
          {(!isFindPw) &&
            <form action="" method="" name="popfindpw">
              <ul className="form__input">
                <li>
                  <label htmlFor="userId" className="star">?????????</label>
                  <div className="input__area"> {/*<!-- 220520 ????????????(???????????????????????? ?????????.???????????????????????????)??? ????????? div className="input__area" ????????? ??????... -->*/}
                    <input type="text" data-testid="findpwId" id="findUserId" placeholder="ex) abc@company.com"
                      value={userId}
                      className={(resUserIdMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserId(e.target.value)}
                    />  {/*<!--220520 ??????????????? ?????? ????????? input-error ????????????, <p className="input-errortxt"> ?????????, ????????? input-error ????????? p????????? ???????????? ????????? -->*/}
                    <p data-testid="findpwerrortxt1" className="input-errortxt">{resUserIdMsg}{/*?????? ?????? ???????????????.*/}</p>
                  </div>
                </li>
                <li>
                  <label htmlFor="username2" className="star">??????</label>
                  <div className="input__area"> {/*<!-- 220520 ????????????(???????????????????????? ?????????.???????????????????????????)??? ????????? div className="input__area" ????????? ??????... -->*/}
                    <input type="text" data-testid="findpwName" id="username2" placeholder="????????? ???????????????"
                      value={userName}
                      className={(resUserNameMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserName(e.target.value)}
                    />  {/*<!--220520 ??????????????? ?????? ????????? input-error ????????????, <p className="input-errortxt"> ?????????, ????????? input-error ????????? p????????? ???????????? ????????? -->*/}
                    <p className="input-errortxt">{resUserNameMsg}{/*?????? ?????? ???????????????.*/}</p>
                  </div>
                </li>
                <li>
                  <label htmlFor="userphone1" className="star">?????????</label>
                  <div className="input__area">
                    <input type="tel" data-testid="findpwPhone" id="userphone1" placeholder="????????? ???????????????"
                      value={userPhone}
                      className={(resPhoneNumberMsg.length <= 0) ? "" : "input-error"}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                    {/*<input type="tel" id="userphone1" telOnly="true" placeholder="????????? ???????????????" value="????????? ???????????????" className="input-error" />  */}
                    <p className="input-errortxt">{resPhoneNumberMsg}{/*?????? ?????? ???????????????.*/}</p>
                  </div>
                </li>
              </ul>
            </form>
          }
          {(isFindPw) &&
            <div className="complete-txt"> {/*<!--???????????? ?????? ??????????????? form ?????? ?????????????????? / ??????????????? ?????? ?????? ?????????(??????)-->*/}
              <p className="tit">{resUserIdMsg}{/*?????? ?????? ????????? ??? ??????????????? ?????? ????????????,
             ????????? ??? ??????????????? ????????? ?????????.*/}</p>
              <p>{userId}</p>
            </div>
          }
        </div>
        <div className="popup__footer">
          {(!isFindPw) && <button type="button" className="js-close bg-gray" onClick={(e) => onClickCancelPw(e)}><span>??????</span></button>}
          <button data-testid="findPwButton" type="button" onClick={run}><span data-testid="findpwButtonId">??????</span></button>
          {(isFindPw) && <button type="button" className="js-close" onClick={(e) => onClickCancelPw(e)}><span>??????</span></button>}
        </div>
      </div>
      {/*<!-- //???????????? ?????? ?????? -->*/}
    </>
  );
} export default FindPwMatchTest; 