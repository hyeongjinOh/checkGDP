import React from "react";

export const HelpUtilsTest = [
    //   111   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 1,
        "mname": "Login Page",
        "subMenu": [
            {
                sid: 1,
                sname: "회원 가입",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 회원가입을 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-1-1.png`
                    },
                    {
                        order: 2,
                        //circledDigit: <span style={{ color: "red" }}>{"\u2461"}</span>,
                        procedure: <span>회원가입 양식에 따라 가입 정보를 작성 후 <span style={{ color: "red" }}>{"\u2461"}</span> 가입을 클릭합니다(<span style={{ color: "red" }}>*</span> 표시된 부분은 반드시 작성.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-1-2.png`
                    },
                    {
                        order: 3,
                        procedure: <span><span style={{ color: "red" }}>{"\u2462"}</span> 인증메일 발송을 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-1-3.png`
                    },
                    {
                        order: 4,
                        procedure: <span>가입 요청한 e-mail을 확인 후 발송된 e-mail에서 인증하기 버튼을 클릭합니다.<br></br>     메일 인증이 완료 되었으면 <span style={{ color: "red" }}>{"\u2463"}</span> 로그인하기를 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-1-4.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "로그인",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>회원가입 시 작성하였던 아이디(e-mail와 비밀번호를 입력하고. <span style={{ color: "red" }}>{"\u2460"}</span> 로그인 버튼을 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-2-1.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "아이디 찾기",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 아이디 찾기를 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-3-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>회원가입 시 작성하였던 이름과 연락처를 작성후 찾기를 클릭합니다.<br></br>     {"\u279C"} <span style={{ color: "red" }}>{"\u2461"} </span>찾기를 클릭합니다.<br></br>     {"\u279C"} 가입 시 작성하였던 아이디(e-mail를 확인할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-3-2.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "비밀번호 찾기",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 비밀번호 찾기를 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-4-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>아이디, 이름, 연락처를 작성 후 <span style={{ color: "red" }}>{"\u2461"}</span> 찾기를 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-4-2.png`
                    },
                    {
                        order: 3,
                        procedure: <span>가입 시 작성한 아이디(e-mail로 새 비밀번호가 전송 되었다는 메시지를 확인 후 <span style={{ color: "red" }}>{"\u2462"}</span> 확인을 클릭합니다.<br></br>     가입 시 작성한 아이디(e-mail를 확인하여 새 비밀번호를 확인 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-4-3.png`
                    }
                ]
            },
            {
                sid: 5,
                sname: "다국어 설정",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 한국어, English, 中文 선택이 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/1.Login/1-5-1.png`
                    },
                ]
            }
        ]
    },
    //   222   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 2,
        "mname": "Dashboard",
        "subMenu": [
            {
                sid: 1,
                sname: "Dashboard",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트 사용자가 전력설비 및 진단점검 관련 현황을 한눈에 파악할 수 있는 대시보드를 제공하며 등록설비 및 등록사업장 현황, e-Health Check (e-HC 진행 현황, 점검/사고이력 현황, 서비스 요청 및 진행 현황정보를 커스터마이징 배치로 지원하는 서비스 입니다.",
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-0-0.ng`
                    }
                ]
            },
            {
                sid: 2,
                sname: "Dashboard - 운영 현황",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 사용자가 e-Health Portal에 등록해서 관리하고 있는 전력설비 현황 및 사업장에 대한 요약정보를 표시합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "Dashboard - e-HC 진행률",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2461"}
                            </span> e-Health Check 서비스 진행 현황에 대한 요약정보 표시,
                            e-Health Portal 웹사이트에 등록 후 진단점검 미진행 전력설비의 비율을 표시합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 4,
                sname: "Dashboard - e-HC Status",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2462"}</span> e-Health Portal에 등록 후 진단점검을 진행한 전력설비의
                            3단계별 e-Health Check 평균 점수와 전력설비별 점수 현황을 표시합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 5,
                sname: "Dashboard - e-HC 평균 점수",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2463"}</span> 사업장 기준 기기의 평균 점수를 표시합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 6,
                sname: "Dashboard - 노후 교체 현황",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2464"}</span> 노후 교체 요청 설비에 대해 SPG별로 요청 현황을 표시합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 7,
                sname: "Dashboard - e-HC 점수 현황",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2465"}</span> 단계별로 기기의 점수 현황을 표시합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 8,
                sname: "Dashboard - 점검 사고 이력",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                <span style={{ color: "red" }}>{"\u2466"}</span> e-Health Portal에서 관리하는 전력설비 관련하여
                                LS ELECTRIC에서 진행한 과거 점검이력 현황을 표시합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 9,
                sname: "Dashboard - 진단 점검 서비스",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                <span style={{ color: "red" }}>{"\u2467"}</span> 진단 점검 서비스의 관련된 바로 가기 서비스를 표시합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                ]
            },
            {
                sid: 10,
                sname: "Dashboard - 설정",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2468"}</span> 선택한 사업장에 대해서 핀셋 기능을 사용하여 접속 시 원하는 곳의 정보를 메인으로 지정 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-.png`
                    },
                    {
                        order: 2,
                        procedure:
                            <span>
                                <span style={{ color: "red" }}>{"\u2469"}</span> 카드위치편집 아이콘을 클릭하여 편집모드로 들어갈 수 있습니다.
                                <br></br>     <span style={{ color: "red" }}>{"\u246A"}</span> 카드를 원하는 위치에 드래그하여 위치를 교환하는 형식으로 변경 할 수 있습니다.
                                <br></br>     <span style={{ color: "red" }}>{"\u246B"}</span> 저장버튼을 눌러 변경된 상태를 저장합니다.
                                <br></br>     <span style={{ color: "red", fontSize: "15px" }}>모바일 미지원</span>
                            </span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-1-1-0.png`
                    }
                ]
            },
            {
                sid: 11,
                sname: "헤더 - My Account",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span>을 클릭하여 사용자의 개인정보를 확인하고 수정 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-2-1-.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2461"}</span> 사용자의 타입, 사용자 개인정보 및 회사, 사업장 업종 등의 사용자 정보를 확인합니다.<br></br>     아이디, 이름, 회사를 제외한 정보의 변경이 가능합니다.<br></br>     탈퇴하기로 회원 탈퇴가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-2-1-.png`
                    }
                ]
            },
            {
                sid: 12,
                sname: "헤더 - 로그아웃",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span>을 클릭하여 로그아웃을 이용 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-2-2-.png`
                    },
                    {
                        order: 2,
                        procedure: "로그아웃을 진행하여 해당 PC 또는 브라우저에서 로그인 유지 상태를 해제합니다.",
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-2-2-.png`
                    }
                ]
            },
            {
                sid: 13,
                sname: "헤더 - 알림",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 사이트에서 사용자에게 전달 된 알림 메시지를 확인할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-3-1.ng`
                    },
                ]
            },
            {
                sid: 14,
                sname: "헤더 - 다국어 설정",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 한국어, 영어, 중국어로 되어있으며 선택된 언어로 사이트를 사용 가능합니다.<br></br>     모바일 미지원</span>,
                        captureImg: `../../../../../static/img/img_help/2.Dashboard/2-4-1.ng`
                    },
                ]
            }
        ]
    },
    //   333   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 3,
        "mname": "e-Health Check",
        "subMenu": [
            {
                sid: 1,
                sname: "e-Health Checker",
                snameContents: [
                    {
                        order: 1,
                        procedure: "전력설비가 안전하고 효율적으로 운영될 수 있도록 3단계로 구분된 체계적인  Health Check (진단점검 서비스를 제공하여 전력 설비의 건강 상태를 체크하는 서비스 입니다.",
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-0.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "e-Health Checker - 트리",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>각 사용자가 속한 회사 ~ 전기실의 기기 상태, 점검 결과를 나타내어 주는 페이지입니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span>을 클릭하여 트리를 확인할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-1-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2461"}</span> 화면 왼쪽 검색창에 검색어를 입력합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-1-2.png`
                    },
                    {
                        order: 3,
                        procedure: <span><span style={{ color: "red" }}>{"\u2462"}</span>검색 결과가 파란색으로 포커싱 되어 나타납니다</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-1-3.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "e-Health Checker - e-HC Status",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 현재 선택된 기기의 개수, 점검주기, 기기의 상태를 보여줍니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-2-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2461"}</span> 설정 버튼을 눌러 점검주기 변경이 가능합니다.
                            <br></br>     {"\u279C"} 점검주기는 30일, 90일 180일, 365일로 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-2-2.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "e-Health Checker - e-HC List",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 현재 Basic/Premium/Advanced 상태에 선택합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 선택한 상태에 대한 기기 목록을 확인합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-3-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2462"}</span> 새 등록, 기 등록 기기 조회가 가능합니다.
                            <br></br>          {"\u279C"} 새 등록 : 진단점검 진행 이력이 없는 기기,
                            <br></br>          {"\u279C"} 기 등록 : 진단점검 진행 이력이 있는 기기
                            <br></br>     <span style={{ color: "red" }}>{"\u2463"}</span> 조건 검색을 사용하여 조회가 가능합니다.
                            <br></br>          {"\u279C"} 조건은 Panel 명, 시리얼 번호, 담당자별 검색 입력하여 조회가 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-3-2.png`
                    },
                ]
            },
            {
                sid: 5,
                sname: "e-Health Checker - 진단점검",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 점검 진행 버튼을 클릭하여 진단점검이 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>점검 진행 버튼을 클릭하여 진단점검이 가능합니다.
                            <br></br>     {"\u279C"} <span style={{ color: "red" }}>{"\u2461"}</span> 각 점검 항목은 기기, 점검 상태 마다 다릅니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-2.png`
                    },
                    {
                        order: 3,
                        procedure: <span>점검 진행 버튼을 클릭하여 Premium 진단점검이 가능합니다.
                            <br></br>     {"\u279C"} <span style={{ color: "red" }}>{"\u2462"}</span> 프리미엄 진단 단계를 조회하여 목록을 요청 합니다.
                            <br></br>     {"\u279C"} <span style={{ color: "red" }}>{"\u2463"}</span> 점수가 낮은 경우 Premium 진단점검 요청을 합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-3.png`
                    },
                    {
                        order: 4,
                        procedure: <span>재진행 버튼을 클릭하여 진단점검 재진행이 가능합니다.
                            <br></br>     {"\u279C"}<span style={{ color: "red" }}>{"\u2464"}</span> 노말 진단 단계를 조회하여 목록을 요청 합니다.
                            <br></br>     {"\u279C"}<span style={{ color: "red" }}>{"\u2465"}</span> 점수가 높은 경우 노말로 이동 합니다.
                            <br></br>     {"\u279C"}<span style={{ color: "red" }}>{"\u2466"}</span> 요청 시 팝업창 알림이 뜹니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-4.png`
                    }
                ]
            },
            /* {
                sid: 6,
                sname: "e-Health Checker - 진단점검(프리미엄 진단점검 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>점검 진행 버튼을 클릭하여 진단점검이 가능합니다.<br></br>          {"\u279C"} <span style={{ color: "red" }}>{"\u2462"}</span> 프리미엄 진단 단계를 조회하여 목록을 요청 합니다.<br></br>          {"\u279C"} <span style={{ color: "red" }}>{"\u2463"}</span> 점수가 낮은 경우 프리미엄 진단점검 요청을 합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-3.png`
                    }
                ]
            },
            {
                sid: 7,
                sname: "e-Health Checker - 진단점검(재진행 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>점검 진행 버튼을 클릭하여 진단점검이 가능합니다.<br></br>          {"\u279C"}<span style={{ color: "red" }}>{"\u2464"}</span> 노말 진단 단계를 조회하여 목록을 요청 합니다.<br></br>          {"\u279C"}<span style={{ color: "red" }}>{"\u2465"}</span> 점수가 높은 경우 노말로 이동 합니다.<br></br>          {"\u279C"}<span style={{ color: "red" }}>{"\u2466"}</span> 요청 시 팝업창 알림이 뜹니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-4.png`
                    }
                ]
            }, */
            {
                sid: 6,
                sname: "e-Health Checker - VCB 진단점검(Basic",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>햄버거 메뉴에서 ‘Dashboard’ 를 클릭하여 e-HC Dashboard 화면으로 이동합니다.<br></br><span style={{ color: "red" }}>{"\u2460"}</span> 기기 트리에서 ‘청주 → 2사업장 → 전기실1 → VCB’ 를 선택합니다.<br></br><span style={{ color: "red" }}>{"\u2461"}</span> e-HC List 에서 점검 할 기기의 ‘시작’ 버튼을 클릭하면, 우측에 진단점검 화면이 나타납니다.<br></br><span style={{ color: "red" }}>{"\u2462"}</span> VCB에 대한 진단점검을 진행합니다.<br></br>완료 시 재진행, 공유, 프리미엄 진단점검 요청이 가능합니다</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-5.png`
                    },
                    {
                        order: 2,
                        procedure: "진단점검(VCB 예시",
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-6.png`
                    },
                    {
                        order: 3,
                        procedure: "진단점검(VCB 예시",
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-1-4-7.png`
                    }
                ]
            },
            {
                sid: 7,
                sname: "기기등록 현황",
                snameContents: [
                    {
                        order: 1,
                        procedure: "사용자가 e-Health Portal 웹사이트에 등록해서 관리하고 있는 전력설비의 세부적인 정보와 함께 e-Health Check 진단점검 점수를 제공하고 필요시 노후화된 설비의 교체를 요청합니다.",
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-2-0.png`
                    }
                ]
            },
            {
                sid: 8,
                sname: "기기등록 현황 - 목록",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 사업장의 등록 되어 있는 기기 목록을 요청하여 보실 수 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 조회를 이용하여 소속된 회사-사업장들의 기기를 확인 할 수 있습니다.
                            <br></br>          {"\u279C"} 조건은 상세 사업장, 전기실, 기기 명으로 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-2-1.png`
                    },
                ]
            },
            {
                sid: 9,
                sname: "기기등록 현황 - 노후교체 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: "노후된 기기 요청 신청을 합니다.",
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-2-2.png`
                    },
                ]
            },
            {
                sid: 10,
                sname: "기기등록 현황 - List Download(관리자",
                snameContents: [
                    {
                        order: 1,
                        procedure: "관리자, 엔지니어만 활성화되며 선택된 회사-사업장의 기기 정보 목록을 다운로드 할 수 있습니다.\n     모바일은 미지원",
                        captureImg: `../../../../../static/img/img_help/3.e-Health Checker3-2-3.png`
                    },
                ]
            }
        ]
    },
    //   444   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 4,
        "mname": "Report",
        "subMenu": [
            {
                sid: 1,
                sname: "진단점검 Report",
                snameContents: [
                    {
                        order: 1,
                        procedure: "포탈 사용자 편의성 향상을 위하여 e-Health Check 서비스에서 생성된 진단점검 보고서와 전력설비의 출하검사성적서를 사업장단위로 제공하는 서비스 입니다.",
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-0.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "진단점검 Report - 조회",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 상세 사업장, 전기실, 조회기간 옵션별로 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-1-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>Filter는 기기유형(전체, 배전반, 유입식TR, ACB, GIS, MoldTR, VCB 7가지와 점검단계(전체, Basic, Premium, Advanced 4가지로 <span style={{ color: "red" }}>{"\u2461"}</span> 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-1-2.png`
                    },
                    {
                        order: 3,
                        procedure: <span>검색은 모델 명, 시리얼 번호로 <span style={{ color: "red" }}>{"\u2462"}</span>을 클릭하여 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-1-3.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "진단점검 Report - 보기",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 보기를 클릭하여 우측에 진단점검 결과 Report 보기가 가능합니다.
                            <br></br>     모바일은 <span style={{ color: "red" }}>{"\u2460"}</span> 보기를 클릭하여 하단으로 내리면 바로 보기가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-2-1.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "진단점검 Report - PDF 다운로드",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 다운로드가 가능합니다.<br></br>     모바일은 상세보기에서 다운로드가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-3-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2461"}</span> 선택된 Report에 대해 일괄다운로드(압축파일을 제공합니다. (모바일 제외</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-3-2.png`
                    }
                ]
            },
            {
                sid: 5,
                sname: "진단점검 Report - 진단결과 공유",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>진단결과 Report를 <span style={{ color: "red" }}>{"\u2460"}</span> 진단결과 공유 및 공유 모양 아이콘을 클릭합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-4-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>진단결과 Report를 다른 사용자에게 <span style={{ color: "red" }}>{"\u2461"}</span> 이메일로 공유 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-1-4-2.png`
                    },
                ]
            },
            {
                sid: 6,
                sname: "Test Report",
                snameContents: [
                    {
                        order: 1,
                        procedure: "전력설비 출하검사성적서 View를 통하여 검사 항목별 내용을 파악하거나 PDF 파일로 다운로드 제공합니다.",
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-2-0.png`
                    }
                ]
            },
            {
                sid: 7,
                sname: "Test Report - 조회",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> Filter는 기기유형(전체, 배전반, 유입식TR, ACB, GIS, MoldTR, VCB로 조회가 가능합니다.
                            <br></br>          검색은 모델 명, 시리얼 번호로 <span style={{ color: "red" }}>{"\u2461"}</span> 조회가 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-2-1-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2462"}</span> 시리얼 번호를 직접 입력하여 검색이 가능합니다. <span style={{ color: "red" }}>{"\u2463"}</span> 모바일은 QR코드 스캔과 시리얼 번호 직업 입력하여 검색이 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-2-1-2.png`
                    },
                    {
                        order: 3,
                        procedure: <span><span style={{ color: "red" }}>{"\u2464"}</span> 시리얼 번호 버튼 클릭 시 팝업 화면. <span style={{ color: "red" }}>{"\u2465"}</span> QR 버튼 클릭 시 팝업 화면
                        </span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-2-1-3.png`
                    }
                ]
            },
            {
                sid: 8,
                sname: "Test Report - 성적서 다운로드",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 성적서를 다운로드 할 수 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 선택된 성적서에 대해 일괄다운로드 (압축파일을 제공합니다. (모바일 제외</span>,
                        captureImg: `../../../../../static/img/img_help/4.Device registraton status/4-2-2-1.png`
                    }
                ]
            }
        ]
    },
    //   555   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 5,
        "mname": "설비수명 Report",
        "subMenu": [
            {
                sid: 1,
                sname: "설비수명 인자 설정",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Check 서비스의 3단계 진단점검 결과를 바탕으로 LS ELCTRIC 전문가의 지원을 통하여 설비수명 인자를 설정하는 기능을 제공.",
                        captureImg: `../../../../../static/img/img_help/5.Diagnostic CheckReport/5-1-0.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "설비수명 목록 및 조회",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                <span style={{ color: "red" }}>{"\u2460"}</span> 설비수명 기기 목록을 요청 할 수 있고 클릭 시 수명인자 설정을 진행 할 수 있습니다.
                                <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 검색을 사용하여 조회가 가능합니다.<br></br>     {"\u279C"} 검색 조건은 기기 명, 패널 명, 시리얼 번호, 모델 명으로 조회가 가능합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/5.Diagnostic CheckReport/5-1-1.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "설비수명 인자 설정",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                수명인자 설정이 가능합니다.
                                <br></br>          {"\u279C"} 목록 중 기기를 클릭하여 설정 항목으로 들어 갈 수 있습니다.
                                <br></br>          {"\u279C"} <span style={{ color: "red" }}>{"\u2460"}</span> 설정 항목에서 사용자가 항목 및 사용자 입력 값을 정하여 추가하여
                                <span style={{ color: "red" }}>{"\u2461"}</span>,
                                <span style={{ color: "red" }}>{"\u2462"}</span> 저장 할 수 있습니다.
                            </span>
                        ,
                        captureImg: `../../../../../static/img/img_help/5.Diagnostic CheckReport/5-1-2.png`
                    },
                    {
                        order: 2,
                        procedure:
                            <span>
                                수명인자 설정이 가능합니다.
                                <br></br>          {"\u279C"} 목록 중 기기를 클릭하여 설정 항목으로 들어 갈 수 있습니다.
                                <br></br>          {"\u279C"} <span style={{ color: "red" }}>{"\u2461"}</span> 설정 항목에서 스크롤을 내리면 User Defined 곳에 사용자가 항목을 새롭게 추가 할 수 있습니다.
                            </span>
                        ,
                        captureImg: `../../../../../static/img/img_help/5.Diagnostic CheckReport/5-1-2.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "설비수명 Report",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>LS ELCTRIC의 ALO 플랫폼과 연계하여 전력설비 수명과 관련된 Lifecycle 보고서를 제공.<br></br>          {"\u279C"}(23년 정식 오픈 및 비용 공지 예정</span>,
                        captureImg: `../../../../../static/img/img_help/5.Diagnostic CheckReport/5-2-0.png`
                    }
                ]
            }
        ]
    },
    //   666   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 6,
        "mname": "운영관리",
        "subMenu": [
            {
                sid: 1,
                sname: "사업장 전기실 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트에 등록 및 관리를 희망하는 설비 등록을 위하여 전력설비가 운영되고 있는 회사, 사업장 정보를 등록하여 관리하는 기능 제공합니다.",
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-0.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "사업장 전기실 관리 - 회사 검색(ADMIN",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 관리자는 회사 검색을 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-1-1.png`
                    },
                ]
            },
            {
                sid: 3,
                sname: "사업장 전기실 관리 - 사업장 추가(사용자",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>사용자는 사업장을 추가요청 두 가지 방법으로 할 수 있습니다.<br></br>          {"\u279C"} 사업장 검색 추가, 사업장 신규등록 추가가 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-1-2.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "사업장 전기실 관리 - 사업장 검색 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            사업장 추가 클릭 시 사업장 <span style={{ color: "red" }}>{"\u2460"}</span> 검색 할 수 있습니다.
                            <br></br>          <span style={{ color: "red" }}>{"\u2461"}</span> 버튼을 눌러 바로 추가 요청 할 수 있습니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-2-2.png`
                    },
                    {
                        order: 2,
                        procedure: "사업장 추가 시 사업장 요청으로 왼쪽 트리 창에 추가가 됩니다.",
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-2-3.png`
                    }
                ]
            },
            {
                sid: 5,
                sname: "사업장 전기실 관리 - 사업장 신규등록 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure: "사업장 신규 등록 시 회사명을 검색하여 간단하게 등록 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-2-4.png`
                    },
                    {
                        order: 2,
                        procedure: "사용자가 사업장 이미지, 사업장 명, 사업장 주소, 메모 정보 입력을 하여 추가 요청 및 저장을 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-2-5.png`
                    }
                ]
            },
            {
                sid: 6,
                sname: "사업장 전기실 관리 - 상세 사업장 신규 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            햄버거 메뉴에서 ‘운영관리 {"\u279C"} 기기 등록 관리’ 를 클릭하여, 사업장 전기실 관리화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 좌측 트리에서 LS ELECTRIC 청주 를 선택 후 ‘상세사업장 추가’를 클릭하여 화면 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 상세사업장명, 상세사업장 주소 및 메모를 입력 후 ‘저장’ 을 클릭하면 상세사업장이 추가됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-3-1.png`
                    }
                ]
            },
            {
                sid: 7,
                sname: "사업장 전기실 관리 - 상세 사업장 수정",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                <span style={{ color: "red" }}>{"\u2460"}</span> 트리 활성화 버튼을 이용하여 사용자에게 보여줄 지 선택 할 수 있습니다.
                                <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 우측 수정 아이콘을 클릭하여 상세 사업장을 수정 할 수 있습니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-3-2.png`
                    },
                    {
                        order: 2,
                        procedure:
                            <span>
                                <span style={{ color: "red" }}>{"\u2462"}</span> 상세 사업장 명, 상세사업장 주소 및 메모를 입력 후 ‘저장’ 을 클릭하면 상세사업장이 수정됩니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-3-3.png`
                    }
                ]
            },
            {
                sid: 8,
                sname: "사업장 전기실 관리 - 상세 사업장 삭제",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 우측 삭제 아이콘을 클릭하여 삭제를 하실 수 있습니다.
                            <span style={{ color: "red" }}>{"\u2461"}</span> 팝업창이 뜬 뒤 ‘확인’ 을 클릭하면 상세사업장이 삭제됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-3-4.png`
                    }
                ]
            },
            {
                sid: 9,
                sname: "사업장 전기실 관리 - 전기실 신규 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            햄버거 메뉴에서 ‘운영관리 {"\u279C"} 기기 등록 관리’ 를 클릭하여 사업장 전기실 관리화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 좌측 트리에서 LS ELECTRIC 청주 {"\u279C"} 2사업장 을 선택 후 ‘전기실 추가’를 클릭하여 화면 이동합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-4-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2461"}</span> 전기실명, 전기실 도면 첨부파일 및 메모를 입력 후 ‘저장’을 클릭하면 전기실이 추가됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-4-2.png`
                    }
                ]
            },
            {
                sid: 10,
                sname: "사업장 전기실 관리 - 전기실 수정",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 트리 활성화 버튼을 이용하여 다른 사용자에게 보여줄 지 선택 할 수 있습니다.
                            <span style={{ color: "red" }}>{"\u2461"}</span> 우측 수정 아이콘을 클릭하여 전기실을 수정 할 수 있습니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-4-3.png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2462"}</span> 트리 활성화 버튼, 전기실명, 전기실 도면 첨부파일 및 메모를 입력 후 ‘수정’을 클릭하면 전기실이 수정됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-4-4.png`
                    }
                ]
            },
            {
                sid: 11,
                sname: "사업장 전기실 관리 - 전기실 삭제",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 우측 삭제 아이콘을 클릭하여 삭제를 하실 수 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 팝업 창이 뜬 뒤 ‘확인’ 을 클릭하면 상세사업장이 삭제됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-1-4-5.png`
                    }
                ]
            },
            {
                sid: 12,
                sname: "기기등록 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트에 등록 및 관리를 희망하는 전력설비를 신규로 등록하여 관리할 수 있으며 향상된 사용자 등록 편의성을 제공합니다.",
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-0.png`
                    }
                ]
            },
            {
                sid: 13,
                sname: "기기등록 관리 - 기기 개별등록",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            햄버거 메뉴에서 ‘운영관리 {"\u279C"} 기기 등록 관리’ 를 클릭하여 기기 등록 관리화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 좌측 트리에서 LS ELECTRIC 청주 {"\u279C"} 2사업장 {"\u279C"} 전기실1 을 선택 후 기기 등록을 클릭하여 화면 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 개별등록을 클릭하여 개별등록 화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 기기명, Panel명, 모델명, 시리얼번호, 전압/전류 정보, 제조사 등을 입력하고 저장합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-1-1.png`
                    }
                ]
            },
            {
                sid: 14,
                sname: "기기등록 관리 - 기기 일괄등록",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> ‘일괄등록’ 을 클릭하여 일괄등록 화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> ‘Excel 양식 다운로드’ 링크로 양식을 다운로드하여 일괄등록 할 기기 정보를 양식에 맞게 입력하고 저장합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> ‘첨부파일 선택’ 을 클릭하여 기기정보를 입력한 엑셀파일을 선택하고 아래의 ‘Upload’ 버튼을 클릭하여 일괄등록을 합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2463"}</span> 일괄 등록한 결과를 확인합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-2-1.png`
                    }
                ]
            },
            {
                sid: 15,
                sname: "(기기 일괄등록엑셀 양식 설명",
                snameContents: [
                    {
                        order: 1,
                        procedure: "엑셀 양식 설명",
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-2-2.png`
                    }
                ]
            },
            {
                sid: 16,
                sname: "기기등록 관리 - 기기 정보 목록",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            햄버거 메뉴에서 ‘운영관리 {"\u279C"} 기기 등록 관리’ 를 클릭하여 기기 등록 관리화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 좌측 트리에서 LS ELECTRIC 청주 {"\u279C"} 2사업장 {"\u279C"} 전기실1 을 선택하여 화면 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 전기실1에 등록된 기기정보 목록을 확인합니다.
                            <br></br>     기기 목록의 삭제를 제외한 필드를 클릭하면, 해당 기기의 상세정보화면으로 이동합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-3-1.png`
                    }
                ]
            },
            {
                sid: 17,
                sname: "기기등록 관리 - 기기 조회",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 모델 명, 시리얼 번호로 조회가 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-4-1.png`
                    }
                ]
            },
            {
                sid: 18,
                sname: "기기등록 관리 - 기기 상세 정보",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            기기 정보 목록 조회에서 상세정보를 조회할 기기를 클릭하면, 해당 기기의 상세정보를 조회할 수 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 제조사, 첨부파일, 메모 내용을 추가로 확인합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 기기 정보에 대한 수정 및 삭제를 할 수 있습니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-5-1.png`
                    }
                ]
            },
            {
                sid: 19,
                sname: "기기등록 관리 - 기기 정보 수정",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            기기 정보 상세정보 화면에서 ‘수정 아이콘’ 을 클릭하면, 기기정보 수정화면으로 이동합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 정보를 수정하고 ‘저장’ 버튼을 클릭하면 기기 정보가 수정됩니다.
                            <br></br>     (예시 첨부파일 추가, 메모 수정
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-6-1.png`
                    }
                ]
            },
            {
                sid: 20,
                sname: "기기등록 관리 - 기기 삭제(일괄 선택 삭제",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            기기 정보 목록 조회에서 삭제할 기기를 선택하여 기기를 일괄 삭제할 수 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2460"}</span> 삭제할 기기를 체크박스를 클릭하여 선택합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 상단의 ‘삭제 아이콘’ 을 클릭하면 선택된 기기를 일괄 삭제합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 기기 정보 목록의 ‘삭제 아이콘’ 을 클릭하면 해당 기기가 삭제됩니다.
                            <br></br>     <span style={{ color: "red" }}>* 모바일 화면에서는 일괄삭제를 제공하지 않음</span>
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-7-1.png`
                    }
                ]
            },
            {
                sid: 21,
                sname: "기기등록 관리 - 다운로드",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 다운로드 버튼을 클릭하여 해당 전기실의 기기 목록 확인이 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/6.Operations Managment/6-2-8-1.png`
                    }
                ]
            }
        ]
    },
    //   777   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 7,
        "mname": "Management",
        "subMenu": [
            {
                sid: 1,
                sname: "승인 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "신규 가입자 승인, 사업장 승인, 진단점검/노후교체 요청 관리가 가능합니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-0png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "승인 관리 - 신규 가입자",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 관리자가 신규 가입자의 목록을 확인하고 승인요청을 확인 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-11.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2461"}</span> 신규 가입자의 정보를 확인하고 승인 여부(승인, 반려, 사용자 타입(Admin, Engineer, User을 정할 수 있습니다.
                            <br></br>          {"\u279C"}사용자 타입 지정 시 Admin, Engineer는 추가가 안 됩니다.
                            <br></br>          {"\u279C"}사용자 타입 지정 시 User는 회사_사업장 목록이 추가 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-12.png`
                    },
                    {
                        order: 3,
                        procedure: <span><span style={{ color: "red" }}>{"\u2462"}</span> 사용자 타입 지정 시 User는 회사_사업장 목록이 추가 할 수 있습니다.<br></br>
                            {"\u279C"}사용자 타입 지정 시 Admin, Engineer는 추가가 안 됩니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-13.png`
                    },
                    {
                        order: 4,
                        procedure: <span><span style={{ color: "red" }}>{"\u2463"}</span> 회사-사업장 추가 시 회사와 사업장을 추가하여 등록합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-14.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "승인 관리 - 사업장 승인 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 관리자가 사업장 승인 요청 목록을 확인 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-21.png`
                    },
                    {
                        order: 2,
                        procedure: <span><span style={{ color: "red" }}>{"\u2461"}</span>
                            사용자가 요청한 사업장의 정보를 확인하고 승인 여부(승인, 반려을 확인 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-22.png`
                    },
                    {
                        order: 3,
                        procedure: <span><span style={{ color: "red" }}>{"\u2462"}</span> 수정 아이콘을 클릭하여 사용자가 요청한 사업장의 정보를 수정 할 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-23.png`
                    },
                    {
                        order: 4,
                        procedure: <span><span style={{ color: "red" }}>{"\u2463"}
                        </span> 사업장 명, 메모를 수정하여 저장을 합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-24.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "승인 관리 - 진단점검/노후교체 승인 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 진단점검/노후교체 승인 요청 목록을 요청하여 확인 할 수 있습니다.
                            <br></br>          {"\u279C"}BASIC에서 진단점검 완료 후 PREMIUM 진단 요청된 상태의 기기,
                            <br></br>          {"\u279C"}교체 요청된 기기,
                            <br></br>          {"\u279C"}엔지니어 배정이 완료 된 접수 완료 상태의 기기 목록을 확인합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 승인 요청에서 교체요청을 클릭하여 엔지니어 배정을 할 수 있습니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-31.png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            교체 요청 승인 요청 시 <span style={{ color: "red" }}>{"\u2462"}</span> 상세정보 및 엔지니어 선택 및 확인 할 수 있습니다.
                            <br></br>          {"\u279C"} 엔지니어를 검색하여 배정이 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-1-32.png`
                    }
                ]
            },
            {
                sid: 5,
                sname: "사용자 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "사업장별 사용자 목록, 사용자 타입, 사용자별 활성화/비활성화 관리를 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-2-0png`
                    }
                ]
            },
            {
                sid: 6,
                sname: "사용자 관리 - 목록",
                snameContents: [
                    {
                        order: 1,
                        procedure: "사용자 소속 기준으로 사용자 목록을 조회 할 수 있습니다.\n     사업장, 사용자 타입으로 필요한 정보만 불러올 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-2-1png`
                    }
                ]
            },
            {
                sid: 7,
                sname: "사용자 관리 - 정보수정",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            사용자 목록에서 사용자를 클릭하면
                            <span style={{ color: "red" }}>{"\u2460"}</span> 사용자 상세정보 및 사용자 타입 변경,
                            회사-사업장 목록 추가, 사용자 활성화 버튼을 변경 할 수 있습니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-2-12.png`
                    }
                ]
            },
            {
                sid: 8,
                sname: "사업장 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트의 회사-사업장 추가, 사업장별 데이터, 사업장 현황을 관리 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-3-0png`
                    }
                ]
            },
            {
                sid: 9,
                sname: "사업장 관리 - 회사 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 회사 추가가 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-3-11.png`
                    }
                ]
            },
            {
                sid: 10,
                sname: "사업장 관리 - 회사 수정/삭제",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2461"}</span> 회사 상세정보 확인이 가능합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 회사 수정, 삭제가 가능합니다.
                            <br></br>          {"\u279C"}팝업 창이 뜬 뒤 <span style={{ color: "red" }}>{"\u2463"}</span>‘확인’ 을 클릭하면 회사가 삭제됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-3-12.png`
                    }
                ]
            },
            {
                sid: 11,
                sname: "사업장 관리 - 사업장 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2463"}</span> 사업장 추가가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-3-13.png`
                    }
                ]
            },
            {
                sid: 12,
                sname: "사업장 관리 - 사업장 수정/삭제",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2464"}</span> 사업장 상세정보 확인이 가능합니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2465"}</span> 사업장 수정, 삭제가 가능합니다.
                            <br></br>          {"\u279C"} <span style={{ color: "red" }}>{"\u2466"}</span> 팝업 창이 뜬 뒤 ‘확인’ 을 클릭하면 사업장이 삭제됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-3-14.png`
                    }
                ]
            },
            {
                sid: 13,
                sname: "메시지 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Checker 메시지, 에러 메세지, HTTP 메세지, 알람 메세지 항목 및 다국어 관리를 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-4-0png`
                    },
                    {
                        order: 2,
                        procedure: "e-Health Checker 메시지, 에러 메시지, HTTP 메시지, 알람 메시지 목록을 확인하고 추가/삭제가 가능합니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-4-11.png`
                    },
                    {
                        order: 3,
                        procedure: "메시지 추가 시 이름과 종류를 추가 할 수 있고, 언어별의 따라 메시지를 추가 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-4-12.png`
                    }
                ]
            },
            {
                sid: 14,
                sname: "메뉴 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트 계정 유형별 메뉴 항목 활성화/비활성화, 다국어 관리를 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-5-0png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            Admin, User, Engineer별 이용 권한이 부여된 메뉴를 관리하는 페이지입니다.<br></br>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 메뉴별로 목록을 조회 할 수 있습니다.<br></br>
                            <span style={{ color: "red" }}>{"\u2461"}</span> 초기화 : 설정하기 전 처음 상태로 돌아가려면 초기화를 클릭합니다.<br></br>
                            <span style={{ color: "red" }}>{"\u2462"}</span> 수정 : 클릭하여 권한을 수정합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-5-11.png`
                    },
                    {
                        order: 3,
                        procedure: <span>
                            다국어 설정이 가능합니다.<br></br>          {"\u279C"} 언어별로 수정이 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-5-21.png`
                    }
                ]
            },
            {
                sid: 15,
                sname: "Check Sheet 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트 계정 유형별 메뉴 항목 활성화/비활성화, 다국어 관리를 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-6-0png`
                    }
                ]
            },
            {
                sid: 16,
                sname: "Check Sheet 관리 - 목록",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Check 서비스에서 제공하는 기기별 진단점검 항목의 버전 및 다국어 관리 메뉴입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2460"}</span> 현재 등록된 기기의 버전의 Check Sheet 목록을 조회 할 수 있습니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2461"}</span> 점검단계는 전체, Basic. Premium, Advanced 4가지로 조회가 가능합니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2462"}</span> 버전을 선택하여 변경이 가능합니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2463"}</span> 버전을 수정을 하고 새롭게 추가가 가능합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-6-1png`
                    }
                ]
            },
            {
                sid: 17,
                sname: "Check Sheet 관리 - 신규 버전 추가",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Check 서비스에서 제공하는 기기별 진단점검 항목의 버전 및 다국어 관리 메뉴입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2464"}</span>  팝업 창이 띈 다음 버전을 수정을 하고 새롭게 추가가 가능합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-6-12.png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            e-Health Check 서비스에서 제공하는 기기별 진단점검 항목의 버전 및 다국어 관리 메뉴입니다.<br></br>
                            <span style={{ color: "red" }}>{"\u2465"}</span> 팝업 창이 다시 한 번 띈 다음 편집화면으로 이동합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-6-13.png`
                    }
                ]
            },
            {
                sid: 18,
                sname: "Check Sheet 관리 - 버전 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Check 서비스에서 제공하는 기기별 진단점검 항목의 버전 및 다국어 관리 메뉴입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2466"}</span> 점검단계는 전체, Basic. Premium, Advanced 4가지로 조회가 가능합니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2467"}</span> 원하는 항목을 추가하거나 추가한 항목을 수정하여 작업 완료를 하여 버전을 추가 및 수정을 합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-6-14.png`
                    }
                ]
            },
            {
                sid: 19,
                sname: "이메일 상담 관리",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 웹사이트 사용자가 보낸 이메일 상담 리스트의 관리를 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/7.Management/7-7-0png`
                    }
                ]
            },
            {
                sid: 20,
                sname: "이메일 상담 관리 - 목록",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Portal 사용자가 보낸 이메일 상담 리스트의 관리입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2460"}</span> 문의 유형 별로 조회가 가능합니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2461"}</span> 제목, 문의 내용, 답변 별로 검색 조회가 가능합니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2462"}</span> 답변하기를 눌러 문의에 관한 답변을 남길 수 있습니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-7-11.png`
                    }
                ]
            },
            {
                sid: 21,
                sname: "이메일 상담 관리 - 답변하기",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Portal 사용자가 보낸 이메일 상담 리스트의 관리입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2463"}
                                </span> 답변 작성 및 첨부 파일을 작성 한 후 전송을 눌러 답변하기를 등록 할 수 있습니다.<br></br>          {"\u279C"}
                                문의 했던 요청자와 문의 내용이 확인이 가능합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-7-12.png`
                    }
                ]
            },
            {
                sid: 22,
                sname: "이메일 상담 관리 - 답변완료",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Portal 사용자가 보낸 이메일 상담 리스트의 관리입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2464"}</span> 답변 완료를 클릭하여 답변 정보를 확인 할 수 있습니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-7-13.png`
                    }
                ]
            },
            {
                sid: 23,
                sname: "이메일 상담 관리 - 상세정보",
                snameContents: [
                    {
                        order: 1,
                        procedure:
                            <span>
                                e-Health Portal 사용자가 보낸 이메일 상담 리스트의 관리입니다.<br></br>          {"\u279C"}
                                <span style={{ color: "red" }}>{"\u2465"}</span> 답변 완료는 정보 확인만 가능합니다.
                            </span>,
                        captureImg: `../../../../../static/img/img_help/7.Management/7-7-14.png`
                    }
                ]
            }
        ]
    },
    //   888   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 8,
        "mname": "서비스 소개",
        "subMenu": [
            {
                sid: 1,
                sname: "서비스 둘러보기",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal의 대표적인 기능을 소개하는 페이지입니다.",
                        captureImg: `../../../../../static/img/img_help/8.Service Introduc/8-1-0.png`
                    },
                    {
                        order: 2,
                        procedure: "e-Health Portal의 대표적인 기능을 소개하는 페이지입니다.",
                        captureImg: `../../../../../static/img/img_help/8.Service Introduc/8-1-1.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "e-Health Portal 소개",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 주요 서비스의 대한 설명을 하는 페이지 입니다.",
                        captureImg: `../../../../../static/img/img_help/8.Service Introduc/8-2-0.png`
                    },
                    {
                        order: 2,
                        procedure: "e-Health Portal 주요 서비스의 대한 설명을 하는 페이지 입니다.",
                        captureImg: `../../../../../static/img/img_help/8.Service Introduc/8-2-1.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "도움말",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 이용에 도움을 주는 도움말 페이지입니다.",
                        captureImg: `../../../../../static/img/img_help/8.Service Introduc/8-3-0.png`
                    },
                    {
                        order: 2,
                        procedure: "e-Health Portal 이용에 도움을 주는 도움말 페이지입니다.",
                        captureImg: `../../../../../static/img/img_help/8.Service Introduc/8-3-1.png`
                    }
                ]
            }
        ]
    },
    //   999   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    {
        "id": 9,
        "mname": "서비스 요청",
        "subMenu": [
            {
                sid: 1,
                sname: "점검 출동 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: "LS ELECTRIC 제품의 대한 온라인 서비스를 신청이 가능합니다.",
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-1-0.png`
                    }
                ]
            },
            {
                sid: 2,
                sname: "점검 출동 요청 - 온라인 문의",
                snameContents: [
                    {
                        order: 1,
                        procedure: "신청인 정보 및 제품 고장 내용을 입력 후 신청이 가능합니다.",
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-1-1.png`
                    }
                ]
            },
            {
                sid: 3,
                sname: "Work Order",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 사용자가 등록 및 관리하는 전력설비와 관련하여 LS ELECTRIC에서 과거부터 현재까지 진행된 점검이력 및 현재 요청에 대한 점검현황을 제공합니다.",
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-2-0.png`
                    }
                ]
            },
            {
                sid: 4,
                sname: "Work Order - e-Health Check",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span>사용자가 소속된 회사-사업장을 클릭하여 조회를 합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-2-1-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2461"}</span> 사용자가 소속된 회사-사업장의 기준 점검을 상태별로 검색이 가능하고 목록을 조회 할 수 있습니다.
                            <br></br>          {"\u279C"} 상태는 전체, 요청, 접수, 진행중, 완료가 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 요청 일자 조회가 가능합니다.
                            <br></br>          {"\u279C"} 일자는 전체, 1개월, 3개월, 6개월 1년이 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2463"}</span> 검색 조건 검색이 가능합니다.
                            <br></br>          {"\u279C"} 조건은 기기 명, 패널 명, 시리얼 번호, 모델 명으로 조회가 가능합니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-2-1-2.png`
                    }
                ]
            },
            {
                sid: 5,
                sname: "Work Order - 점검출동",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span> 점검출동을 상태별로 검색이 가능하고 목록을 조회 할 수 있습니다.
                            <br></br>          {"\u279C"} 상태는 전체, 요청, 접수, 진행중, 완료가 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 요청 일자 조회가 가능합니다.
                            <br></br>          {"\u279C"} 일자는 전체, 1개월, 3개월, 6개월 1년이 있습니다.
                            <br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 검색 조건 검색이 가능합니다.
                            <br></br>          {"\u279C"}조건은 기기 명, 불량원인, 불량처리, 시리얼 번호, 모델 명으로 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-2-2-1.png`
                    }
                ]
            },
            {
                sid: 6,
                sname: "Work Order - 점검/사고이력",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 점검 및 사고이력을 상태별로 검색이 가능하고 목록을 조회 할 수 있습니다.<br></br>          {"\u279C"} 상태는 전체, 요청, 접수, 진행중, 완료가 있습니다.<br></br>     <span style={{ color: "red" }}>{"\u2461"}</span> 요청 일자 조회가 가능합니다.<br></br>          {"\u279C"} 일자는 전체, 1개월, 3개월, 6개월 1년이 있습니다.<br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 검색 조건 검색이 가능합니다.<br></br>          {"\u279C"}조건은 기기 명, 불량원인, 불량처리, 시리얼 번호, 모델 명으로 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-2-3-1.png`
                    }
                ]
            },
            {
                sid: 7,
                sname: "Work Order - 노후교체 컨설팅",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span><span style={{ color: "red" }}>{"\u2460"}</span> 사업장 및 상세 사업장 선택 후 <span style={{ color: "red" }}>{"\u2461"}</span> 노후교체 상태의 따라 요청 목록 조회가 가능합니다.<br></br>          {"\u279C"} 상태는 전체, 요청, 접수가 있습니다.<br></br>     <span style={{ color: "red" }}>{"\u2462"}</span> 요청 일자 조회가 가능합니다.<br></br>          {"\u279C"} 일자는 전체, 1개월, 3개월, 6개월 1년이 있습니다.<br></br>     <span style={{ color: "red" }}>{"\u2463"}</span> 검색 조건 검색이 가능합니다.<br></br>          {"\u279C"} 조건은 기기 명, 패널 명, 시리얼 번호, 모델 명으로 조회가 가능합니다.</span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-2-4-1.png`
                    }
                ]
            },
            {
                sid: 8,
                sname: "이메일 상담",
                snameContents: [
                    {
                        order: 1,
                        procedure: "e-Health Portal 및 제품에 대하여 이메일 상담을 제공.",
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-3-0.png`
                    }
                ]
            },
            {
                sid: 9,
                sname: "이메일 상담 - 요청",
                snameContents: [
                    {
                        order: 1,
                        procedure: "상담입력(제목, 문의 유형, 내용 및 첨부파일을 하여 이메일 상담을 요청 할 수 있습니다.",
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-3-1.png`
                    }
                ]
            },
            {
                sid: 10,
                sname: "이메일 상담 - 서비스 센터",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span>을 클릭하면 서비스센터 안내 페이지로 이동하게 됩니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-3-2-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>LS Electric 서비스 센터를 찾아 볼 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-3-2-2.png`
                    }
                ]
            },
            {
                sid: 11,
                sname: "이메일 상담 - 챗봇",
                snameContents: [
                    {
                        order: 1,
                        procedure: <span>
                            <span style={{ color: "red" }}>{"\u2460"}</span>을 클릭하면 챗봇 서비스를 사용 할 수 있습니다.
                        </span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-3-3-1.png`
                    },
                    {
                        order: 2,
                        procedure: <span>LS Electric 업무에 대한 문의를 챗봇을 통해 빠르게 안내를 받을 수 있습니다.</span>,
                        captureImg: `../../../../../static/img/img_help/9.Service Request/-3-3-2.png`
                    }
                ]
            }
        ]
    }
];