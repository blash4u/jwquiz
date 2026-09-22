// data_person.js
// 성경 인물 맞추기 퀴즈 데이터베이스 (wcg_KO 및 ia_KO 기반)

export const personData = [
  // 1. 에녹
  {
    id: "person_enoch",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "아담의 7대손으로, 극도로 불경건한 세상에서 오직 참하느님과 함께 걸었습니다.",
      "모든 불경건한 자들에게 여호와의 심판이 임할 것임을 과거 시제로 확실하게 선언했습니다.",
      "하느님을 기쁘시게 했다는 증언을 받았으며, 대적들의 손에 죽지 않도록 하느님께서 평안히 잠들게 하셨습니다."
    ],
    correctAnswer: "에녹",
    distractors: ["노아", "므두셀라", "아벨"],
    reference: "창세기 5:21-24; 유다서 14, 15"
  },

  // 2. 노아
  {
    id: "person_noah",
    image: "https://assets.jw.org/assets/m/ia/univ/ia_univ_lsr_xl.jpg",
    clues: [
      "포악한 네피림과 악한 천사들이 가득했던 대홍수 이전 세상에서 흠 없는 의인으로 살았습니다.",
      "약 50년 동안 거대한 방주를 만들었을 뿐 아니라 '의의 전파자'로서 다가올 멸망을 용감히 경고했습니다.",
      "온 가족 8명과 함께 방주에서 살아남았으며, 홍수 후 하늘에 걸린 무지개 계약의 증인이 되었습니다."
    ],
    correctAnswer: "노아",
    distractors: ["에녹", "아브라함", "욥"],
    reference: "창세기 6:9-22; 베드로 후서 2:5"
  },

  // 3. 사라
  {
    id: "person_sarah",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "풍요롭고 안락했던 도시 우르를 뒤돌아보지 않고 기꺼이 남편을 지지하여 천막생활을 시작했습니다.",
      "외모가 빼어나 이집트 왕의 궁전으로 불려가는 위기를 겪었지만 충절을 굳게 지켰습니다.",
      "90세라는 불가능해 보이는 나이에 믿음으로 약속의 아들 이삭을 낳았습니다."
    ],
    correctAnswer: "사라",
    distractors: ["리브가", "라헬", "하갈"],
    reference: "창세기 17:15-19; 히브리서 11:11"
  },

  // 4. 아브라함
  {
    id: "person_abraham",
    image: "https://assets.jw.org/assets/m/ia/univ/ia_univ_lsr_xl.jpg",
    clues: [
      "집안의 훈련된 사병 318명을 이끌고 조카 롯을 구출하기 위해 네 왕의 연합군과 싸워 승리했습니다.",
      "살렘의 왕이자 제사장인 멜기세덱에게 전리품의 십분의 일을 바쳤습니다.",
      "가장 아끼는 독자 이삭을 번제물로 바치라는 가장 어려운 시험에도 부활을 믿고 순종했습니다."
    ],
    correctAnswer: "아브라함",
    distractors: ["이삭", "야곱", "멜기세덱"],
    reference: "창세기 14:1-24; 22:1-19"
  },

  // 5. 리브가
  {
    id: "person_rebekah",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "우물가에서 낯선 나그네와 그의 열 마리 낙타에게 쉬지 않고 기꺼이 물을 길어 주었습니다.",
      "한 번도 만난 적 없는 이삭과의 결혼을 위해 고향과 가족을 떠나 기꺼이 가나안으로 향했습니다.",
      "들에서 묵상하던 이삭을 발견하고 겸손하게 베일로 얼굴을 가렸습니다."
    ],
    correctAnswer: "리브가",
    distractors: ["사라", "라헬", "레아"],
    reference: "창세기 24:1-67"
  },

  // 6. 야곱
  {
    id: "person_jacob",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "영적 축복을 소중히 여겨 팥죽 한 그릇에 맏아들의 권리를 얻었습니다.",
      "하느님의 축복을 얻기 위해 밤새도록 천사와 끈질기게 씨름하여 '이스라엘'이라는 새 이름을 받았습니다.",
      "군사 400명을 이끌고 다가오는 형 에서 앞에서 일곱 번 몸을 굽혀 평화를 이루었습니다."
    ],
    correctAnswer: "야곱",
    distractors: ["에서", "요셉", "라반"],
    reference: "창세기 25:29-34; 32:24-32"
  },

  // 7. 요셉
  {
    id: "person_joseph",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "형들의 시기로 물구덩이에 던져진 뒤 이집트의 종으로 팔려 갔습니다.",
      "보디발 아내의 집요한 유혹을 뿌리치며 '내가 어찌 하느님께 죄를 짓겠습니까'라며 도망쳤습니다.",
      "파라오의 꿈을 하느님의 영으로 해석하여 이집트의 총리가 되고 온 가족을 흉년에서 구했습니다."
    ],
    correctAnswer: "요셉",
    distractors: ["베냐민", "유다", "다니엘"],
    reference: "창세기 39:1-23; 41:37-44"
  },

  // 8. 모세
  {
    id: "person_moses",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "이집트 공주의 아들이라는 화려한 궁중 지위를 포기하고 하느님의 백성과 함께 고난받기를 택했습니다.",
      "불타는 가시덤불 가운데서 하느님의 부르심을 받고 분노한 파라오 앞에 당당히 섰습니다.",
      "여호와의 능력으로 홍해를 가르고 이스라엘 백성을 40년 동안 광야에서 인도했습니다."
    ],
    correctAnswer: "모세",
    distractors: ["아론", "여호수아", "엘리야"],
    reference: "출애굽기 3:1-12; 히브리서 11:24-26"
  },

  // 9. 갈렙
  {
    id: "person_caleb",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "10명의 정탐꾼이 겁을 먹고 악평을 퍼뜨릴 때 '여호와께서 함께하시니 두려워 말라'고 외쳤습니다.",
      "온 이스라엘 백성이 돌로 치려 할 때에도 굴하지 않고 여호와의 편에 섰습니다.",
      "85세의 고령에도 믿음으로 거인들이 살고 있던 험준한 산지 헤브론을 당당히 정복했습니다."
    ],
    correctAnswer: "갈렙",
    distractors: ["여호수아", "기드온", "바락"],
    reference: "민수기 14:6-9; 여호수아 14:6-14"
  },

  // 10. 여호수아
  {
    id: "person_joshua",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "모세의 뒤를 이어 이스라엘을 약속의 땅으로 이끈 탁월한 지도자였습니다.",
      "상식적으로 이해하기 어려운 군사 전략이었지만 성 주위를 7일간 행진하라는 명령에 온전히 순종했습니다.",
      "'나와 내 집은 여호와를 섬기겠소'라는 굳은 결의를 평생 지켜 냈습니다."
    ],
    correctAnswer: "여호수아",
    distractors: ["갈렙", "기드온", "사무엘"],
    reference: "여호수아 1:6-9; 6:1-20; 24:15"
  },

  // 11. 라합
  {
    id: "person_rahab",
    image: "https://assets.jw.org/assets/m/ia/univ/ia_univ_lsr_xl.jpg",
    clues: [
      "예리코의 성벽 위에 살던 매춘부였지만 여호와의 구원 능력에 대한 소식을 듣고 믿음을 가졌습니다.",
      "이스라엘의 정탐꾼 둘을 지붕 위 아마 줄기 사이에 숨겨 주고 목숨을 건 약조를 맺었습니다.",
      "창문에 매단 진홍색 줄 덕분에 예리코 성벽이 무너져 내릴 때 온 가족과 함께 생명을 구했습니다."
    ],
    correctAnswer: "라합",
    distractors: ["드보라", "야엘", "룻"],
    reference: "여호수아 2:1-21; 6:22-25"
  },

  // 12. 룻
  {
    id: "person_ruth",
    image: "https://assets.jw.org/assets/m/ia/univ/ia_univ_lsr_xl.jpg",
    clues: [
      "모압의 고향과 신들을 버리고 시어머니 나오미에게 고착하여 베들레헴으로 향했습니다.",
      "'어머니의 하느님이 저의 하느님이 되실 것입니다'라는 불멸의 충성스러운 고백을 남겼습니다.",
      "보아스의 밭에서 부지런히 이삭을 주우며 '탁월한 여자'라는 인정을 받았고 다윗의 조상이 되었습니다."
    ],
    correctAnswer: "룻",
    distractors: ["오르바", "나오미", "라합"],
    reference: "룻기 1:16, 17; 3:11; 4:13-17"
  },

  // 13. 바락
  {
    id: "person_barak",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "여예언자 드보라의 권고를 겸손히 받아들여 1만 명의 군사를 모아 다볼산으로 올라갔습니다.",
      "철낫 달린 병거 900대로 무장한 시스라의 무시무시한 대군을 향해 믿음으로 돌진했습니다.",
      "폭우로 병거가 진흙탕에 빠지게 하신 여호와의 도움으로 가나안 압제자들을 완전히 섬멸했습니다."
    ],
    correctAnswer: "바락",
    distractors: ["기드온", "입다", "삼손"],
    reference: "사사기 4:6-16; 히브리서 11:32"
  },

  // 14. 야엘
  {
    id: "person_jael",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "가나안 군대 대장 시스라가 패주하여 피난해 왔을 때 담요를 덮어 주고 젖을 먹여 안심시켰습니다.",
      "무자비한 전사가 깊은 잠에 빠졌을 때 망치와 천막 말뚝을 사용하여 그를 처단했습니다.",
      "드보라와 바락의 승전가에서 '천막에 사는 여자들 가운데 가장 축복받은 자'로 칭송받았습니다."
    ],
    correctAnswer: "야엘",
    distractors: ["드보라", "라합", "미리암"],
    reference: "사사기 4:17-22; 5:24-27"
  },

  // 15. 기드온
  {
    id: "person_gideon",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "미디안 사람들의 눈을 피해 포도주틀 속에서 곡식을 타작하던 조심성 있는 전사였습니다.",
      "양털 뭉치에 내린 이슬 시험을 통해 하느님의 함께하심을 겸손히 확인했습니다.",
      "단 300명의 군사와 함께 항아리, 횃불, 뿔나팔을 사용하여 13만 5천 명의 미디안 연합군을 패주시켰습니다."
    ],
    correctAnswer: "기드온",
    distractors: ["삼손", "바락", "입다"],
    reference: "사사기 6:11-40; 7:16-22"
  },

  // 16. 삼손
  {
    id: "person_samson",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "평생 나실인으로 구별되어 당나귀 턱뼈 하나로 블레셋 사람 1000명을 쳐부순 괴력의 소유자였습니다.",
      "가자의 육중한 성문 문짝과 기둥을 빗장째 뽑아 산꼭대기로 메고 올라갔습니다.",
      "눈이 뽑힌 채 블레셋 신전에서 다곤의 축제 날 두 기둥을 무너뜨려 적들을 멸하고 충절을 지켰습니다."
    ],
    correctAnswer: "삼손",
    distractors: ["기드온", "골리앗", "입다"],
    reference: "사사기 15:14-16; 16:1-30"
  },

  // 17. 사무엘
  {
    id: "person_samuel",
    image: "https://assets.jw.org/assets/m/ia/univ/ia_univ_lsr_xl.jpg",
    clues: [
      "어머니 한나의 기도로 태어나 젖을 뗀 어린 시절부터 실로의 장막에서 여호와를 섬겼습니다.",
      "엘리의 타락한 두 아들의 악행 속에서도 물들지 않고 밤중에 들려온 하느님의 음성에 귀를 기울였습니다.",
      "엘리 집안의 심판을 용기 있게 전하고 평생 동안 충실한 예언자이자 재판관으로 일했습니다."
    ],
    correctAnswer: "사무엘",
    distractors: ["엘리", "다윗", "나단"],
    reference: "사무엘상 1:24-28; 3:1-19"
  },

  // 18. 다윗
  {
    id: "person_david",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "소년 시절 사자와 곰을 쳐죽이며 양 떼를 지켰고, 매끄러운 돌 하나와 무릿매로 거인 골리앗을 쓰러뜨렸습니다.",
      "자신을 죽이려던 사울 왕을 두 번이나 죽일 기회가 있었지만 기름부음받은 자를 존중하여 해치지 않았습니다.",
      "큰 죄를 짓고 나단 예언자의 책망을 받았을 때 마음을 찢으며 진심으로 회개하여 하느님의 마음에 맞는 왕이 되었습니다."
    ],
    correctAnswer: "다윗",
    distractors: ["사울", "요나단", "솔로몬"],
    reference: "사무엘상 17:40-51; 26:7-12; 사무엘하 12:13"
  },

  // 19. 요나단
  {
    id: "person_jonathan",
    image: "https://assets.jw.org/assets/m/wcg/univ/wcg_univ_lsr_xl.jpg",
    clues: [
      "사울 왕의 맏아들로서 왕위를 이을 자격이 있었지만 다윗을 향한 여호와의 뜻을 겸손히 인정했습니다.",
      "자신의 겉옷과 활과 군복을 다윗에게 건네주며 죽음을 초월한 불멸의 형제 우정을 맺었습니다.",
      "아버지 사울이 다윗을 질투하여 죽이려 할 때 목숨을 걸고 다윗을 변호하고 지켜 주었습니다."
    ],
    correctAnswer: "요나단",
    distractors: ["압살롬", "사울", "아도니야"],
    reference: "사무엘상 18:1-4; 20:30-42; 23:16-18"
  },

  // 20. 아비가일
  {
    id: "person_abigail",
    image: "https://assets.jw.org/assets/m/ia/univ/ia_univ_lsr_xl.jpg",
    clues: [
      "거칠고 어리석은 남편 나발이 다윗을 모욕하여 집안 남자들이 몰살당할 위기에 처했습니다.",
      "신속하게 음식을 싣고 분노한 다윗을 찾아가 땅에 엎드려 지혜롭고 설득력 있게 유혈죄를 막았습니다.",
      "다윗으로부터 '지각력 있는 여인'이라는 찬사를 받았으며, 훗날 다윗의 아내가 되었습니다."
    ],
    correctAnswer: "아비가일",
    distractors: ["밧세바", "미갈", "사라"],
    reference: "사무엘상 25:14-35"
  }
];
