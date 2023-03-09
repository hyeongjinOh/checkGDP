import { atom, DefaultValue, selector } from "recoil";
import clog from "../utils/logUtils"
import * as CUTIL from "../utils/commUtils";
/*
{"id":27,"itemName":"ITEM27","serialNo":"345634562","itemStatus":"NEEDED","itemStep":"BASIC_ING","responsible":null,"assessment":{"assessmentId":111,"totalComment":null,"reportId":null,"updatedTime":"2022-06-20T14:16:25.873","isTempSave":true},"checkStep":{"checkStepId":1,"name":"BASIC"}}
"assessment":
{"assessmentId":111,"totalComment":null,"reportId":null,"updatedTime":"2022-06-20T14:16:25.873","isTempSave":true},"checkStep":{"checkStepId":1,"name":"BASIC"}
*/
/*
{"assessmentId":111,"totalComment":null,"reportId":null,"updatedTime":"2022-06-20T14:16:25.873","isTempSave":true},"checkStep":{"checkStepId":1,"name":"BASIC"}
{"assessmentId":113,                                    "updatedTime":"2022-06-20T15:46:13.267","isTempSave":true,"itemId":"대전1:1전기실:VCB_PNL:ITEM26","stepName":"BASIC","versionNo":"1.0",
"checkValueDtoList":[{"assessmentId":113,"checkItemId":97,"checkItemName":"탭절환기 Gear 정상동작 여부","isChecked":false,"value":"0","valueType":"number","comment":"","versionNo":"1.0"},{"assessmentId":113,"checkItemId":98,"checkItemName":" 보호계전기, 표시장치 부품 정상동작 여부","isChecked":false,"value":"0","valueType":"number","comment":"","versionNo":"1.0"}]}
*/
export interface spgTreeType {
  company : {
    companyId : string;
    companyName : string;
  },
  zone : {
    zoneId : string;
    zoneName : string;
  },
  subZone : {
    subZoneId : string;
    subZoneName : string;
  },
  room : {
    roomId : string;
    roomName : string;
  },
  spg : {
    spgId : number;
    spgName : string;
  },
}

export interface assessmentInfoType {
  preAssessmentId : number,
  assessmentId : number,
  totalComment: string;
  reportId : number,
  updatedTime : string,
  isTempSave : boolean
}
/*"id":26,"itemName":"ITEM26","serialNo":"345634561","itemStatus":"NEEDED","itemStep":"BASIC_ING","responsible":null*/

export interface itemType {
  spgTree : spgTreeType;
  ehcType : string;
  //id : number;
  itemId : string;
  itemName : string;
  serialNo : string;
  itemStatus : string;
  itemStep : string;
  responsible : string;
  assessment : assessmentInfoType;
}

export const nextItemState = atom<itemType>({
  key: 'nextItemState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    spgTree : { company:{companyId:"", companyName:""}, 
                zone:{zoneId:"", zoneName:""}, 
                subZone:{subZoneId:"", subZoneName:""}, 
                room:{roomId:"", roomName:""}, 
                spg:{spgId:-1, spgName:""}
              },
    ehcType: "",
    itemId:"", 
    itemName: "", 
    serialNo : "",
    itemStatus : "",
    itemStep : "",
    responsible : "",
    assessment:{
      preAssessmentId:null,
      assessmentId:null, 
      totalComment:null,
      reportId : null,
      updatedTime : null,
      isTempSave : null
    }
  }
});

export const beforeItemState = atom<itemType>({
  key: 'beforeItemState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    spgTree : { company:{companyId:"", companyName:""}, 
                zone:{zoneId:"", zoneName:""}, 
                subZone:{subZoneId:"", subZoneName:""}, 
                room:{roomId:"", roomName:""}, 
                spg:{spgId:-1, spgName:""}
              },
    ehcType: "",
    itemId:"", 
    itemName: "", 
    serialNo : "",
    itemStatus : "",
    itemStep : "",
    responsible : "",
    assessment:{
      preAssessmentId:null,
      assessmentId:null, 
      totalComment:null,
      reportId : null,
      updatedTime : null,
      isTempSave : null
    }
  }
});


