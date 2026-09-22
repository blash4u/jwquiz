// data_person.js
// 성경 인물 맞추기 퀴즈 통합 허브 모듈 (54개 장 전체 인물 완전 통합)

import { personPart1 } from "./data_person_part1.js";
import { personPart2 } from "./data_person_part2.js";
import { personPart3 } from "./data_person_part3.js";

// 총 54명의 모든 인물 데이터를 단일 배열로 합쳐서 app.js로 내보냄
export const personData = [
  ...personPart1, // 1부: 1장 ~ 21장 (에녹부터 사무엘까지)
  ...personPart2, // 2부: 22장 ~ 40장 (요나단부터 느헤미야까지)
  ...personPart3  // 3부: 41장 ~ 54장 (스가랴/엘리사벳부터 사도 요한까지)
];
