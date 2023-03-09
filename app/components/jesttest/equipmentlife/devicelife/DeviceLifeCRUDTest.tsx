/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-09-22
 * @brief EHP 설비수명 - 수명인자 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import DeviceLifeListTest from "./DeviceLifeListTest";
import DeviceLifeUpdateTest from "./DeviceLifeUpdateTest";
import NoDeviceLifeViewTest from "./NoDeviceLifeViewTest";

//
/* import WorkChangeList from "./WorkChangeList"; */

function DeviceLifeCRUDTest(props) {
    //props
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const selTree = props.selTree;
    const setSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const reWork = props.reWork;
    const setReWork = props.setReWork;

    const [listItem, setListItem] = useState(null);


    return (
        <>
            {(workMode === "READ") && (selTree.room.roomId.length > 0) ?
                <DeviceLifeListTest
                    nodata={props.nodata}
                    isTreeOpen={props.isTreeOpen}
                    isMobile={props.isMobile}
                    setIsMobile={props.setIsMobile}
                    selTree={selTree}
                    setListItem={setListItem}
                    workMode={props.workMode}
                    setWorkMode={props.setWorkMode}
                    setNodata={props.setNodata}
                    setPopWin={props.setPopWin}
                    reWork={reWork}
                />
                : (workMode === "READ") &&
                <NoDeviceLifeViewTest
                    isTreeOpen={props.isTreeOpen}
                    isMobile={props.isMobile}
                    setIsMobile={props.setIsMobile}

                    //setAdminType={props.setAdminType}
                    workMode={props.workMode}
                    setWorkMode={props.setWorkMode}
                    setPopWin={props.setPopWin}
                />
            }
            {(workMode === "UPDATE") &&
                <DeviceLifeUpdateTest
                    nodata={props.nodata}
                    isTreeOpen={props.isTreeOpen}
                    isMobile={props.isMobile}
                    setIsMobile={props.setIsMobile}
                    selTree={selTree}
                    setSelTree={setSelTree}
                    listItem={listItem}
                    workMode={props.workMode}
                    setWorkMode={props.setWorkMode}
                    setNodata={props.setNodata}
                    setPopWin={props.setPopWin}
                    reWork={reWork}
                />
            }

        </>
    )
}

export default DeviceLifeCRUDTest;
