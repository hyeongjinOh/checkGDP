import React, { useEffect } from "react";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import * as CONST from "../../../../utils/Const";

function HelpTreeTest(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const helpMenu = props.helpMenu;
    const tree1Depth = props.tree1Depth;
    const setTree1Depth = props.setTree1Depth;
    const tree2Depth = props.tree2Depth;
    const setTree2Depth = props.setTree2Depth;



    return (
        <>
            {/* 차후 사용 예정    
            <div className="lnb__top"> 
                <div className="box__search">
                    <input type="text" placeholder="키워드를 입력하세요." />
                    <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                </div>
            </div> 
            */}
            <div className="lnb">
                <ul className="lnb-depth1">
                    {(userInfo.loginInfo.role == CONST.USERROLE_ADMIN) ?
                        <AdinmTree
                            helpMenu={helpMenu}
                            tree1Depth={tree1Depth}
                            setTree1Depth={setTree1Depth}
                            tree2Depth={tree2Depth}
                            setTree2Depth={setTree2Depth}

                        />
                        :
                        <UserTree
                            helpMenu={helpMenu}
                            tree1Depth={tree1Depth}
                            setTree1Depth={setTree1Depth}
                            tree2Depth={tree2Depth}
                            setTree2Depth={setTree2Depth}

                        />
                    }
                </ul>
            </div>
        </>
    );
}

export default HelpTreeTest;

function AdinmTree(props) {
    const {
        helpMenu,
        tree1Depth,
        setTree1Depth,
        tree2Depth,
        setTree2Depth,
    } = props;

    return (
        <>
            {(helpMenu) && helpMenu.map((list, idx) => (
                <li key={idx} className={`${(tree1Depth === list.id) ? "active" : ""}`}
                    onClick={(e) => setTree1Depth(list.id)}
                >
                    <p>
                        <a>{list.mname}</a>
                    </p>
                    <ul className="lnb-depth2">
                        {list.subMenu.filter((nottree) => (nottree.sname != "사업장 전기실 관리 - 사업장 추가(사용자)") &&
                            (nottree.sname != "사업장 전기실 관리 - 사업장 신규등록 추가") &&
                            (nottree.sname != "사업장 전기실 관리 - 사업장 검색 추가")).map((smenu, jdx) => (
                                <li key={jdx} className={`${(tree2Depth === smenu.sid) ? "active" : ""}`}
                                    onClick={(e) => setTree2Depth(smenu.sid)}
                                >
                                    <a href={`#help_${list.id}-${smenu.sid}`}>{smenu.sname}</a>
                                </li>
                            ))}
                    </ul>
                </li>
            ))}
        </>
    )
}

function UserTree(props) {
    const {
        helpMenu,
        tree1Depth,
        setTree1Depth,
        tree2Depth,
        setTree2Depth,
    } = props;

    return (
        <>
            {(helpMenu) && helpMenu.filter((nottree) => (nottree.mname != "Management")).map((list, idx) => (
                <li key={idx} className={`${(tree1Depth === list.id) ? "active" : ""}`}
                    onClick={(e) => setTree1Depth(list.id)}
                >
                    <p>
                        {/* <a href="#">e-Health Portal {list.mname}</a> */}
                        <a>{list.mname}</a>
                    </p>
                    <ul className="lnb-depth2">
                        {list.subMenu.filter((nottree) => (nottree.sname != "기기등록 현황 - List Download(관리자)") &&
                            (nottree.sname != "사업장 전기실 관리 - 회사 검색(ADMIN)")).map((smenu, jdx) => (
                                <li key={jdx} className={`${(tree2Depth === smenu.sid) ? "active" : ""}`}
                                    onClick={(e) => setTree2Depth(smenu.sid)}
                                >
                                    {/* <a href='#help'>{smenu.sname}</a> */}
                                    <a href={`#help_${list.id}-${smenu.sid}`}>{smenu.sname}</a>
                                </li>
                            ))}
                    </ul>
                </li>
            ))}

        </>
    )
}