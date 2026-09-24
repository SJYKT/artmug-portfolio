# ARTmug Portfolio V4 Fix

이번 수정 내용:

1. 아트머그 iframe 잘림 대응
   - ARTMUG_EMBED.txt의 높이를 7000px로 수정했습니다.
   - 기존 5000px에서는 FAQ 이후 PROCESS / 신청양식이 잘릴 수 있습니다.

2. 논브레스 오블리주 썸네일
   - `maxresdefault.jpg` 대신 공개 영상에 안정적으로 존재하는 `sddefault.jpg`를 우선 사용합니다.
   - MaxRes가 없는 영상은 YouTube가 오류 대신 빈/대체 이미지를 반환하는 경우가 있어 `onerror`가 동작하지 않을 수 있습니다.

3. 영상 팝업 위치
   - 아트머그에서 매우 긴 iframe을 사용할 때 화면 중앙이 페이지 아래쪽으로 밀리는 문제를 피하도록,
     클릭한 작품 카드 근처에 팝업이 뜨도록 수정했습니다.

## GitHub에 업데이트하는 방법
기존 저장소 `artmug-portfolio`에서 다음 3개 파일을 새 버전으로 덮어씌우면 됩니다.

- index.html
- styles.css
- script.js

GitHub Pages는 커밋 후 잠시 뒤 자동 업데이트됩니다.

그 후 아트머그에는 `ARTMUG_EMBED.txt`의 iframe 코드를 사용하세요.


## V5 변경사항
- KING 삭제
- 포트폴리오 4개를 데스크톱 한 줄 4열로 압축
- 표기 통일: 문자PV / 뮤비카피
- 영상 팝업을 전체 iframe 중앙이 아니라 클릭한 카드 위치 기준으로 표시
- 모바일에서는 2x2로 자동 배치
