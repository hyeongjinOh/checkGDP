import React from "react";

export const main = [
    {
        code: "dashboard",
        title: "메인 대시보드",
        text: "e-Health Portal 웹사이트 사용자가 전력설비 및 진단점검 관련 현황을 한눈에 파악할 수 있는 대시보드를 제공하며 등록설비 및 등록사업장 현황, e-Health Check (e-HC) 진행 현황, 점검/사고이력 현황, 서비스 요청 및 진행 현황정보를 커스터마이징 배치로 지원하는 서비스 입니다.",

    },
    {
        code: "main",
        title: "e-Health Check",
        text: "전력설비가 안전하고 효율적으로 운영될 수 있도록 3단계로 구분된 체계적인  Health Check (진단점검) 서비스를 제공하여 전력 설비의 건강 상태를 체크하는 서비스 입니다.",

    },
    {
        code: "report",
        title: "Report",
        text: "포탈 사용자 편의성 향상을 위하여 e-Health Check 서비스에서 생성된 진단점검 보고서와 전력설비의 출하검사성적서를 사업장단위로 제공하는 서비스 입니다.",

    },
    {
        code: "devicestatus",
        title: "설비 수명",
        text: "전력설비 운영에서 가장 중요한 설비수명 정보를 제공하는 서비스로 설비의 수명 관련 필요 인자를 설정하고, 신뢰성 있는 설비수명 정보를 제공하는 LS ELECTRIC의 Asset Lifecycle Optimization",

    },
    {
        code: "admin",
        title: "운영관리",
        text: "e-Health Portal 웹사이트에서 전력설비의 등록 및 관리를 손쉽게 할 수 있도록 제공되는 서비스 입니다.",

    },
    {
        code: "management",
        title: "Management",
        text: "LS ELCTRIC에서 e-Health Portal 웹사이트 관리 업무에 필요한 서비스이며 일반 사용자에게는 제공되지 않습니다. (e-Health Portal 웹사이트 사용자 지원 업무 포함)",

    },
    {
        code: "workorder",
        title: "점검이력/요청",
        text: "전력설비 진단점검 업무를 수행하는 사용자에게 도움이 되도록 LS ELECTRIC에서 진행한 전력설비 점검이력을 제공하며 사용 중 고장이 발생한 전력설비의 점검 출동을 요청하는 서비스입니다.",

    },
    {
        code: "portal",
        title: "포탈 사용자",
        text: "포탈 사용자의 회원가입, 웹사이트 로그인, e-Health Portal 사용 궁금사항 문의, 사용자 알림 서비스 입니다.",

    },
]

