// data_person.js
// 성경 인물 맞추기 퀴즈 통합 허브 모듈

import { personPart1 } from "./data_person_part1.js";
import { personPart2 } from "./data_person_part2.js";
// 3부는 다음 단계에서 파일을 만든 후 주석을 해제합니다.
// import { personPart3 } from "./data_person_part3.js";

// 1부(21명)와 2부(19명) 데이터를 하나의 배열로 통합하여 내보냄
export const personData = [
  ...personPart1,
  ...personPart2,
  // ...personPart3
];
