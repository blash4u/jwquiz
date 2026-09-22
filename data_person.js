// data_person.js
// 성경 인물 맞추기 퀴즈 통합 허브 모듈 (총 180개 전 문항 완전 통합)

import { personPart1 } from "./data_person_part1.js";     // wcg 1부 (21명)
import { personPart2 } from "./data_person_part2.js";     // wcg 2부 (19명)
import { personPart3 } from "./data_person_part3.js";     // wcg 3부 (14명)
import { personIA } from "./data_person_ia.js";           // ia 책 전체 (23명)
import { personLfbOt } from "./data_person_lfb_ot.js";    // lfb 구약 전체 (67명)
import { personLfbNt } from "./data_person_lfb_nt.js";    // lfb 신약 전체 (36명)

// 6개 파트의 모든 성경 인물 및 사건 데이터를 단일 배열로 합쳐서 app.js로 내보냄
export const personData = [
  ...personPart1,
  ...personPart2,
  ...personPart3,
  ...personIA,
  ...personLfbOt,
  ...personLfbNt
];
