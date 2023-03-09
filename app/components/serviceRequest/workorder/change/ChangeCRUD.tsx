/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP workorder - 노후 교체 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import ChangeList from "./ChangeList";
import NoChangeView from "./NoChangeView";

//
/* import WorkChangeList from "./WorkChangeList"; */
/**
 * @brief EHP WorkOrder - 노후 교체 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function ChangeCRUD(props) {
    //props
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;

    return (
        <>
            {(workMode === "LIST")
                && (selTree.zone.zoneId.length > 0)
                ? <ChangeList
                    nodata={props.nodata}
                    isTreeOpen={props.isTreeOpen}
                    isMobile={props.isMobile}
                    setIsMobile={props.setIsMobile}
                    selTree={selTree}
                    setSelTree={props.setSelTree} // adminType 변경됨
                    //setAdminType={props.setAdminType}
                    workMode={props.workMode}
                    setWorkMode={props.setWorkMode}
                    setNodata={props.setNodata}
                    setPopWin={props.setPopWin}
                />
                : <NoChangeView
                    isTreeOpen={props.isTreeOpen}
                    isMobile={props.isMobile}
                    setIsMobile={props.setIsMobile}
                    selTree={selTree}
                    setSelTree={props.setSelTree} // adminType 변경됨
                    //setAdminType={props.setAdminType}
                    workMode={props.workMode}
                    setWorkMode={props.setWorkMode}
                    setPopWin={props.setPopWin}
                />
            }

        </>
    )
}

export default ChangeCRUD;
