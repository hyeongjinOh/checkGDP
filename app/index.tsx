import * as React from "react";
import * as ReactDOM from "react-dom";
// recoil
import { RecoilRoot } from 'recoil';
//utils
import * as Bridge from './utils/langs/BridgeApi';
import { oc } from 'ts-optchain';
import * as i18n from './utils/langs/i18nUtils';
//utils
import clog from "./utils/logUtils";

//component
import EHPortal from "./ehp";


window.onload = async () => {
  try{
    const { result } = await Bridge.getNativeInfo();
    clog('index.tsx : Bridge.getNativeInfo :: ' + result);
    
// result 변수 안의 language 에 접근할 수 있다.
    const nativeLang = oc(result).language()
    //setLangs(nativeLang);
    //console.log('IN INDEX.HTML : nativeLang :: ', nativeLang)

// i18n init
    await i18n.init(nativeLang as string);
    console.log("index.tsx : dev mode :" +  process.env.NODE_ENV)
    render();

  } catch (e) {
      console.error(e);
  }


}

function render() {
  ReactDOM.render(
    <RecoilRoot>    {/* RecoilRoot provider를 이용하여 recoil을 사용가능하도록 설정해줍니다. */}
      <EHPortal />
    </RecoilRoot>, 
    document.getElementById("app"),
  );
}

