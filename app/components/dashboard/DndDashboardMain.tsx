/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard  컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef, DependencyList } from "react";
import ReactDOM from "react-dom";

// ex-utils
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// utils
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const"
import * as CUTIL from "../../utils/commUtils"

//component
import DndDashboardTree from "./DndDashboardTree";
import DndDashboard from "./DndDashboard";
import DropBox from "./test/DropBox";

 /**
 * @brief EHP DashBoard 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function DndDashboardMain(props) {
  //ref, trans
  const mobileRef = useRef(null); // Mobile Check용
  function handleResize() {
    if (CUTIL.isnull(mobileRef)) return;
    let newItems = items;
    const strItems = localStorage.getItem(CONST.STR_EHP_DASHBODRD_CARDORDER);
    if (strItems && strItems.length > 0) {
      newItems = JSON.parse(strItems);
    }
    //
    const mobileTag = mobileRef.current;
    if (mobileTag.clientWidth <= 964) {
      //8
      setIsDraggable(false);
      setColCount(8);
      setColumnList({"columns": getColumns(8, newItems)});
    } else if (mobileTag.clientWidth <= 1609) {
      //2
      setIsDraggable(false);
      setColCount(4);
      setColumnList({"columns": getColumns(4, newItems)});
    } else {
      //2
      setColCount(2);
      setColumnList({"columns": getColumns(2, newItems)});
    }
  }

  useEffect(() => { // resize handler
    // Mobile 체크
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);


  const deaultItems = [
    {"id":"A", "content":"contA"},
    {"id":"B", "content":"contB"},
    {"id":"C", "content":"contC"},
    {"id":"D", "content":"contD"},
    {"id":"E", "content":"contE"},
    {"id":"F", "content":"contF"},
    {"id":"G", "content":"contG"},
    {"id":"H", "content":"contH"},
  ]
  let curItems = deaultItems;
  const strItems = localStorage.getItem(CONST.STR_EHP_DASHBODRD_CARDORDER);
  if (strItems && strItems.length > 0) {
    curItems = JSON.parse(strItems);
  }
  
  const [items, setItems] = useState(curItems);

  function getColumns (count, items) {
    return Array.from({ length: count }, (v, k) => k).map(k => ({
      id: `col-${k}`,
      content: `col ${k}`,
      //items:getColItems(`col-${k}`, 8/count),
      items:getColItems(k, 8/count, items),
    }));
  }
  //1, 2, 4
  function getColItems (colIdx, count, items) {
    const startIdx = (colIdx<=0)?colIdx:colIdx*count;
    const endIdx = (colIdx<=0)?count:(colIdx+1)*count;
    //clog("" + JSON.stringify(items.filter((item, idx)=>(idx>=startIdx)&&(idx<endIdx)).map((item, idx)=>(item))));
    return items.filter((item, idx)=>(idx>=startIdx)&&(idx<endIdx)).map((item, idx)=>({...item, "colId":`col_${colIdx}`}));
  }  
  const [colCount, setColCount] = useState(8);
  const [columnList, setColumnList] = useState({"columns": getColumns(8, items)});
  
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  function onClickListMenu(val) {
    setIsTreeOpen(val);
  }  

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [sremoved] = result.splice(startIndex, 1, -1);
    const [eremoved] = result.splice(endIndex, 1, -1);
    result.splice(endIndex, 1, sremoved);
    result.splice(startIndex, 1, eremoved);

    return result;
  };

  function onColumnDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const sourceIdx = parseInt(result.source.droppableId)*8/colCount + result.source.index;
    const destinationIdx = parseInt(result.destination.droppableId)*8/colCount + result.destination.index;
    if (sourceIdx === destinationIdx) return;

    const nItems:any = reorder(items, sourceIdx, destinationIdx);

    setItems(nItems);
    setColumnList({"columns": getColumns(colCount, nItems)});
  }
  const defaultTree={ 
    company:{companyId:"", companyName:"전체"}, 
    zone:{zoneId:"", zoneName:"전체"}, 
    reload : false
  };
  
  const locTreeStr = localStorage.getItem(CONST.STR_EHP_DASHBODRD_PIN);
  const [locTree, setLocTree] = useState(JSON.parse(locTreeStr));
  const [selTree, setSelTree] = useState(defaultTree);

  function handleSelTree(treeInfo) {
    //clog("handleSelTree : " + JSON.stringify(treeInfo));
    setSelTree(treeInfo);
  }

  const [isDraggable, setIsDraggable] = useState(false);
  function onClickIsDraggable(e, val) {
    (!val)&&doSaveItemOrder();
    setIsDraggable(val);
  }
  function doSaveItemOrder() {
    localStorage.setItem(CONST.STR_EHP_DASHBODRD_CARDORDER, JSON.stringify(items));
    setItems(items);
  }

  function onClickPin(e) {
    doSavePin();
  }
  function doSavePin() {
    localStorage.setItem(CONST.STR_EHP_DASHBODRD_PIN, JSON.stringify(selTree));
    setLocTree(selTree);
  }

  //clog("DND INIT : SEL TREE : " + JSON.stringify(selTree));
  //clog("DND INIT : LOC TREE : " + JSON.stringify(locTree));
  return (
  <>
    {/*{/*<!--main, 컨테이너영역 -->*/}
    <main className="container" style={{ "cursor": "default" }}>
      <section className="content-top">
        <div className="top-wrap" ref={mobileRef}>
          <div className="left">
            <h2>
              <span>{selTree.company.companyName}</span>
              <span>{(selTree.zone.zoneId.length > 0)?selTree.zone.zoneName:""}</span>
            </h2>
            <button type="button"
              className={`btn btn-menuopen ${(isTreeOpen) ? "active" : ""}`}
              onClick={(e) => setIsTreeOpen(!isTreeOpen)}
            >
              <span className="hide">메뉴 열기닫기</span>
            </button>
          </div>
          <div className="right">
            {(colCount===2)&&<button type="button"
              className={`btn btn-edit ${(isDraggable)?"active":""}`}
              onClick={(e)=>(colCount===2)&&onClickIsDraggable(e, !isDraggable)}
            >
              <span className="hidden">저장</span>
            </button>}
            <button type="button"
              className={`btn btn-pin ${(locTree)&&(selTree.zone.zoneId===locTree.zone.zoneId)?"active":""}`}
              onClick={(e)=>onClickPin(e)}
            >
              <span className="hide">메인 대시보드 고정</span>
            </button>
          </div>
        </div>
      </section>
      {/*<!--슬라이드 메뉴영역-->*/}
      <div className={`menu-slide ${(isTreeOpen) ? "open" : ""}`}>
        <DndDashboardTree
          locTree={locTree}
          selTree={selTree}
          setIsTreeOpen={setIsTreeOpen}
          setSelTree={handleSelTree}
        />
      </div>
      {/*<!--.content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
      <DndDashboard
        selTree={selTree}
        isDraggable={isDraggable}
        colCount={colCount}
        columnList={columnList}
        onColumnDragEnd={onColumnDragEnd}
      />
    </main>
  </>
  );

}

export default DndDashboardMain;
