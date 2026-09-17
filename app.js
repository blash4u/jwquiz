// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, getDoc, doc, setDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { quizData } from "./data.js"; 
import { walkInData } from "./data_walk.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyCbyuq4W5XUIfzE3ItpWYnADBTMz4d6PVo",
  authDomain: "jw-biblequiz-app.firebaseapp.com",
  projectId: "jw-biblequiz-app",
  storageBucket: "jw-biblequiz-app.firebasestorage.app",
  messagingSenderId: "656796223053",
  appId: "1:656796223053:web:df0d5db40ea40461453e04"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HALL_OF_FAME_TARGET_SCORE = 10000;
const SURPRISE_GIFT_SCORE = HALL_OF_FAME_TARGET_SCORE - 1;

// 화면 컨테이너
const authScreen = document.getElementById('auth-screen');
const hubScreen = document.getElementById('hub-screen');
const quizScreen = document.getElementById('quiz-screen');
const walkScreen = document.getElementById('walk-screen');

// 인증 요소
const loginBtn = document.getElementById('login-btn');
const uploadBtn = document.getElementById('upload-btn');
const viewRankingBtn = document.getElementById('view-ranking-btn');
const hubViewRankingBtn = document.getElementById('hub-view-ranking-btn');
const inQuizRankingBtn = document.getElementById('in-quiz-ranking-btn');
const usernameInput = document.getElementById('username-input');
const pinInput = document.getElementById('pin-input');
const hubLogoutBtn = document.getElementById('hub-logout-btn');

// 허브 요소
const hubPlayerDisplay = document.getElementById('hub-player-display');
const hubScoreText = document.getElementById('hub-score-text');
const hubLivesBadge = document.getElementById('hub-lives-badge');
const modeQuizBtn = document.getElementById('mode-quiz-btn');
const modeWalkBtn = document.getElementById('mode-walk-btn');

// 퀴즈 요소
const playerDisplay = document.getElementById('player-display');
const choicesContainer = document.getElementById('choices-container');
const feedbackContainer = document.getElementById('feedback-container');
const nextBtn = document.getElementById('next-btn');
const backToHubFromQuiz = document.getElementById('back-to-hub-from-quiz');

// 『진리의 빛 안에서』 요소
const walkPlayerDisplay = document.getElementById('walk-player-display');
const walkReadingRange = document.getElementById('walk-reading-range');
const walkStatusTag = document.getElementById('walk-status-tag');
const walkGoalQuestion = document.getElementById('walk-goal-question');
const jwLibraryDeeplink = document.getElementById('jw-library-deeplink');
const puzzleVerseRef = document.getElementById('puzzle-verse-ref');
const puzzleDropZone = document.getElementById('puzzle-drop-zone');
const puzzleTileZone = document.getElementById('puzzle-tile-zone');
const puzzleResetBtn = document.getElementById('puzzle-reset-btn');
const puzzleCheckBtn = document.getElementById('puzzle-check-btn');
const walkVisualSymbol = document.getElementById('walk-visual-symbol');
const walkVisualDesc = document.getElementById('walk-visual-desc');
const walkMeditationList = document.getElementById('walk-meditation-list');
const backToHubFromWalk = document.getElementById('back-to-hub-from-walk');

// 모달 요소
const rewardModal = document.getElementById('reward-modal');
const rewardModalIcon = document.getElementById('reward-modal-icon');
const rewardModalTitle = document.getElementById('reward-modal-title');
const rewardModalDesc = document.getElementById('reward-modal-desc');
const rewardModalBadge = document.getElementById('reward-modal-badge');
const closeRewardBtn = document.getElementById('close-reward-btn');

const rankingModal = document.getElementById('ranking-modal');
const rankingListContainer = document.getElementById('ranking-list-container');
const myCurrentRankText = document.getElementById('my-current-rank-text');
const closeRankingBtn = document.getElementById('close-ranking-btn');
const tabRealtime = document.getElementById('tab-realtime');
const tabHall = document.getElementById('tab-hall');

const gameoverModal = document.getElementById('gameover-modal');
const gameoverRankBox = document.getElementById('gameover-rank-box');
const gameoverHomeBtn = document.getElementById('gameover-home-btn');

