/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-12-06
 * @brief EHP Intro 컴포넌트
 *
 ********************************************************************/
import React from "react";
import { useNavigate } from 'react-router-dom';
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
// UTILS
import * as CONST from "../../../../utils/Const"
import * as utils from "./SiteUtilsTest"
/**
 * @brief EHP Intro 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */


//
function SiteIntroTest(props) {

  return (
    <>
      {/* <!-- main, 컨테이너영역 --> */}
      <main className="container">
        <section className="content">
          <article>
            <div className="content__title">
              <div className="title-wrap">
                <h1>{/* <img src={`${require("/static/img/intro_logo.png")}`} alt="LS ELECTRIC" className="mr-15" /> */}전력설비 진단점검 서비스</h1>
                <h2>{/* <img src={`${require("/static/img/intro_title.png")}`} alt="e-Health Portal" /> */}서비스 소개</h2>
                <p>e-Health Portal은 LS ELECTRIC의 전력설비 진단점검 서비스를 종합적으로 제공하는 Web Portal입니다.</p>
                <p>Cloud 기반으로 PC 및 Mobile 동시 지원하여 언제 어디서나 전력설비 진단점검 서비스를 이용할 수 있습니다.</p>
              </div>
            </div>
            <Main />
          </article>
        </section>
      </main>
      {/* <!-- //main, 컨테이너영역 --> */}
      <div className="moveTopBtn">
        <span className="hide">맨 위로</span>
      </div>
    </>
  )
}

export default SiteIntroTest;

function Main() {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);

  let main = utils.main;
  let sub = utils.sub;
  // let imgs = utils.imgs;


  return (
    <>
      {main.map((menu, idx) => (
        <section key={"intro_" + idx.toString()}>
          <h3>{menu.title}</h3>
          <p className="addmean">
            {menu.text}
          </p>
          {(userInfo.loginInfo.role == CONST.USERROLE_ADMIN) ?
            <div className="cont" >
              {sub.filter((fd) => (fd.code.toString() == menu.code)).map((smenu, idx) => (
                <dl key={"intro_" + idx.toString()}>
                  <dt>{smenu.subTitle}</dt>
                  <dd>{smenu.subText}</dd>
                </dl>
              ))}
              {/*  {imgs.filter((fd) => (fd.code.toString() == menu.code)).map((img, idx) => (
                <div className="img-wrap" key={"intro__" + idx.toString()}>
                  <img src={img.item} alt="" />
                </div>
              ))} */}
            </div>
            :
            <div className="cont" >
              {sub.filter((fd) => (fd.code.toString() == menu.code) && (fd.code.toString() != "management")).map((smenu, idx) => (
                <dl key={"intro_" + idx.toString()}>
                  <dt>{smenu.subTitle}</dt>
                  <dd>{smenu.subText}</dd>
                </dl>
              ))}
              {/*   {imgs.filter((fd) => (fd.code.toString() == menu.code) && (fd.code.toString() != "management")).map((img, idx) => (
                <div className="img-wrap" key={"intro__" + idx.toString()}>
                  <img src={img.item} alt="" />
                </div>
              ))} */}
            </div>
          }
        </section>
      ))}
    </>
  )
}