export const sub = [
    // dashboard
    {
        code: main.filter((fd) => (fd.code == "dashboard")).map((fv) => (fv.code)),
        subTitle: "설비현황 및 운영관리",
        subText: "사용자가 e-Health Portal 웹사이트에 등록해서 관리하고 있는 전력설비 현황 및 사업장에 대한 요약정보 표시",
    },
    {
        code: main.filter((fd) => (fd.code == "dashboard")).map((fv) => (fv.code)),
        subTitle: "e-HC 진행 현황 및 진행률 비교",
        subText: "e-Health Check 서비스 진행 현황에 대한 요약정보 표시, e-Health Portal 웹사이트에 등록 후 진단점검 미진행 전력설비의 비율 표시",
    },
    {
        code: main.filter((fd) => (fd.code == "dashboard")).map((fv) => (fv.code)),
        subTitle: "e-HC 평균 점수",
        subText: "e-Health Portal 웹사이트에 등록 후 진단점검 진행한 전력설비의 3단계별 e-Health Check 평균 점수와 전력설비별 점수 현황을 표시",
    },
    {
        code: main.filter((fd) => (fd.code == "dashboard")).map((fv) => (fv.code)),
        subTitle: "점검 사고이력",
        subText: "e-Health Portal 웹사이트에서 관리하는 전력설비 관련하여 LS ELECTRIC에서 진행한 과거 점검이력 현황을 표시",
    },
    {
        code: main.filter((fd) => (fd.code == "dashboard")).map((fv) => (fv.code)),
        subTitle: "메뉴링크",
        subText: "e-Health Portal 웹사이트내 개별 상세 페이지로 링크 기능 제공",
    },
    // e-HealthCheck
    {
        code: main.filter((fd) => (fd.code == "main")).map((fv) => (fv.code)),
        subTitle: "Basic 진단점검",
        subText: "사용자가 스스로 손쉽게 전력설비의 운영 및 환경 조건을 점검하여 설비 운영 상태를 파악하는 진단점검 지원 (무료) ",
    },
    {
        code: main.filter((fd) => (fd.code == "main")).map((fv) => (fv.code)),
        subTitle: "Premium 진단점검",
        subText: "LS ELECTRIC 전문가 현장 방문하여 활선/정전 상태에서 전력설비의 전기적 기계적 성능 점검 및 시험을 진행하고 설비의 정확한 상태를 파악하는 진단점검 진행 (유료)",
    },
    {
        code: main.filter((fd) => (fd.code == "main")).map((fv) => (fv.code)),
        subTitle: "Advanced 진단점검",
        subText: "LS ELECTRIC 전문가 현장 방문하여 전력설비의 전반적인 진단을 실시하고 설비 Risk 요소와 설비 수명 인자 관련 전문적 시험 정보를 제공하는 진단점검 진행 (유료)",
    },
    {
        code: main.filter((fd) => (fd.code == "main")).map((fv) => (fv.code)),
        subTitle: "설비등록 현황",
        subText: "사용자가 e-Health Portal 웹사이트에 등록해서 관리하고 있는 전력설비의 세부적인 정보와 함께 e-Health Check 진단점검 점수를 제공하고 필요시 노후화된 설비의 교체를 요청",
    },
    //report
    {
        code: main.filter((fd) => (fd.code == "report")).map((fv) => (fv.code)),
        subTitle: "진단점검 리포트",
        subText: "사용자가 e-Health Check 서비스에서 진단점검을 진행한 전력설비의 3 단계별 진단점검 (Basic, Premium, Advanced) 리포트 항목별 내용을 파악하거나 PDF 파일로 다운로드 제공.",
    },
    {
        code: main.filter((fd) => (fd.code == "report")).map((fv) => (fv.code)),
        subTitle: "Test Report",
        subText: "전력설비 출하검사성적서 View를 통하여 검사 항목별 내용을 파악하거나 PDF 파일로 다운로드 제공.",
    },
    //devicestatus
    {
        code: main.filter((fd) => (fd.code == "devicestatus")).map((fv) => (fv.code)),
        subTitle: "설비수명 인자설정",
        subText: "e-Health Check 서비스의 3단계 진단점검 결과를 바탕으로 LS ELCTRIC 전문가의 지원을 통하여 설비수명 인자를 설정하는 기능을 제공.",
    },
    {
        code: main.filter((fd) => (fd.code == "devicestatus")).map((fv) => (fv.code)),
        subTitle: "설비수명 Report",
        subText: "LS ELCTRIC의 ALO 플랫폼과 연계하여 전력설비 수명과 관련된 Lifecycle 보고서를 제공. (’23년 정식 오픈 및 비용 공지 예정)",
    },
    //admin
    {
        code: main.filter((fd) => (fd.code == "admin")).map((fv) => (fv.code)),
        subTitle: "사업장 전기실 관리",
        subText: "e-Health Portal 웹사이트에 등록 및 관리를 희망하는 설비 등록을 위하여 전력설비가 운영되고 있는 회사, 사업장 정보를 등록하여 관리하는 기능 제공.",
    },
    {
        code: main.filter((fd) => (fd.code == "admin")).map((fv) => (fv.code)),
        subTitle: "설비등록 관리",
        subText: "e-Health Portal 웹사이트에 등록 및 관리를 희망하는 전력설비를 신규로 등록하여 관리할 수 있으며 향상된 사용자 등록 편의성을 제공.",
    },
    //management
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "승인 관리",
        subText: "신규 가입자 승인, 사업장 승인, 진단점검/노후교체 요청 관리.",
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "사용자 관리",
        subText: "사업장별 사용자 목록, 사용자 타입, 사용자별 활성화/비활성화 관리.",
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "사업장 관리",
        subText: "e-Health Portal 웹사이트의 회사-사업장 추가, 사업장별 데이터, 사업장 현황 관리.",
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "메시지 관리",
        subText: "e-Health Checker 메시지, 에러메세지, HTTP메세지, 알람메세지 항목 및 다국어 관리.",
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "메뉴 관리",
        subText: "e-Health Portal 웹사이트 계정 유형별 메뉴 항목 활성화/비활성화, 다국어 관리.",
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "Check Sheet 관리",
        subText: "e-Health Check 서비스에서 제공하는 3단계 진단점검 항목의 버전 및 다국어 관리.",
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        subTitle: "이메일 상담 관리",
        subText: "e-Health Portal 웹사이트 사용자가 보낸 이메일 상담 리스트의 관리.",
    },
    //workorder
    {
        code: main.filter((fd) => (fd.code == "workorder")).map((fv) => (fv.code)),
        subTitle: "Work Order",
        subText: "e-Health Portal 웹사이트에 사용자가 등록 및 관리하는 전력설비와 관련하여 LS ELECTRIC에서 과거부터 현재까지 진행된 점검이력 및 현재 요청에 대한 점검현황을 제공.",
    },
    {
        code: main.filter((fd) => (fd.code == "workorder")).map((fv) => (fv.code)),
        subTitle: "점검출동요청",
        subText: "LS ELCTRIC 전력설비의 사용 중 고장이 발생한 경우 전력설비 점검 출동을 요청하며, LS ELECTRIC의 온라인 서비스 신청과 동일하게 접수 처리 진행.",
    },
    //portal
    {
        code: main.filter((fd) => (fd.code == "portal")).map((fv) => (fv.code)),
        subTitle: "회원가입",
        subText: "e-Health Portal 웹사이트의 사용자로 회원 가입하거나, 회원 탈퇴 제공.",
    },
    {
        code: main.filter((fd) => (fd.code == "portal")).map((fv) => (fv.code)),
        subTitle: "로그인",
        subText: "e-Health Portal 웹사이트의 사용자 로그인, 로그아웃, 언어설정 제공 .",
    },
    {
        code: main.filter((fd) => (fd.code == "portal")).map((fv) => (fv.code)),
        subTitle: "이메일 상담",
        subText: "e-Health Portal 웹사이트 사용 및 기타 문의내용을 이메일 상담하는 기능 제공.",
    },
    {
        code: main.filter((fd) => (fd.code == "portal")).map((fv) => (fv.code)),
        subTitle: "사용자 알림",
        subText: "e-Health Portal 웹사이트 대시보드를 통해서 사용자에게 빠른 알림 제공.",
    },
]

/* export const imgs = [
    {
        code: main.filter((fd) => (fd.code == "dashboard")).map((fv) => (fv.code)),
        item: require("/static/img/intro01.png")
    },
    {
        code: main.filter((fd) => (fd.code == "main")).map((fv) => (fv.code)),
        item: require("/static/img/intro02.png")
    },
    {
        code: main.filter((fd) => (fd.code == "report")).map((fv) => (fv.code)),
        item: require("/static/img/intro03.png")
    },
    {
        code: main.filter((fd) => (fd.code == "devicestatus")).map((fv) => (fv.code)),
        item: require("/static/img/intro04.png")
    },
    {
        code: main.filter((fd) => (fd.code == "admin")).map((fv) => (fv.code)),
        item: require("/static/img/intro05.png")
    },
    {
        code: main.filter((fd) => (fd.code == "management")).map((fv) => (fv.code)),
        item: require("/static/img/intro06.png")
    },
    {
        code: main.filter((fd) => (fd.code == "workorder")).map((fv) => (fv.code)),
        item: require("/static/img/intro07.png")
    }, {
        code: main.filter((fd) => (fd.code == "portal")).map((fv) => (fv.code)),
        item: require("/static/img/intro08.png")
    },

] */