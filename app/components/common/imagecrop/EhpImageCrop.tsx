/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState, DependencyList } from "react";

import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";
// img, css etc
import ReactCrop, 
  {Crop, makeAspectCrop,
  centerCrop,
  PixelCrop,} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
// components
import ImageCrop from "./ImageCrop";
import { CanvasPreview } from './CanvasPreview'

/**
 * @brief EHP 이미지 크롭 컴포넌트
 * @param - 
 * @returns react components
 */

//component
function EhpImageCrop(props) {
  const popBody = props.popBody;
  const cropImage = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("cropImage")
        ? popBody.props.cropImage
        : null
      : null
    : null;

  const setParentCropedImage = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("setCropedImage")
        ? popBody.props.setCropedImage
        : null
      : null
    : null;
    

  const imgRef = useRef(null);  

  clog("IN EHPCROPIMAGE : INIT : " + JSON.stringify(cropImage));
  //clog("IN EHPCROPIMAGE : INIT : " + JSON.stringify(popBody));

  const [crop, setCrop] = useState<Crop>(
    /*{
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50
  }*/
  );
  const dw = 300;
  const dh = 300;
  const [fixWidth, setFixWidth] = useState(dw);
  const [fixHeight, setFixHeight] = useState(dh);
  function handleSetCrop (crop) {
    clog("handleSetCrop : " + crop.width + " X " + crop.height);
    setCrop({...crop, width:crop.width, height:crop.width});
    //setCrop({...crop, width:fixWidth, height:fixHeight});
  }

  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  useEffect(()=>{
    setCompletedCrop(null);
    setFixWidth(dw);
    setFixHeight(dh);
  }, [popBody]);


  function onImageLoad(e) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    //clog("onImageLoad : " + width + " X " + height);
    if ( width < fixWidth ) {
      setFixWidth(width);
      setFixHeight(height);
    }

    const crop = centerCrop(
      makeAspectCrop(
        {
          // You don't need to pass a complete crop into
          // makeAspectCrop or centerCrop.
          //unit: '%',
          unit: 'px',
          width: ( width < fixWidth )?width:fixWidth,
        },
        //16 / 9,
        1/1,
        ( width < fixWidth )?width:fixWidth,
        ( width < fixWidth )?height:fixHeight,
        //width,
        //height
      ),
      ( width < fixWidth )?width:fixWidth,
      ( width < fixWidth )?height:fixHeight,
      //width,
      //height
    )
  
    setCrop(crop)
  }

  function onCloseCropSrc(objURL) {
    window.URL.revokeObjectURL(objURL);
  }

  const previewCanvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        CanvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate,
        )
      }
    },
    100,
    [completedCrop, scale, rotate],
  )


  function getCroppedImg(image, pixelCrop, fileName) {
    //clog("CROP : getCroppedImg : " + JSON.stringify(pixelCrop));
    const canvas = previewCanvasRef.current;
    // As Base64 string
    const base64Image = canvas.toDataURL('image/jpeg');
    return base64Image;
  }


  async function onClickSaveCropedImage() {
    const fileUrl = await getCroppedImg(imgRef.current, completedCrop, cropImage.name);
    //clog("IN CROP COMP : SET PARENT FILE : " + fileUrl);
    setParentCropedImage({name : cropImage.name, url:fileUrl});
    CUTIL.jsclose_Popup("pop-imgcrop");
  }
  return (
  <>
  {/*<!--220825, 이미지 크롭 팝업 -->*/}
    <div id="pop-imgcrop" className="popup-layer js-layer layer-out hidden popup-basic imgcrop" style={{"display": ""}}>
      <div className="popup__head">
        <h1>Image Edit</h1>
        <button className="btn btn-close js-close" onClick={(e)=>onCloseCropSrc(cropImage.url)}><span className="hide">닫기</span></button>
      </div>
      <div className="popup__body">
        <ReactCrop
          crop={crop} 
          //onChange={(crop, pcrop)=>setCrop(crop)}
          onChange={(crop, pcrop)=>handleSetCrop(crop)}
          
          onComplete={(e)=>setCompletedCrop(e)}
        >
        {
        (cropImage)
          ? <img ref={imgRef} src={cropImage.url} onLoad={onImageLoad} object-fit={"cover"} />
          : <img ref={imgRef} src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" onLoad={onImageLoad}/>
        }
        </ReactCrop>

        {/*
        (cropImage)
          ? <img src={cropImage.url} alt={cropImage.name}/>
          : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역"/>
        */}
        {/*
          (fileRef)&&<Croppie url={fileRef.current} ref={fileRef}/>
          <ImageCrop />
          <ReactCroppie url="" ref={cropRef}/>
      */}
      {
      <div>
        {Boolean(completedCrop) && (
          <canvas
            ref={previewCanvasRef}
            style={{
              border: '0px solid black',
              objectFit: 'contain',
              width: 0,//completedCrop.width,
              height: 0,//completedCrop.height,
            }}
          />
        )}
      </div>
      }
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close" onClick={(e)=>onCloseCropSrc(cropImage.url)}><span>취소</span></button>
        <button type="button" 
          className={`${(completedCrop)?"":"bg-gray"}`}
          //onClick={(e)=>(completedCrop)&&onClickSaveCropedImage(completedCrop)}
          onClick={(e)=>(completedCrop)&&onClickSaveCropedImage()}
        >
          <span>저장</span>
        </button>
      </div>
    </div>
    {/*<!--//220825, 이미지 크롭 팝업 -->*/}
  </>    
  )
}

export default EhpImageCrop;


export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}