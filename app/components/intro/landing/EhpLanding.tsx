/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-12-06
 * @brief EHP Landing 컴포넌트
 *
 ********************************************************************/
import React from "react";
/**
 * @brief EHP Landing 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */


//
function EhpLanding(props) {

  return (
    <>
      {/* <!-- main, 컨테이너영역 --> */}
      <main className="container"  style={{"cursor":"default"}}>
        <section className="content">
          <article>
            <div className="content__title">
              <div className="title-wrap">
                <h1><img src={`${require("/static/img/intro_logo.png")}`} alt="LS ELECTRIC" className="mr-15" />전력설비 진단점검 서비스</h1>
                {/* <!--221214, page-title 생성및 이미지 교체--> */}
                <p className="page-title"><img src={`${require("/static/img/logo_title_color_opacity.png")}`} alt="e-Health Portal" /></p>
                {/* <img src={`${require("/static/img/intro_title.png")}`} alt="e-Health Portal" /> */}
                <p>e-Health Portal은 LS ELECTRIC의 전력설비 진단점검 서비스를 종합적으로 제공하는 Web Portal입니다.</p>
                <p>Cloud 기반으로 PC 및 Mobile 동시 지원하여 언제 어디서나 전력설비 진단점검 서비스를 이용할 수 있습니다.</p>
              </div>
            </div>
            <section className="center">
              <div className="txt-wrap">
                <h2>대시보드</h2>
                <p>전력설비 및 진단점검 관련 현황을 ​한눈에 파악할 수 있도록 대시보드를 제공합니다.</p>
              </div>
              <div className="img-wrap">
                <img src={`${require("/static/img/randing01.png")}`} alt="" />
              </div>
            </section>
            <section>
              <div className="txt-wrap">
                <h2>e-Health Check ‘진단 점검’</h2>
                <p>전력설비가 안전하고 효율적으로 운영될 수 있도록 3단계로 구분된 체계적인 전력 설비 진단점검 서비스, e-Health Checker로 전력설비의 건강 상태를 체크할 수 있습니다.</p>
              </div>
              <div className="img-wrap">
                <img src={`${require("/static/img/randing02.png")}`} alt="" />
              </div>
            </section>
            <section>
              <div className="img-wrap left">
                <img src={`${require("/static/img/randing03.png")}`} alt="" />
              </div>
              <div className="txt-wrap">
                <h2>손쉬운 운영관리</h2>
                <p>e-Health Portal에서 전력설비를 등록하고 사업장/전기실/전력설비 유형으로 구분하여 설비 별 상세정보까지 손쉽게 조회하고 관리할 수 있습니다.</p>
              </div>
            </section>
            <section>
              <div className="img-wrap left">
                <img src={`${require("/static/img/randing04.png")}`} alt="" />
              </div>
              <div className="txt-wrap">
                <h2>설비 수명 플랫폼 연계</h2>
                <p>전력설비 운영에서 가장 중요한 설비수명 정보를 신뢰성있게 제공하기 위해 LS ELECTRIC의 Asset Lifecycle Optimization (ALO)플랫폼과 연계하여 Lifecycle 보고서를 제공합니다.</p>
              </div>
            </section>
            <section>
              <div className="txt-wrap">
                <h2>Report File 제공</h2>
                <p className="ls-7">Portal 사용자 편의성 향상을 위하여 e-Health Check 서비스에서 생성된 진단점검 보고서와 전력설비의 출하 검사 성적서를 제공합니다.</p>
              </div>
              <div className="img-wrap">
                <img src={`${require("/static/img/randing05.png")}`} alt="" />
              </div>
            </section>
            <section>
              <div className="txt-wrap">
                <h2>점검 출동 요청 및 이력 관리</h2>
                <p className="ls-9">전력설비 진단점검 업무를 수행하는 사용자에게 도움이 되도록 LS ELECTRIC에서 진행한 전력설비의 점검 이력을 제공하며 사용 중 고장 발생 즉시 점검 출동을 요청할 수 있습니다.</p>
              </div>
              <div className="img-wrap">
                <img src={`${require("/static/img/randing06.png")}`} alt="" />
              </div>
            </section>
            {/*    <section className="example">
              <div className="txt-wrap">
                <h2>고객 활용 우수 사례</h2>
                <p>LS ELECTRIC e-Health Portal 진단 점검 활용의 우수 사례를 확인하세요.</p>
              </div>
              <ul>
                <li>
                  <div className="img-wrap">
                    <img src={`${require("/static/img/randing07.jpg")}`} alt="" />
                  </div>
                  <div className="txt-wrap">
                    <h3>ABC Company</h3>
                    <p>다양한 기업, 산업군 그리고 근무형태에 맞게 시스템을 맞춤 설정합니다. 중소기업부터 대기업까지 필요한 운영 환경을 구축하세요. 다양한 기업, 산업군 그리고 근무형태에 맞게 시스템을 맞춤 설정합니다.</p>
                  </div>
                </li>
                <li>
                  <div className="img-wrap">
                    <img src={`${require("/static/img/randing08.jpg")}`} alt="" />
                  </div>
                  <div className="txt-wrap">
                    <h3>PSSD Lab</h3>
                    <p>전 세계적으로 ESG 경영이 새로운 경영 패러다임으로 자리잡고 있는 가운데, 지난 10월 4일 우리 회사의 ESG 경영 선포식이 열렸습니다.</p>
                  </div>
                </li>
                <li>
                  <div className="img-wrap">
                    <img src={`${require("/static/img/randing09.jpg")}`} alt="" />
                  </div>
                  <div className="txt-wrap">
                    <h3>글로벌 철도 시장을 달리다</h3>
                    <p>지난 10월 17일, 우리 회사가 대만 카오슝 도시철도 옐로라인(Yellow Line)에 전력시스템을 일괄 공급하는 계약을 체결했습니다.</p>
                  </div>
                </li>
              </ul>
            </section> */}
          </article>
          <article className="bottom-area">
            <p>전력설비의 체계적인 진단점검, 지금 시작하세요.</p>
          </article>
        </section>
      </main>
      {/* <!-- //main, 컨테이너영역 --> */}
    </>
  )
}

export default EhpLanding;