export const itemState = atom<itemType>({
  key: 'itemState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    spgTree : { company:{companyId:"", companyName:""}, 
                zone:{zoneId:"", zoneName:""}, 
                subZone:{subZoneId:"", subZoneName:""}, 
                room:{roomId:"", roomName:""}, 
                spg:{spgId:-1, spgName:""}
              },    
    ehcType: "",
    itemId:"", 
    itemName: "", 
    serialNo : "",
    itemStatus : "",
    itemStep : "",
    responsible : "",
    assessment:{
      preAssessmentId:null,
      assessmentId:null, 
      totalComment:null,
      reportId : null,
      updatedTime : null,
      isTempSave : null
    }
  }
});


export const itemSelectState = selector({
  key: 'itemSelectState',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const itemInfo = get(itemState); // 현재 아이템 체크 여부
    return ((itemInfo.itemId.length > 0)?true:false);
  },
});

/*
export const setItemSelectState = selector({
  key: 'setItemSelectState',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const itemInfo = get(itemState);
  },
  set:({get, set}, val) => {
    clog("IN RECOILD : setItemSelectState : " + JSON.stringify(val));
    const itemInfo = get(itemState);
    //const nVal:itemType = val;
    set(beforeItemState, itemInfo);
    set(itemState, val instanceof DefaultValue ? val : itemInfo);
    clog("IN RECOILD : setItemSelectState 2 : " + JSON.stringify(get(itemState)));

  },
});
*/

export interface spgDtoType {
  spgId: number,
  name : string
}

export interface checkStepDtoType {
  checkStepId : number,
  name : string
}
export interface checkGroupDtoType {
  groupId: number,
  groupName: string
}

export interface checkItemRefDtoType {
  score : number,
  reference :string
}

export interface assessmentType {
  checkItemId:number,
  checkItemName:string,
  abbreviation:string,
  description:string,
  weight:number,
  rangeMin:number,
  rangeMax:number,
  rangeInterval:number,
  versionNo:string,
  spgDto:spgDtoType,
  checkStepDto:checkStepDtoType,
  checkGroupDto:checkGroupDtoType,
  checkItemRefDtoList : [checkItemRefDtoType],
}

export const assessmentListState = atom<assessmentType[]>({
  key: 'assessmentListState',
  // key의 값은 항상 고유값이어야 합니다.
  default: [{
    checkItemId:-1,
    checkItemName:"",
    abbreviation:"",
    description:"",
    weight:-1,
    rangeMin:-1,
    rangeMax:-1,
    rangeInterval:-1,
    versionNo:"",
    spgDto: {spgId: -1, name : ""},
    checkStepDto:{checkStepId : -1, name : ""},
    checkGroupDto:  {groupId: -1, groupName: ""} ,
    checkItemRefDtoList : [{score : -1, reference :""}],
  }]
});

export interface checkValueDtoType {
  assessmentId:number,
  checkItemId:number,
  checkItemName:string,
  isChecked:boolean,
  value:string,
  valueType:string,
  comment:string,
  versionNo:string
}

export const curCheckValueDto = atom<checkValueDtoType> ({
  key:"curCheckValueDto",
  default:{
    assessmentId:-1,
    checkItemId:-1,
    checkItemName:"",
    isChecked:false,
    value:"",
    valueType:"",
    comment:"",
    versionNo:""
  }
})

export interface tempCheckValueType {
  item : itemType,
  checkVal : checkValueDtoType,
  stepDone : boolean
}

export const tempCheckValue = atom<tempCheckValueType> ({
  key:"tempCheckValue",
  default : {
    item : {
      spgTree : { company:{companyId:"", companyName:""}, 
                  zone:{zoneId:"", zoneName:""}, 
                  subZone:{subZoneId:"", subZoneName:""}, 
                  room:{roomId:"", roomName:""}, 
                  spg:{spgId:-1, spgName:""}
      },          
      ehcType: "",
      itemId:"", 
      itemName: "", 
      serialNo : "",
      itemStatus : "",
      itemStep : "",
      responsible : "",
      assessment:{
        preAssessmentId:null,
        assessmentId:null, 
        totalComment:null,
        reportId : null,
        updatedTime : null,
        isTempSave : null
      }
    },
    checkVal : {
      assessmentId:-1,
      checkItemId:-1,
      checkItemName:"",
      isChecked:false,
      value:"",
      valueType:"",
      comment:"",
      versionNo:""
    },
    stepDone:false,
  }
});

