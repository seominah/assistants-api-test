import json

# 딕셔너리 생성
file_urls = [
    {
        "name": "2024년 지정 연차",
        "url": "https://echo.hansol.com/egate50/kr/eip/home/home.nsf/openpage?readform&url=%2Fegate50%2Fkr%2Feip%2Fbbs%2Fdb%2FB200512030119173311583.nsf%2Fmain%2F0C36937ECA7A036C49258AA20000A8B3%3Fopendocument%26vn%3Dmain%26tab%3Dfm_pt_content%26isundock%3D1",
        "category": "공지사항",  # 대분류
        "subcategory": "일반공지",  # 중분류
        "number": 1,
    },
    {
        "name": "부고",
        "url": "https://echo.hansol.com/egate50/kr/eip/home/home.nsf/openpage?readform&url=%2Fegate50%2Fkr%2Feip%2Fbbs%2Fdb%2FB200512030119173311583.nsf%2Fmain%2F25FF1DB6CAB2AAC4492588D20025B05C%3Fopendocument%26vn%3Dmain%26tab%3Dfm_pt_content%26isundock%3D1",
        "category": "공지사항",
        "subcategory": "일반공지",
        "number": 2,
    },
    {
        "name": "방문주차권",
        "url": "https://echo.hansol.com/egate50/kr/eip/home/home.nsf/openpage?readform&url=%2Fegate50%2Fkr%2Feip%2Fbbs%2Fdb%2FB200512030119173311583.nsf%2Fmain%2F39122CC8447C6CF7492589B0002CAFBF%3Fopendocument%26vn%3Dmain%26tab%3Dfm_pt_content%26isundock%3D1",
        "category": "공지사항",
        "subcategory": "일반공지",
        "number": 3,
    },
    {
        "name": "취업규칙",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/WAEyD",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 5,
    },
    {
        "name": "인사규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/1YGlCw",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 6,
    },
    {
        "name": "급여규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/24EqD",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 7,
    },
    {
        "name": "복리후생규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/wgQsD",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 8,
    },
    {
        "name": "노사협의회규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/twWnCw",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 9,
    },
    {
        "name": "고정자산관리규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/zYmlCw",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 10,
    },
    {
        "name": "교육훈련규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/cIAPDg",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 11,
    },
    {
        "name": "성희롱",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/7IBADw",
        "category": "규정",
        "subcategory": "인사규정",
        "number": 12,
    },
    {
        "name": "회계처리업무규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/iwWZCw",
        "category": "규정",
        "subcategory": "재무규정",
        "number": 1,
    },
    {
        "name": "내부회계관리규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/fAAsD",
        "category": "규정",
        "subcategory": "RM규정",
        "number": 1,
    },
    {
        "name": "감사규정",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/YgAcD",
        "category": "규정",
        "subcategory": "RM규정",
        "number": 2,
    },
    {
        "name": "직급체계 및 승격제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/A4IyD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 2,
    },
    {
        "name": "보상제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/GgEyD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 4,
    },
    {
        "name": "상벌지침",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/2gEuD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 5,
    },
    {
        "name": "여비지침",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/KgMsD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 6,
    },
    {
        "name": "퇴직연금 제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/n4EpD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 7,
    },
    {
        "name": "근태 관련 지침",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/tgMsD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 8,
    },
    {
        "name": "증명서 발급 가이드",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/9QMsD",
        "category": "지침.가이드",
        "subcategory": "인사지침",
        "number": 10,
    },
    {
        "name": "동호회 운영지침",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/3QIwD",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 1,
    },
    {
        "name": "프로젝트 포인트",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/xQMwD",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 2,
    },
    {
        "name": "복지몰 운영-베네피아",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/JgQsD",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 3,
    },
    {
        "name": "의료비 지원제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/NgEcGw",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 4,
    },
    {
        "name": "학자금 지원제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/U4BsHw",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 5,
    },
    {
        "name": "경조금 지원제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/BgJpI",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 6,
    },
    {
        "name": "건강검진 지원제도",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/hwCRI",
        "category": "지침.가이드",
        "subcategory": "복리후생지침",
        "number": 7,
    },
    {
        "name": "총무",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/qoIyD",
        "category": "지침.가이드",
        "subcategory": "총무지침",
        "number": 0,
    },
    {
        "name": "쏘카",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/8YIyD",
        "category": "지침.가이드",
        "subcategory": "총무지침",
        "number": 2,
    },
    {
        "name": "담당자",
        "url": "https://hansolpns-it.atlassian.net/wiki/x/gIBe",
        "category": "기본정보",
        "subcategory": "R&R",
        "number": 1,
    },
    {
        "name": "기본정보",
        "url": "https://www.hansolpns.com/main.do",
        "category": "기본정보",
        "subcategory": "회사정보",
        "number": 1,
    },
]




# JSON 파일로 저장
# with open('file_urls.json', 'w', encoding='utf-8') as f:
#     json.dump(file_urls, f, ensure_ascii=False, indent=4)

# print(file_urls)
print("파일URL 딕셔너리가 업데이트되었습니다.")