// 전역 게임 상태
let currentUser = "";
let quizDataList = [];
let currentQuizIndex = 0;
let currentScore = 0;
let totalLives = 5;          // 남은 라이프 (DB 연동)
let questionAttempts = 3;    // 문항 내 시도 (3, 2, 1)
let currentCorrectAnswer = "";
let hasReceivedSurpriseGift = false;
let resetPendingAfterReward = false;

// 퍼즐 상태
let currentWalkPlan = walkInData[0];
let selectedTiles = [];
let shuffledTiles = [];

// 자동 로그인 입력창 복원
const savedName = localStorage.getItem('bibleQuizUser');
const savedPin = localStorage.getItem('bibleQuizPin');
if (savedName) usernameInput.value = savedName;
if (savedPin) pinInput.value = savedPin;

// 관리자 파라미터 체크
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'true' && uploadBtn) {
    uploadBtn.style.display = "block";
}

if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        uploadBtn.innerText = "업로드 중...";
        uploadBtn.disabled = true;
        try {
            for (const quiz of quizData) {
                await setDoc(doc(db, "quizzes", quiz.id.toString()), quiz);
            }
            alert(`총 ${quizData.length}개 문제가 Firebase에 성공적으로 동기화되었습니다!`);
            uploadBtn.innerText = "업로드 완료";
        } catch (e) {
            console.error(e);
            alert("업로드 실패");
            uploadBtn.disabled = false;
        }
    });
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function updateScoreBoard() {
    document.getElementById('score-text').innerText = currentScore;
    hubScoreText.innerText = currentScore;
}

function updateLivesIcon() {
    const icon = document.getElementById('attempts-icon');
    const safeLives = Math.max(0, totalLives);
    const heartsText = '❤️'.repeat(safeLives) + '🤍'.repeat(5 - safeLives);
    icon.innerText = heartsText;
    if (hubLivesBadge) hubLivesBadge.innerText = heartsText;
}

function findVerseText(verseName) {
    for (const q of quizDataList) {
        if (q.verseTexts && q.verseTexts[verseName]) return q.verseTexts[verseName];
    }
    return "성경 본문 구절입니다.";
}

// 🌟 사용자 점수 및 남은 라이프를 동시에 Firestore에 영구 저장
async function saveUserData(score, lives) {
    if (!currentUser) return;
    try {
        await setDoc(doc(db, "users", currentUser), {
            username: currentUser,
            score: score,
            lives: lives,
            updatedAt: new Date()
        }, { merge: true });
    } catch (e) {
        console.error("데이터 저장 실패:", e);
    }
}

async function saveToHallOfFame() {
    if (!currentUser) return;
    try {
        const hallDocRef = doc(db, "hall_of_fame", currentUser);
        const docSnap = await getDoc(hallDocRef);
        let completions = 1;
        if (docSnap.exists()) completions = (docSnap.data().completions || 1) + 1;

        await setDoc(hallDocRef, {
            username: currentUser,
            completions: completions,
            lastAchievedAt: new Date()
        }, { merge: true });
    } catch (e) {
        console.error("명예의 전당 저장 실패:", e);
    }
}

async function fetchUserRank() {
    try {
        const q = query(collection(db, "users"), orderBy("score", "desc"));
        const querySnapshot = await getDocs(q);
        let rank = 1;
        for (const docSnap of querySnapshot.docs) {
            if (docSnap.data().username === currentUser) return rank;
            rank++;
        }
        return rank;
    } catch (e) {
        return null;
    }
}