export const curSpgTreeState = atom<spgTreeType> ({
  key:"curSpgTreeState",
  default: { 
    company:{companyId:"", companyName:""}, 
    zone:{zoneId:"", zoneName:""}, 
    subZone:{subZoneId:"", subZoneName:""}, 
    room:{roomId:"", roomName:""}, 
    spg:{spgId:-1, spgName:""}
  },  
});

export const nextSpgTreeState = atom<spgTreeType> ({
  key:"nextSpgTreeState",
  default: { 
    company:{companyId:"", companyName:""}, 
    zone:{zoneId:"", zoneName:""}, 
    subZone:{subZoneId:"", subZoneName:""}, 
    room:{roomId:"", roomName:""}, 
    spg:{spgId:-1, spgName:""}
  },  
});

export const beforeSpgTreeState = atom<spgTreeType> ({
  key:"beforeSpgTreeState",
  default: { 
    company:{companyId:"", companyName:""}, 
    zone:{zoneId:"", zoneName:""}, 
    subZone:{subZoneId:"", subZoneName:""}, 
    room:{roomId:"", roomName:""}, 
    spg:{spgId:-1, spgName:""}
  },  
});



export const curEhcTypeState = atom<string> ({
  key: 'curEhcTypeState',
  default:"BASIC",
});

export const beforeEhcTypeState = atom<string> ({
  key: 'beforeEhcTypeState',
  default:"",
});

export const nextEhcTypeState = atom<string> ({
  key: 'nextEhcTypeState',
  default:"",
});


export const getTempSave = selector({
  key: 'getTempSave',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    //
    const nextSpgTree = get(nextSpgTreeState);
    const nextEhcType = get(nextEhcTypeState); // 
    const nextItem = get(nextItemState); //
    const cval = get(tempCheckValue);
    const checkValue = (cval.checkVal.value.length > 0)?parseInt(cval.checkVal.value):-1;
    clog("IN RECOIL : getTempSave : " + checkValue + " : " + cval.checkVal.value);
    //clog("IN RECOIL : getTempSave : " + nextEhcType + " : " + JSON.stringify(nextItem));
    let ret = false;
    if ( checkValue > -1 ) { // 임시저장 정보가 있으면
      if ( nextItem.itemId.length > 0 ) { // 클릭된 아이템이 있으면
        if ( nextItem.itemId != cval.item.itemId ) { // 클릭된 아이템과 현재 선택된(진행중인) 아이템과 틀리면
          clog("IN RECOIL : setTempSave true 1 : ");
          ret = true;
        }
      }
      if ( !CUTIL.isnull(nextEhcType) ) { // 클릭된 EHCTYPE(STAUS) 있으면
        if ( nextEhcType != cval.item.ehcType ) { // 클릭된 EHCTYPE과 현재 선택된(진행중인) 아이템의 EHCTYPE와 틀리면
          clog("IN RECOIL : setTempSave true 2 : " + nextEhcType);
          ret = true;
        }
      }
      //clog("IN RECOIL : getTempSave : " + JSON.stringify(nextSpgTree) + " : " + JSON.stringify(cval.item.spgTree) + " : " + nextSpgTree.spg.spgId);      
      if ( nextSpgTree.spg.spgId > -1 ) { // 클릭된 EHCTYPE(STAUS) 있으면
        if ( nextSpgTree.company.companyId != cval.item.spgTree.company.companyId ) { // 클릭된 spgTree과 현재 선택된(진행중인) 아이템의 spgTree과 틀리면
          clog("IN RECOIL : setTempSave true 3-1 : ");
          ret = true;
        } else if ( nextSpgTree.zone.zoneId != cval.item.spgTree.zone.zoneId ) {
          clog("IN RECOIL : setTempSave true 3-2 : ");
          ret = true;
        } else if ( nextSpgTree.subZone.subZoneId != cval.item.spgTree.subZone.subZoneId ) {
          clog("IN RECOIL : setTempSave true 3-3 : ");
          ret = true;
        } else if ( nextSpgTree.room.roomId != cval.item.spgTree.room.roomId ) {
          clog("IN RECOIL : setTempSave true 3-4 : ");
          ret = true; 
        } else if ( nextSpgTree.spg.spgId != cval.item.spgTree.spg.spgId ) {
          clog("IN RECOIL : setTempSave true 3-5 : ");
          ret = true;
        }
      }
    }
    clog("IN RECOIL : getTempSave : RETURN : " + ret);
    return (ret);
  },
});

