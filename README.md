# 안전보건 교육 (제조업) — 모바일 앱

한국어·Filipino·ไทย·Tiếng Việt 4개 언어로 보는 제조업(판금) 근로자용 안전보건 교재입니다.
휴대폰 홈 화면에 설치하면 앱처럼 열리고, 한 번 열어 두면 인터넷이 없어도 볼 수 있습니다.

## GitHub Pages로 올리기

1. GitHub에서 **New repository** → 이름 예: `safety-edu` → **Public** 선택 → Create
2. 저장소 화면에서 **Add file → Upload files** → 이 폴더 안의 파일과 폴더(`index.html`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, `icons/`, `img/`, `README.md`)를 모두 끌어다 놓기 → **Commit changes**
3. **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, 폴더 **/(root)** → Save
4. 1~2분 뒤 `https://<GitHub아이디>.github.io/safety-edu/` 주소로 열림

## 근로자 휴대폰에 설치하기

- **안드로이드(Chrome·삼성 인터넷)**: 주소를 열면 아래쪽에 "설치" 버튼이 뜹니다. 안 뜨면 메뉴(⋮) → **홈 화면에 추가 / 앱 설치**
- **아이폰(Safari)**: 공유 버튼 → **홈 화면에 추가**

주소를 QR코드로 만들어 휴게실·교육장에 붙여 두면 편합니다.

## 내용을 고친 뒤 다시 올릴 때

`sw.js` 첫 줄의 `safety-edu-v1`을 `v2`, `v3`처럼 올려 주세요. 그래야 이미 설치한 휴대폰도 새 내용으로 바뀝니다.

## 출처

- 내용: 산업안전보건법·시행령·시행규칙, 산업안전보건기준에 관한 규칙, 중대재해 처벌 등에 관한 법률, 근로기준법, 남녀고용평등법, 고용노동부 자료를 바탕으로 직접 작성
- 그림: 직접 그림. 안전보건표지는 시행규칙 별표 6의 색·모양 기준을 따름
- '올바른 예' 사진: Gemini로 생성한 AI 이미지(실제 현장 사진 아님)