// -------------------------------------------------------------
// [인증 및 허브 화면 제어]
// -------------------------------------------------------------
loginBtn.addEventListener('click', async () => {
    const inputName = usernameInput.value.trim();
    const inputPin = pinInput.value.trim();

    if (!inputName) {
        alert("학습자 실명을 입력해 주세요!");
        usernameInput.focus();
        return;
    }
    if (!/^\d{4}$/.test(inputPin)) {
        alert("🔒 비밀번호는 반드시 숫자 4자리여야 합니다!");
        pinInput.focus();
        return;
    }

    loginBtn.innerText = "본인 인증 중...";
    loginBtn.disabled = true;

    try {
        const userDocRef = doc(db, "users", inputName);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.pin && userData.pin !== inputPin) {
                alert("🔒 비밀번호가 일치하지 않습니다!\n본인 계정이 아니면 다른 이름을 입력해 주세요.");
                loginBtn.innerText = "학습 센터 입장하기";
                loginBtn.disabled = false;
                pinInput.focus();
                return;
            } else if (!userData.pin) {
                await setDoc(userDocRef, { pin: inputPin }, { merge: true });
            }
            
            // 🌟 기존 유저의 점수 및 남은 라이프 복원
            currentScore = userData.score || 0;
            totalLives = (userData.lives !== undefined) ? userData.lives : 5;
            
            // 만약 이전 게임에서 0개로 끝난 상태였다면 5개로 안전 초기화
            if (totalLives <= 0) {
                totalLives = 5;
                await saveUserData(currentScore, totalLives);
            }
        } else {
            // 신규 사용자 등록
            currentScore = 0;
            totalLives = 5;
            await setDoc(userDocRef, {
                username: inputName,
                pin: inputPin,
                score: 0,
                lives: 5,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        currentUser = inputName;
        localStorage.setItem('bibleQuizUser', currentUser);
        localStorage.setItem('bibleQuizPin', inputPin);

        hubPlayerDisplay.innerText = currentUser;
        playerDisplay.innerText = currentUser;
        walkPlayerDisplay.innerText = currentUser;
        
        updateScoreBoard();
        updateLivesIcon();

        loginBtn.innerText = "학습 센터 입장하기";
        loginBtn.disabled = false;

        authScreen.style.display = 'none';
        hubScreen.style.display = 'block';

    } catch (error) {
        console.error(error);
        alert("로그인 처리 중 통신 에러가 발생했습니다.");
        loginBtn.innerText = "학습 센터 입장하기";
        loginBtn.disabled = false;
    }
});

hubLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem('bibleQuizUser');
    localStorage.removeItem('bibleQuizPin');
    usernameInput.value = "";
    pinInput.value = "";
    hubScreen.style.display = 'none';
    authScreen.style.display = 'block';
});

// 모드 1 (퀴즈) 실행
modeQuizBtn.addEventListener('click', async () => {
    if (quizDataList.length === 0) {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        querySnapshot.forEach((docSnap) => quizDataList.push(docSnap.data()));
        quizDataList = shuffleArray(quizDataList);
    }
    hubScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    loadQuestion();
});

// 모드 2 (진리의 빛 안에서) 실행
modeWalkBtn.addEventListener('click', () => {
    hubScreen.style.display = 'none';
    walkScreen.style.display = 'block';
    setupWalkMode();
});

backToHubFromQuiz.addEventListener('click', () => {
    quizScreen.style.display = 'none';
    feedbackContainer.style.display = 'none';
    hubScreen.style.display = 'block';
    updateScoreBoard();
    updateLivesIcon();
});

backToHubFromWalk.addEventListener('click', () => {
    walkScreen.style.display = 'none';
    hubScreen.style.display = 'block';
    updateScoreBoard();
});

// -------------------------------------------------------------
// [모드 1: 5지선다 퀴즈 로직]
// -------------------------------------------------------------
function loadQuestion() {
    if (currentQuizIndex >= quizDataList.length) {
        alert("모든 문제를 순환했습니다. 문제를 다시 섞습니다.");
        currentQuizIndex = 0;
        quizDataList = shuffleArray(quizDataList);
    }

    const quiz = quizDataList[currentQuizIndex];
    questionAttempts = 3;
    updateLivesIcon();
    updateScoreBoard();

    document.getElementById('category-title').innerText = `주제: ${quiz.category}`;
    document.getElementById('question-text').innerText = quiz.question;

    feedbackContainer.style.display = 'none';
    choicesContainer.style.display = 'block';
    choicesContainer.innerHTML = '';

    const shuffledCorrect = shuffleArray([...quiz.correctVerses]);
    currentCorrectAnswer = shuffledCorrect[0];

    let wrong = [];
    quizDataList.forEach(q => {
        if (q.id !== quiz.id) wrong.push(...q.correctVerses);
    });
    wrong = shuffleArray(wrong).slice(0, 4);

    const choices = shuffleArray([currentCorrectAnswer, ...wrong]);

    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        const text = findVerseText(choice);
        btn.innerHTML = `
            <span class="choice-number">${index + 1}.</span> ${choice}
            <span class="tooltip-text">💡 [성구 힌트] ${choice}\n"${text}"</span>
        `;
        btn.onclick = () => handleChoice(choice, btn, quiz);
        choicesContainer.appendChild(btn);
    });
}

