// data_person.js
// 성경 인물 맞추기 퀴즈 통합 허브 모듈 (1부 + 2부 + 3부 전체 통합)

import { personPart1 } from "./data_person_part1.js";
import { personPart2 } from "./data_person_part2.js";
import { personPart3 } from "./data_person_part3.js";

// 총 54개 장의 모든 인물 데이터를 단일 배열로 합쳐서 내보냄
export const personData = [
  ...personPart1, // 1부: 1장 ~ 21장 (족장~재판관 시대)
  ...personPart2, // 2부: 22장 ~ 40장 (왕정~바빌론 유배 시대)
  ...personPart3  // 3부: 41장 ~ 54장 (예수와 초기 제자 시대)
];
