/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-11-29
 * @brief EHP 도움말 - Tree 개발
 *
 ********************************************************************/
import React, { useEffect } from "react";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import * as CONST from "../../../utils/Const";
/**
 * @brief EHP 도움말 - Tree  컴포넌트
 * @param 
 * @returns react components
 */
function HelpTree(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const helpMenu = props.helpMenu;
    const tree1Depth = props.tree1Depth;
    const setTree1Depth = props.setTree1Depth;
    const tree2Depth = props.tree2Depth;
    const setTree2Depth = props.setTree2Depth;
    const setIsToggle = props.setIsToggle;
    useEffect(() => {
        if (tree1Depth == 1 && tree2Depth == 1) {
            setTree2Depth(1);
        } else {
            setTree2Depth(0);
        }
    }, [tree1Depth]);

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
                            setIsToggle={setIsToggle}
                        />
                        :
                        <UserTree
                            helpMenu={helpMenu}
                            tree1Depth={tree1Depth}
                            setTree1Depth={setTree1Depth}
                            tree2Depth={tree2Depth}
                            setTree2Depth={setTree2Depth}
                            setIsToggle={setIsToggle}
                        />
                    }
                </ul>
            </div>
        </>
    );
}

export default HelpTree;

function AdinmTree(props) {
    const {
        helpMenu,
        tree1Depth,
        setTree1Depth,
        tree2Depth,
        setTree2Depth,
        setIsToggle
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
                        {list.subMenu.filter(
                            (nottree) => (list.id == 6) ?
                                ((nottree.sid != 3) &&
                                    (nottree.sid != 4) &&
                                    (nottree.sid != 5) &&
                                    (nottree.sid != 6) &&
                                    (nottree.sid != 8) &&
                                    (nottree.sid != 9) &&
                                    (nottree.sid != 13) &&
                                    (nottree.sid != 15))
                                :
                                nottree
                        ).map((smenu, jdx) => (
                            <li key={jdx} className={`${(tree2Depth === smenu.sid) ? "active" : ""}`}
                                onClick={(e) => { setTree2Depth(smenu.sid); setIsToggle(false) }}
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
        setIsToggle
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
                        {list.subMenu.filter((nottree) => (list.id == 6) ?
                            ((nottree.sid != 2) &&
                                (nottree.sid != 7) &&
                                (nottree.sid != 10) &&
                                (nottree.sid != 12) &&
                                (nottree.sid != 14))
                            : ((list.id == 3) ? (nottree.sid != 10) :
                                nottree)
                        ).map((smenu, jdx) => (
                            <li key={jdx} className={`${(tree2Depth === smenu.sid) ? "active" : ""}`}
                                onClick={(e) => { setTree2Depth(smenu.sid); setIsToggle(false) }}
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