async function handleChoice(choice, btn, quiz) {
    if (choice === currentCorrectAnswer) {
        let pts = (questionAttempts === 3) ? 5 : (questionAttempts === 2) ? 3 : 1;
        currentScore += pts;
        updateScoreBoard();
        await saveUserData(currentScore, totalLives);
        await checkRewardMilestones();

        const fullText = findVerseText(currentCorrectAnswer);
        showFeedback(`🎉 정답입니다! (+💎${pts})`, `📖 정답 성구: ${currentCorrectAnswer}\n"${fullText}"\n\n💡 묵상 포인트: ${quiz.hintExplanation}`, true);
    } else {
        questionAttempts--;
        currentScore = Math.max(0, currentScore - 1);
        updateScoreBoard();
        await saveUserData(currentScore, totalLives);
        
        btn.classList.add("wrong");
        btn.disabled = true;

        // 🌟 3번째 기회(questionAttempts === 1)가 되면 오답으로 틀린 버튼을 포함해 전체 툴팁 활성화
        if (questionAttempts === 1) {
            const allBtns = choicesContainer.querySelectorAll('.choice-btn');
            allBtns.forEach(b => b.classList.add('show-hint'));
        }

        // 문제를 3번 모두 틀렸을 때만 라이프 1개 차감
        if (questionAttempts <= 0) {
            totalLives--;
            updateLivesIcon();
            await saveUserData(currentScore, totalLives);

            // 🌟 라이프를 모두 잃었을 때 (0개) -> 점수 0점 리셋 및 게임 오버
            if (totalLives <= 0) {
                await triggerGameOver();
                return;
            }
            showFeedback(`😢 아쉽습니다! (0점)`, `💡 힌트 성구: ${quiz.hintVerse}\n\n${quiz.hintExplanation}`, false);
        }
    }
}

function showFeedback(title, text, isCorrect) {
    choicesContainer.style.display = 'none';
    feedbackContainer.style.display = 'block';
    const t = document.getElementById('feedback-title');
    t.innerText = title;
    t.style.color = isCorrect ? "#10B981" : "#EF4444";
    document.getElementById('feedback-text').innerText = text;
}

nextBtn.addEventListener('click', () => {
    currentQuizIndex++;
    loadQuestion();
});

// 🌟 게임 오버 처리: 영적 보물 0점 초기화 및 라이프 5개 재충전
async function triggerGameOver() {
    choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
    
    // 영적 보물 0개로 리셋 & 다음 도전을 위해 라이프 5개 충전
    const previousScore = currentScore;
    currentScore = 0;
    totalLives = 5;
    
    // 클라우드 DB 즉시 동기화
    await saveUserData(currentScore, totalLives);
    updateScoreBoard();
    updateLivesIcon();

    gameoverRankBox.innerHTML = `
        이전 기록: <strong>💎 ${previousScore}개</strong><br>
        <span style="color:#EF4444; font-size:0.9rem;">영적 보물이 0개로 리셋되었습니다.</span><br>
        새로운 라이프(❤️❤️❤️❤️❤️)가 충전되었습니다.
    `;
    gameoverModal.style.display = 'flex';
}

// -------------------------------------------------------------
// [모드 2: 『진리의 빛 안에서』 로직]
// -------------------------------------------------------------
function setupWalkMode() {
    walkReadingRange.innerText = currentWalkPlan.reading_range.reference_display;
    walkGoalQuestion.innerText = `"${currentWalkPlan.reading_goal.key_question}"`;
    
    // 🌟 JW.ORG 웹사이트 링크로 연결
    jwLibraryDeeplink.href = currentWalkPlan.reading_range.web_url;

    jwLibraryDeeplink.onclick = () => {
        walkStatusTag.innerText = "읽기 완료 ✓";
        walkStatusTag.style.background = "#DCFCE7";
        walkStatusTag.style.color = "#15803D";
        jwLibraryDeeplink.classList.add('completed');
        jwLibraryDeeplink.innerHTML = "<span>✓ JW.ORG에서 읽음 (다시 열기)</span>";
    };

    const illu = currentWalkPlan.illustrations[0];
    walkVisualSymbol.innerText = illu.image_symbol;
    walkVisualDesc.innerText = `[${illu.title}] - ${illu.description}`;

    walkMeditationList.innerHTML = '';
    currentWalkPlan.meditation_summary.forEach(point => {
        const li = document.createElement('li');
        li.innerText = point;
        walkMeditationList.appendChild(li);
    });

    setupWordPuzzle();
}