export const getTempSaveOld = selector({
  key: 'getTempSaveOld',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const nextItem = get(nextItemState);
    //
    const cval = get(tempCheckValue);
    //clog("IN RECOIL : NEXTITEM : " + JSON.stringify(nextItem));
    //clog("IN RECOIL : TEMPVAL : " + JSON.stringify(cval));
    const checkValue = (cval.checkVal.value.length > 0)?parseInt(cval.checkVal.value):-1;
    //clog("IN RECOIL : TEMPVAL : RETURN : " + ((nextItem.itemId != cval.item.itemId)&&(checkValue > -1)));

    return (((nextItem.itemId != cval.item.itemId)&&(cval.checkVal.value.length > 0))?true:false);
    //return (((nextItem.itemId != cval.item.itemId)&&(checkValue > -1))?true:false);
  },
});
export const getStepDone = selector({
  key: 'getStepDone',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    //
    const cval = get(tempCheckValue);
    return (cval.stepDone);
  },
});

export interface doneAssessmentType {
  assessmentId:number,
  updatedTime:string,
  isTempSave:boolean,
  itemId:string,
  stepName:string,
  versionNo:string,
  checkValueDtoList:[checkValueDtoType]
}

export const doneAssessmentState = atom<doneAssessmentType>({
  key: 'doneAssessmentState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    assessmentId:-1,
    updatedTime:"",
    isTempSave:true,
    itemId:"",
    stepName:"",
    versionNo:"",
    checkValueDtoList:[{  
      assessmentId:-1,
      checkItemId:-1,
      checkItemName:"",
      isChecked:false,
      value:"",
      valueType:"",
      comment:"",
      versionNo:""
    }],
  }
});

export const getCheckValueDtoList = selector({
  key: 'getCheckValueDtoList',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const doneAssessmentInfo = get(doneAssessmentState);
    return (doneAssessmentInfo.checkValueDtoList);
  },
});

export const getCheckValueDto = selector({
  key: 'getCheckValueDto',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const doneAssessmentInfo = get(doneAssessmentState);
    const stepVal = get(checkStep);
    return ((stepVal<0)?doneAssessmentInfo.checkValueDtoList[0]:doneAssessmentInfo.checkValueDtoList[stepVal]);
  },
});

export const setCheckValueDtoList = selector({
  key: 'setCheckValueDtoList',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {const doneAssessmentInfo = get(doneAssessmentState);},
/*
  set:({set}, val) => {
    set(doneAssessmentState, 
      val instanceof DefaultValue ? val : doneAssessmentState);
  },
*/
});



export const checkStep = atom<number>({
  key: 'checkStep',
  // key의 값은 항상 고유값이어야 합니다.
  default: -1
});

export const getCurItemCheck = selector({
  key: 'getCurItemCheck',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const assessmentList = get(assessmentListState);
    const stepVal = get(checkStep);
    clog("IN RECOIL : GET STEP INFO : " + stepVal + " : LIST LEN : " + assessmentList.length);
    const isNull = (stepVal >= assessmentList.length)?true:false;
    return ((stepVal<0)?assessmentList[0]:(isNull)?null:assessmentList[stepVal]);
  },
});

export const getCheckDone = selector({
  key: 'getCheckDone',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const assessmentList = get(assessmentListState);
    const stepVal = get(checkStep);
    return ((assessmentList.length == stepVal )?true:false);
  },
});


