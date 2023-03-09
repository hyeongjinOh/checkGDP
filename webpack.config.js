const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  //mode: "production",

  // 엔트리 포인트
  entry: "./app/index.tsx",

  // 빌드 결과물을 dist/main.js에 위치
  output: {
    clean: true,
    filename: "index.js",
    path: __dirname + "/dist/",
  },
  // by 20221214 hjo favicon 추가
  plugins: [new HtmlWebpackPlugin({ 
    template: "./template/index.html",
    favicon:"./static/img/favicon.svg"  
   })],


  // 디버깅을 위해 빌드 결과물에 소스맵 추가
  devtool: "source-map",
  devServer: {
    //contentBase: path.join(__dirname, "./"), // 콘텐츠를 제공할 경로지정
    devMiddleware: { publicPath: "/dist" },
    static: { directory: path.resolve(__dirname) },
    //compress: true, // 모든 항목에 대해 gzip압축 사용
    hot: true, // HRM(새로 고침 안해도 변경된 모듈 자동으로 적용)
    port: 8081, // 접속 포트 설정
    historyApiFallback: true,
    /**
    proxy: {     
      "/api/v1" : {
        target: "https://52.231.113.169:4001",
        secure: false, // ERR_TLS_CERT_ALTNAME_INVALID 에러 시
        changeOrigin: true  // 500 에러시        
      },
      "/api/v2" : {
        target: "https://52.231.113.169:4001",
        //target: "",
        secure: false, // ERR_TLS_CERT_ALTNAME_INVALID 에러 시
        changeOrigin: true  // 500 에러시        
      },
    }
**/
  },

  resolve: {
    // 파일 확장자 처리
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    //extensions: [".ts", ".tsx",],
  },

  module: {
    rules: [
      // .ts나 .tsx 확장자를 ts-loader가 트랜스파일
      { test: /\.tsx?$/i, loader: "ts-loader" },
      // style-loader, css-loader 구성
      // global.d.ts에 추가 선언
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },

      /*           
      // CSS Module ([filename].module.css)   

      {
        //test: /\.module\.css$/i,
          test: /\.css$/i,
          use: ['style-loader', { loader: 'css-loader', options: { modules: true, }, }, ],
      },
*/
      // 파일(이미지 등) 로더

      {
        //test: /\.(png|jpg|gif|svg)$/,
        test: /\.(jpe?g|png|PNG|gif|svg)$/,
        // type: "asset/inline",
        type: "asset/resource",
        generator: {
          filename: "asset/img/[name][ext]?[hash]",
        },
      },
      /*
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        type: "asset/resource",
        use : [
            'file-loader?name=asset/images/[name].[ext]?[hash]',
            'image-webpack-loader'
        ]
      },
      */
      // 폰트 로더
      {
        test: /\.(otf|eot|woff|woff2)$/,
        // type: "asset/inline",
        type: "asset/resource",
        generator: {
          filename: "asset/font/[name][ext]?[hash]",
        },
      },
    ],
  },
};