function setupWordPuzzle() {
    puzzleVerseRef.innerText = `[암기 목표] ${currentWalkPlan.memory_verse.reference_display}`;
    puzzleDropZone.innerHTML = '';
    puzzleTileZone.innerHTML = '';
    selectedTiles = [];

    const placeholder = document.createElement('span');
    placeholder.id = "drop-zone-placeholder";
    placeholder.style.fontSize = "0.85rem";
    placeholder.style.color = "#9CA3AF";
    placeholder.innerText = "아래 단어 조각을 순서대로 터치하여 성구를 완성하세요.";
    puzzleDropZone.appendChild(placeholder);

    shuffledTiles = shuffleArray([...currentWalkPlan.memory_verse.puzzle_tiles]);

    shuffledTiles.forEach((tileText) => {
        const tile = document.createElement('div');
        tile.className = "word-tile";
        tile.innerText = tileText;
        tile.onclick = () => handleTileClick(tile, tileText);
        puzzleTileZone.appendChild(tile);
    });
}

function handleTileClick(tileElement, tileText) {
    const placeholder = document.getElementById('drop-zone-placeholder');
    if (placeholder) placeholder.remove();

    if (tileElement.classList.contains('placed')) {
        tileElement.classList.remove('placed');
        selectedTiles = selectedTiles.filter(t => t.element !== tileElement);
        tileElement.remove();
        puzzleTileZone.appendChild(tileElement);
    } else {
        tileElement.classList.add('placed');
        puzzleDropZone.appendChild(tileElement);
        selectedTiles.push({ text: tileText, element: tileElement });
    }
}

puzzleResetBtn.addEventListener('click', setupWordPuzzle);

puzzleCheckBtn.addEventListener('click', async () => {
    const correctTiles = currentWalkPlan.memory_verse.puzzle_tiles;
    const isCorrect = (selectedTiles.length === correctTiles.length) &&
                      selectedTiles.every((t, i) => t.text === correctTiles[i]);

    if (isCorrect) {
        currentScore += 5;
        updateScoreBoard();
        await saveUserData(currentScore, totalLives);
        await checkRewardMilestones();
        alert(`🎉 완벽합니다! 성구를 바르게 암송하셨습니다.\n하늘보물 💎 5점을 획득하셨습니다.\n\n"${currentWalkPlan.memory_verse.full_text}"`);
    } else {
        alert("아직 단어 조각의 순서가 맞지 않습니다. 다시 배열해 보세요!");
    }
});

// -------------------------------------------------------------
// [보상 & 랭킹 제어]
// -------------------------------------------------------------
async function checkRewardMilestones() {
    if (currentScore >= SURPRISE_GIFT_SCORE && !hasReceivedSurpriseGift) {
        hasReceivedSurpriseGift = true;
        showRewardModal("🎁✨", "기적의 깜짝 선물!", `경이롭습니다! 영적 보물 <strong>${currentScore.toLocaleString()}점</strong>에 도달하셨습니다!<br>명예의 전당(1만 점)까지 단 1보 남았습니다.`, "[ 9,999점 전설의 깜짝 선물권 ]", false);
        return;
    }

    if (currentScore >= HALL_OF_FAME_TARGET_SCORE) {
        resetPendingAfterReward = true;
        await saveToHallOfFame();
        showRewardModal("👑🏛️", "명예의 전당 영구 헌액!", `대기록 정복! 보물 <strong>10,000점</strong>을 달성하셨습니다!<br>회원님의 이름이 명예의 전당에 영구 기록되었습니다.`, "[ 10,000점 마스터 헌액패 ]", true);
    }
}

