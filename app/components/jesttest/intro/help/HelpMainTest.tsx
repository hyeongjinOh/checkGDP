import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
// UTILS
import * as CONST from "../../../../utils/Const"
import HelpTree from "./HelpTreeTest";
import * as Help from "./HelpUtilsTest"
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
//
function HelpMainTest(props) {
    //recoil
    const [isToggle, setIsToggle] = useState(true);
    const [tree1Depth, setTree1Depth] = useState(1);
    const [tree2Depth, setTree2Depth] = useState(1);
    //  
    let helpMenu = Help.HelpUtilsTest;

    return (
        <>
            {/*{/*<!-- main, 컨테이너영역 -->*/}
            <main className="container">
                <section className="content">
                    {/*<!--그리드 영역 -->*/}
                    <article className="box">
                        <div className="box__body">
                            <div className="content__top">
                                <h2>도움말</h2>
                                <button data-testid="userpdfButton" type="button" className="btn-filedown">
                                    <a href="https://repoehp.blob.core.windows.net/repoehp-item/help/EHP_%EB%8F%84%EC%9B%80%EB%A7%90.pdf" target='_blank'>
                                        <span>PDF Download</span>
                                    </a>
                                </button>
                                :
                                <button data-testid="adminpdfButton" type="button" className="btn-filedown">
                                    <a href="https://repoehp.blob.core.windows.net/repoehp-item/help/EHP_%EB%8F%84%EC%9B%80%EB%A7%90(Admin).pdf" target='_blank'>
                                        <span>PDF Download</span>
                                    </a>
                                </button>
                            </div>
                            <div className="content__bottom">
                                {/*<!--area__left, 왼쪽 영역-->*/}
                                <div className={`area__left only-depth2 ${isToggle ? "active" : ""}`} >
                                    <div className="box__etc">
                                        <p>Tree Menu</p>
                                        <button type="button" onClick={() => setIsToggle(false)} className="btn btn-left"><span className="hide">트리메뉴접기펼치기</span></button>
                                    </div>
                                    {/*<!--왼쪽 메뉴 영역, 기존과 액션은 동일하고 클래스만 추가됨-->*/}
                                    <HelpTree
                                        helpMenu={helpMenu}
                                        tree1Depth={tree1Depth}
                                        setTree1Depth={setTree1Depth}
                                        tree2Depth={tree2Depth}
                                        setTree2Depth={setTree2Depth}
                                    />
                                    {/*<!--//왼쪽 메뉴 영역-->*/}
                                </div>
                                {/*<!--//area__left, 왼쪽 영역-->*/}
                                {/*<!--area__right, 오른쪽 영역-->*/}
                                <div className="area__right">
                                    {/* <div className="page-top">
                                        <h3>{ }</h3>
                                        <h4 id="D1">회원 가입</h4>
                                    </div> */}
                                    {(helpMenu) && helpMenu.map((list, idx) => (
                                        <React.Fragment key={idx} >
                                            {(list.subMenu) && list.subMenu.map((sublist, jdx) => (
                                                <React.Fragment key={jdx}>
                                                    <div id={`help_${list.id}-${sublist.sid}`} className="page-top">
                                                        <h3>{list.mname}</h3>
                                                        <h4>{sublist.sname}</h4>
                                                    </div>
                                                    <div className="page-bottom">
                                                        {sublist.snameContents.map((content, kdx) => (
                                                            <React.Fragment key={kdx}>
                                                                <h5 style={{ whiteSpace: "pre-wrap" }}>{kdx + 1}. {content.procedure}</h5>
                                                                <div className="cont">
                                                                    <div className="img-wrap">
                                                                        <img src={content.captureImg} alt="" />
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {/*<!--//area__right, 오른쪽 영역-->*/}
                            </div>
                            {/*<!--//content__bottom-->*/}
                        </div>
                        {/*<!--// .box__body-->*/}
                    </article>
                </section>
                {/*<!-- //.content, 컨텐츠영역:개별박스영역으로 구성 -->*/}

                <a href="#" className="area__left__toggleBtn" onClick={() => setIsToggle(true)}><span className="hide">트리메뉴보기</span></a>
            </main>
            {/* {/*{/*<!-- //main, 컨테이너영역 -->*/}
        </>
    )
}

export default HelpMainTest;