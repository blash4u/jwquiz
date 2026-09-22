// 인물 문제 로드 함수 (이미지 자동 방어 시스템 탑재)
function loadPersonQuestion() {
    if (personList.length === 0) {
        personList = shuffleArray([...personData]);
    }

    if (currentPersonIndex >= personList.length) {
        alert("모든 인물 문제를 탐구했습니다! 문제를 다시 섞습니다. 😊");
        currentPersonIndex = 0;
        personList = shuffleArray([...personData]);
    }

    const currentPerson = personList[currentPersonIndex];
    updateLivesIcon();
    updateScoreBoard();

    personFeedbackContainer.style.display = 'none';
    personChoicesContainer.style.display = 'block';
    personChoicesContainer.innerHTML = '';

    // 🌟 [핵심] 이미지 로드 실패 시 아름다운 그래픽 카드로 자동 대체 (onerror)
    personImage.onerror = () => {
        // SVG 데이터 URL을 통해 인물 이름과 상징 심볼이 담긴 고화질 카드로 대체
        const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#7E22CE"/>
                    <stop offset="50%" stop-color="#9333EA"/>
                    <stop offset="100%" stop-color="#C084FC"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgGrad)"/>
            <circle cx="200" cy="85" r="45" fill="rgba(255,255,255,0.2)"/>
            <text x="50%" y="98" font-size="38" text-anchor="middle" fill="#FFFFFF">👤</text>
            <text x="50%" y="155" font-family="'Malgun Gothic', sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFFFFF">${currentPerson.correctAnswer}</text>
            <text x="50%" y="182" font-family="'Malgun Gothic', sans-serif" font-size="13" text-anchor="middle" fill="#F3E8FF">성경 인물 탐구 퀴즈</text>
        </svg>`.trim();

        personImage.src = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
        personImage.onerror = null; // 무한 루프 방지
    };

    // 이미지 주소 설정
    personImage.src = currentPerson.image;

    // 3가지 단서 렌더링
    personCluesList.innerHTML = '';
    currentPerson.clues.forEach(clue => {
        const li = document.createElement('li');
        li.innerText = clue;
        personCluesList.appendChild(li);
    });

    // 4지선다 보기 생성
    const options = shuffleArray([currentPerson.correctAnswer, ...currentPerson.distractors]);
    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        btn.innerHTML = `<span class="choice-number">${idx + 1}.</span> <strong>${opt}</strong>`;
        btn.onclick = () => handlePersonChoice(opt, btn, currentPerson);
        personChoicesContainer.appendChild(btn);
    });
}