function showRewardModal(icon, title, desc, badge, willReset) {
    rewardModalIcon.innerText = icon;
    rewardModalTitle.innerText = title;
    rewardModalDesc.innerHTML = desc;
    rewardModalBadge.innerText = badge;
    resetPendingAfterReward = willReset;
    rewardModal.style.display = 'flex';
}

closeRewardBtn.addEventListener('click', () => {
    rewardModal.style.display = 'none';
    if (resetPendingAfterReward) {
        currentScore = 0;
        resetPendingAfterReward = false;
        hasReceivedSurpriseGift = false;
        updateScoreBoard();
        saveUserData(currentScore, totalLives);
        alert("점수가 0점으로 리셋되었습니다. 다회차 완주에 도전하세요!");
    }
});

async function showLeaderboard() {
    tabRealtime.classList.add('active');
    tabHall.classList.remove('active');
    rankingListContainer.innerHTML = `<li class="ranking-item">순위를 집계 중입니다...</li>`;
    myCurrentRankText.innerText = "";
    rankingModal.style.display = 'flex';

    try {
        const q = query(collection(db, "users"), orderBy("score", "desc"));
        const snap = await getDocs(q);
        if (snap.empty) {
            rankingListContainer.innerHTML = `<li class="ranking-item">등록된 순위가 없습니다.</li>`;
            return;
        }

        rankingListContainer.innerHTML = '';
        let rank = 1, myRank = null;
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const isMe = (currentUser && d.username === currentUser);
            if (isMe) myRank = rank;

            if (rank <= 10) {
                const li = document.createElement('li');
                li.className = `ranking-item ${isMe ? 'my-rank' : ''}`;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}위`;
                li.innerHTML = `<span class="ranking-rank">${medal}</span><span class="ranking-name">${d.username} ${isMe ? '(나)' : ''}</span><span class="ranking-score">💎 ${d.score}</span>`;
                rankingListContainer.appendChild(li);
            }
            rank++;
        });

        if (currentUser) {
            myCurrentRankText.innerText = myRank ? `현재 ${currentUser}님의 순위: ${myRank}위 (💎 ${currentScore}개)` : `현재 점수: 💎 ${currentScore}개`;
        }
    } catch (e) {
        rankingListContainer.innerHTML = `<li class="ranking-item" style="color:red;">순위 호출 실패</li>`;
    }
}

async function showHallOfFame() {
    tabHall.classList.add('active');
    tabRealtime.classList.remove('active');
    rankingListContainer.innerHTML = `<li class="ranking-item">기록을 불러오는 중...</li>`;
    myCurrentRankText.innerText = "👑 1만 점 완주 명예의 전당 헌액자들";

    try {
        const q = query(collection(db, "hall_of_fame"), orderBy("completions", "desc"));
        const snap = await getDocs(q);
        if (snap.empty) {
            rankingListContainer.innerHTML = `<li class="ranking-item" style="justify-content:center; color:#6B7280; text-align:center;">아직 1만 점 완주자가 없습니다.<br>첫 번째 주인공이 되어 보세요!</li>`;
            return;
        }

        rankingListContainer.innerHTML = '';
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const li = document.createElement('li');
            li.className = 'ranking-item';
            li.innerHTML = `<span class="ranking-rank">👑</span><span class="ranking-name" style="font-weight:bold;">${d.username}</span><span class="ranking-score" style="color:#EA580C;">${d.completions}회 완주</span>`;
            rankingListContainer.appendChild(li);
        });
    } catch (e) {
        rankingListContainer.innerHTML = `<li class="ranking-item" style="color:red;">명예의 전당 호출 실패</li>`;
    }
}

viewRankingBtn.addEventListener('click', showLeaderboard);
hubViewRankingBtn.addEventListener('click', showLeaderboard);
inQuizRankingBtn.addEventListener('click', showLeaderboard);
tabRealtime.addEventListener('click', showLeaderboard);
tabHall.addEventListener('click', showHallOfFame);
closeRankingBtn.addEventListener('click', () => { rankingModal.style.display = 'none'; });

gameoverHomeBtn.addEventListener('click', () => {
    gameoverModal.style.display = 'none';
    quizScreen.style.display = 'none';
    feedbackContainer.style.display = 'none';
    hubScreen.style.display = 'block';
});
