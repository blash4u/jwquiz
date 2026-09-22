// data_person.js
// 성경 인물 맞추기 퀴즈 통합 허브 모듈

import { personPart1 } from "./data_person_part1.js";
// 2부와 3부는 다음 단계에서 파일을 만든 후 주석을 해제합니다.
// import { personPart2 } from "./data_person_part2.js";
// import { personPart3 } from "./data_person_part3.js";

// 현재 완성된 파트들을 하나의 통합 배열로 병합하여 내보냄
export const personData = [
  ...personPart1,
  // ...personPart2,
  // ...personPart3
];
