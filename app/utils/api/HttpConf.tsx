import * as env from "../envUtils"

//export const APIBASE = ''; // webpack proxy 서버 설정시
export const APIBASE_DEV = 'https://ehp-api.ls-electric.com'; // CORS 서버 설정 Access-Control-Allow-Origin: *
export const APIBASE_PROD = 'https://ehp-api.ls-electric.com'; // CORS 서버 설정 Access-Control-Allow-Origin: *
export const APIBASE_LOC = 'http://127.0.0.1:8887';

export const APIBASE = (env.isDevelopmentMode)?APIBASE_DEV:APIBASE_PROD;
