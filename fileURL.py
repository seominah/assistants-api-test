import json

# 딕셔너리 생성
file_urls = {
    #공지사항
    "지정 연차": "https://echo.hansol.com/egate50/kr/eip/home/home.nsf/openpage?readform&url=%2Fegate50%2Fkr%2Feip%2Fbbs%2Fdb%2FB200512030119173311583.nsf%2Fmain%2F0C36937ECA7A036C49258AA20000A8B3%3Fopendocument%26vn%3Dmain%26tab%3Dfm_pt_content%26isundock%3D1",
    "부고": "https://echo.hansol.com/egate50/kr/eip/home/home.nsf/openpage?readform&url=%2Fegate50%2Fkr%2Feip%2Fbbs%2Fdb%2FB200512030119173311583.nsf%2Fmain%2F25FF1DB6CAB2AAC4492588D20025B05C%3Fopendocument%26vn%3Dmain%26tab%3Dfm_pt_content%26isundock%3D1",
    "방문주차권": "https://echo.hansol.com/egate50/kr/eip/home/home.nsf/openpage?readform&url=%2Fegate50%2Fkr%2Feip%2Fbbs%2Fdb%2FB200512030119173311583.nsf%2Fmain%2F39122CC8447C6CF7492589B0002CAFBF%3Fopendocument%26vn%3Dmain%26tab%3Dfm_pt_content%26isundock%3D1",
    "쏘카": "https://hansolpns-it.atlassian.net/wiki/x/8YIyD",
    #규정
    "취업규칙": "https://hansolpns-it.atlassian.net/wiki/x/WAEyD",
    "인사규정": "https://hansolpns-it.atlassian.net/wiki/x/1YGlCw",
    "급여규정": "https://hansolpns-it.atlassian.net/wiki/x/24EqD",
    "복리후생규정": "https://hansolpns-it.atlassian.net/wiki/x/wgQsD",
    "노사협의회규정": "https://hansolpns-it.atlassian.net/wiki/x/twWnCw",
    "고정자산관리규정": "https://hansolpns-it.atlassian.net/wiki/x/zYmlCw",
    "교육훈련규정": "https://hansolpns-it.atlassian.net/wiki/x/cIAPDg",
    "성희롱": "https://hansolpns-it.atlassian.net/wiki/x/7IBADw",
    "회계처리업무규정": "https://hansolpns-it.atlassian.net/wiki/x/iwWZCw",
    "내부회계관리규정": "https://hansolpns-it.atlassian.net/wiki/x/fAAsD",
    "감사규정": "https://hansolpns-it.atlassian.net/wiki/x/YgAcD",
    #지침.가이드
    "직급체계": "https://hansolpns-it.atlassian.net/wiki/x/A4IyD",
    "보상제도": "https://hansolpns-it.atlassian.net/wiki/x/GgEyD",
    "상벌지침": "https://hansolpns-it.atlassian.net/wiki/x/2gEuD",
    "여비지침": "https://hansolpns-it.atlassian.net/wiki/x/KgMsD",
    "퇴직연금": "https://hansolpns-it.atlassian.net/wiki/x/n4EpD",
    "근태": "https://hansolpns-it.atlassian.net/wiki/x/tgMsD",
    "증명서": "https://hansolpns-it.atlassian.net/wiki/x/9QMsD",
    "동호회": "https://hansolpns-it.atlassian.net/wiki/x/3QIwD",
    "프로젝트": "https://hansolpns-it.atlassian.net/wiki/x/xQMwD",
    "복지몰": "https://hansolpns-it.atlassian.net/wiki/x/JgQsD",
    "의료비": "https://hansolpns-it.atlassian.net/wiki/x/NgEcGw",
    "학자금": "https://hansolpns-it.atlassian.net/wiki/x/U4BsHw",
    "경조금": "https://hansolpns-it.atlassian.net/wiki/x/BgJpI",
    "건강검진": "https://hansolpns-it.atlassian.net/wiki/x/hwCRI",
    #컨플루언스 작성 후 URL 변경필요
    "총무": "https://hansolpns-it.atlassian.net/wiki/x/qoIyD",
    "담당자" :"https://hansolpns-it.atlassian.net/wiki/x/gIBe",
}

# JSON 파일로 저장
# with open('file_urls.json', 'w', encoding='utf-8') as f:
#     json.dump(file_urls, f, ensure_ascii=False, indent=4)

# print(file_urls)
print("파일URL 딕셔너리가 업데이트되었습니다.")