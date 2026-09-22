// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, getDoc, doc, setDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js"; 
import { quizData } from "./data.js"; 
import { walkInData } from "./data_walk.js"; 

// 인물 데이터 안전 임포트 (파일 로딩 에러 방어)
let personData = [];
try {
    const personModule = await import("./data_person.js");
    personData = personModule.personData || [];
} catch (e) {
    console.warn("data_person.js 로드 실패, 기본 데이터로 구동합니다:", e);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🌟 [점수 현실화] 명예의 전당 기준을 1,000점으로 조정 (원하는 값으로 변경 가능)
const HALL_OF_FAME_TARGET_SCORE = 1000;
const SURPRISE_GIFT_SCORE = HALL_OF_FAME_TARGET_SCORE - 1; // 999점

// 화면 컨테이너
const authScreen = document.getElementById('auth-screen');
const hubScreen = document.getElementById('hub-screen');
const quizScreen = document.getElementById('quiz-screen');
const walkScreen = document.getElementById('walk-screen');
const personScreen = document.getElementById('person-screen');

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
const modePersonBtn = document.getElementById('mode-person-btn');

// 퀴즈 요소 (모드 1)
const playerDisplay = document.getElementById('player-display');
const choicesContainer = document.getElementById('choices-container');
const feedbackContainer = document.getElementById('feedback-container');
const nextBtn = document.getElementById('next-btn');
const backToHubFromQuiz = document.getElementById('back-to-hub-from-quiz');

// 『진리의 빛 안에서』 요소 (모드 2)
const walkPlayerDisplay = document.getElementById('walk-player-display');
const walkReadingRange = document.getElementById('walk-reading-range');
const walkStatusTag = document.getElementById('walk-status-tag');
const walkGoalQuestion = document.getElementById('walk-goal-question');
const wolDeeplink = document.getElementById('wol-deeplink');
const puzzleVerseRef = document.getElementById('puzzle-verse-ref');
const puzzleDropZone = document.getElementById('puzzle-drop-zone');
const puzzleTileZone = document.getElementById('puzzle-tile-zone');
const puzzleResetBtn = document.getElementById('puzzle-reset-btn');
const puzzleCheckBtn = document.getElementById('puzzle-check-btn');
const puzzleScoreBadge = document.getElementById('puzzle-score-badge');
const walkMeditationList = document.getElementById('walk-meditation-list');
const backToHubFromWalk = document.getElementById('back-to-hub-from-walk');
const walkStreakBadge = document.getElementById('walk-streak-badge');

// 커스텀 월 달력 모달 요소
const calendarTriggerBtn = document.getElementById('calendar-trigger-btn');
const walkCalendarModal = document.getElementById('walk-calendar-modal');
const calMonthTitle = document.getElementById('cal-month-title');
const calDaysContainer = document.getElementById('cal-days-container');
const calPrevBtn = document.getElementById('cal-prev-btn');
const calNextBtn = document.getElementById('cal-next-btn');
const closeCalendarBtn = document.getElementById('close-calendar-btn');

// 『성경 인물 맞추기』 요소 (모드 3)
const personPlayerDisplay = document.getElementById('person-player-display');
const personScoreText = document.getElementById('person-score-text');
const personAttemptsIcon = document.getElementById('person-attempts-icon');
const backToHubFromPerson = document.getElementById('back-to-hub-from-person');
const personImage = document.getElementById('person-image');
const personCluesList = document.getElementById('person-clues-list');
const personChoicesContainer = document.getElementById('person-choices-container');
const personFeedbackContainer = document.getElementById('person-feedback-container');
const personFeedbackTitle = document.getElementById('person-feedback-title');
const personFeedbackText = document.getElementById('person-feedback-text');
const personNextBtn = document.getElementById('person-next-btn');

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

// 전역 게임 상태 변수
let currentUser = "";
let quizDataList = [];
let currentQuizIndex = 0;
let currentScore = 0;
let totalLives = 5;
let questionAttempts = 3;
let currentCorrectAnswer = "";
let hasReceivedSurpriseGift = false;
let resetPendingAfterReward = false;

// 모드 2 상태 변수
let currentWalkPlan = null;
let selectedTiles = [];
let walkPuzzleAttempts = 0;
let isPuzzleSolved = false;
let userLastSolvedDailyDate = ""; 
let userLastReadDailyDate = "";   
let viewingPlanDateStr = "";      

// 달력 뷰어 현재 연/월
let calViewYear = 2026;
let calViewMonth = 9;

// 모드 3 상태 변수
let personList = [];
let currentPersonIndex = 0;

// 오늘 날짜 헬퍼 (YYYY-MM-DD)
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 🌟 [익명화 헬퍼] 본인 외 타인의 실명을 안전하게 마스킹 처리하는 함수
function maskName(name, isMe) {
    if (isMe) return name; // 본인은 실명 그대로 반환
    if (!name) return "익명";
    const str = String(name).trim();
    if (str.length <= 1) return str;
    if (str.length === 2) {
        return str[0] + "*"; // 예: "김철" -> "김*"
    }
    // 3글자 이상: 첫 글자와 마지막 글자만 남기고 가운데 마스킹 (예: "홍길동" -> "홍*동")
    const midMask = "*".repeat(str.length - 2);
    return str[0] + midMask + str[str.length - 1];
}

// 자동 로그인 입력 복원
const savedName = localStorage.getItem('bibleQuizUser');
const savedPin = localStorage.getItem('bibleQuizPin');
if (savedName && usernameInput) usernameInput.value = savedName;
if (savedPin && pinInput) pinInput.value = savedPin;

// 관리자 파라미터 체크 (?admin=true)
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
    const scoreEl = document.getElementById('score-text');
    if (scoreEl) scoreEl.innerText = currentScore;
    if (hubScoreText) hubScoreText.innerText = currentScore;
    if (personScoreText) personScoreText.innerText = currentScore;
}

function updateLivesIcon() {
    const icon = document.getElementById('attempts-icon');
    const safeLives = Math.max(0, totalLives);
    const heartsText = '❤️'.repeat(safeLives) + '🤍'.repeat(5 - safeLives);
    if (icon) icon.innerText = heartsText;
    if (hubLivesBadge) hubLivesBadge.innerText = heartsText;
    if (personAttemptsIcon) personAttemptsIcon.innerText = heartsText;
}

function findVerseText(verseName) {
    for (const q of quizDataList) {
        if (q.verseTexts && q.verseTexts[verseName]) return q.verseTexts[verseName];
    }
    return "성경 본문 구절입니다.";
}

async function saveUserData(score, lives, solvedDate = null, readDate = null) {
    const activeUser = currentUser || localStorage.getItem('bibleQuizUser');
    if (!activeUser) return;

    localStorage.setItem(`score_${activeUser}`, score);
    localStorage.setItem(`lives_${activeUser}`, lives);
    if (solvedDate !== null) {
        userLastSolvedDailyDate = solvedDate;
        localStorage.setItem(`lastSolvedDailyDate_${activeUser}`, solvedDate);
    }
    if (readDate !== null) {
        userLastReadDailyDate = readDate;
        localStorage.setItem(`lastReadDailyDate_${activeUser}`, readDate);
    }

    try {
        const updatePayload = {
            username: activeUser,
            score: score,
            lives: lives,
            updatedAt: new Date()
        };
        if (solvedDate !== null) updatePayload.lastSolvedDailyDate = solvedDate;
        if (readDate !== null) updatePayload.lastReadDailyDate = readDate;

        await setDoc(doc(db, "users", activeUser), updatePayload, { merge: true });
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

// -------------------------------------------------------------
// [인증 및 허브 제어]
// -------------------------------------------------------------
if (loginBtn) {
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
                
                currentScore = userData.score || 0;
                totalLives = (userData.lives !== undefined) ? userData.lives : 5;
                userLastSolvedDailyDate = userData.lastSolvedDailyDate || localStorage.getItem(`lastSolvedDailyDate_${inputName}`) || "";
                userLastReadDailyDate = userData.lastReadDailyDate || localStorage.getItem(`lastReadDailyDate_${inputName}`) || "";
                
                localStorage.setItem(`lastSolvedDailyDate_${inputName}`, userLastSolvedDailyDate);
                localStorage.setItem(`lastReadDailyDate_${inputName}`, userLastReadDailyDate);
                localStorage.setItem(`score_${inputName}`, currentScore);
                localStorage.setItem(`lives_${inputName}`, totalLives);

                if (totalLives <= 0) {
                    totalLives = 5;
                    await saveUserData(currentScore, totalLives);
                }
            } else {
                currentScore = 0;
                totalLives = 5;
                userLastSolvedDailyDate = "";
                userLastReadDailyDate = "";
                await setDoc(userDocRef, {
                    username: inputName,
                    pin: inputPin,
                    score: 0,
                    lives: 5,
                    lastSolvedDailyDate: "",
                    lastReadDailyDate: "",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            currentUser = inputName;
            localStorage.setItem('bibleQuizUser', currentUser);
            localStorage.setItem('bibleQuizPin', inputPin);

            if (hubPlayerDisplay) hubPlayerDisplay.innerText = currentUser;
            if (playerDisplay) playerDisplay.innerText = currentUser;
            if (walkPlayerDisplay) walkPlayerDisplay.innerText = currentUser;
            if (personPlayerDisplay) personPlayerDisplay.innerText = currentUser;
            
            updateScoreBoard();
            updateLivesIcon();

            loginBtn.innerText = "학습 센터 입장하기";
            loginBtn.disabled = false;

            authScreen.style.display = 'none';
            hubScreen.style.display = 'block';

        } catch (error) {
            console.error("로그인 에러:", error);
            alert(`로그인 처리 중 에러가 발생했습니다:\n${error.message}\n네트워크 상태를 확인해 주세요.`);
            loginBtn.innerText = "학습 센터 입장하기";
            loginBtn.disabled = false;
        }
    });
}

if (hubLogoutBtn) {
    hubLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('bibleQuizUser');
        localStorage.removeItem('bibleQuizPin');
        if (usernameInput) usernameInput.value = "";
        if (pinInput) pinInput.value = "";
        hubScreen.style.display = 'none';
        authScreen.style.display = 'block';
    });
}

// 모드 전환
if (modeQuizBtn) {
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
}

if (modeWalkBtn) {
    modeWalkBtn.addEventListener('click', () => {
        hubScreen.style.display = 'none';
        walkScreen.style.display = 'block';
        setupWalkMode();
    });
}

if (modePersonBtn) {
    modePersonBtn.addEventListener('click', () => {
        if (personList.length === 0) {
            personList = shuffleArray([...personData]);
        }
        hubScreen.style.display = 'none';
        personScreen.style.display = 'block';
        loadPersonQuestion();
    });
}

if (backToHubFromQuiz) {
    backToHubFromQuiz.addEventListener('click', () => {
        quizScreen.style.display = 'none';
        feedbackContainer.style.display = 'none';
        choicesContainer.style.display = 'block';
        hubScreen.style.display = 'block';
        updateScoreBoard();
        updateLivesIcon();
    });
}

if (backToHubFromWalk) {
    backToHubFromWalk.addEventListener('click', () => {
        walkScreen.style.display = 'none';
        hubScreen.style.display = 'block';
        updateScoreBoard();
        updateLivesIcon();
    });
}

if (backToHubFromPerson) {
    backToHubFromPerson.addEventListener('click', () => {
        personScreen.style.display = 'none';
        personFeedbackContainer.style.display = 'none';
        personChoicesContainer.style.display = 'block';
        hubScreen.style.display = 'block';
        updateScoreBoard();
        updateLivesIcon();
    });
}

// -------------------------------------------------------------
// [모드 1: 5지선다 퀴즈 로직]
// -------------------------------------------------------------
function loadQuestion() {
    if (quizDataList.length === 0) {
        alert("문제를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
    }

    if (currentQuizIndex >= quizDataList.length) {
        alert("모든 문제를 순환했습니다! 문제를 다시 섞습니다.");
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

        if (questionAttempts === 1) {
            const allBtns = choicesContainer.querySelectorAll('.choice-btn');
            allBtns.forEach(b => b.classList.add('show-hint'));
        }

        if (questionAttempts <= 0) {
            totalLives--;
            updateLivesIcon();
            await saveUserData(currentScore, totalLives);

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

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentQuizIndex++;
        loadQuestion();
    });
}

async function triggerGameOver() {
    if (choicesContainer) {
        choicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
    }
    if (personChoicesContainer) {
        personChoicesContainer.querySelectorAll('.choice-btn').forEach(btn => btn.disabled = true);
    }
    
    const previousScore = currentScore;
    currentScore = 0;
    totalLives = 5;
    
    await saveUserData(currentScore, totalLives);
    updateScoreBoard();
    updateLivesIcon();

    if (gameoverRankBox) {
        gameoverRankBox.innerHTML = `
            이전 기록: <strong>💎 ${previousScore}개</strong><br>
            <span style="color:#EF4444; font-size:0.9rem;">영적 보물이 0개로 초기화되었습니다.</span><br>
            새로운 라이프(❤️❤️❤️❤️❤️)가 충전되었습니다.
        `;
    }
    if (gameoverModal) gameoverModal.style.display = 'flex';
}

// -------------------------------------------------------------
// [모드 2: 『진리의 빛 안에서』 로직]
// -------------------------------------------------------------
function findWalkPlanByDate(month, day) {
    const found = walkInData.find(item => item.month === month && item.day === day);
    return found || walkInData[0];
}

function getTodayWalkPlan() {
    const today = new Date();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    return findWalkPlanByDate(m, d);
}

function setupWalkMode(customDateStr = null) {
    const todayStr = getTodayDateString();
    const activeUser = currentUser || localStorage.getItem('bibleQuizUser') || "";

    if (customDateStr) {
        viewingPlanDateStr = customDateStr;
        const [y, m, d] = customDateStr.split('-').map(Number);
        currentWalkPlan = findWalkPlanByDate(m, d);
        calViewYear = y;
        calViewMonth = m;
    } else {
        viewingPlanDateStr = todayStr;
        currentWalkPlan = getTodayWalkPlan();
        const today = new Date();
        calViewYear = today.getFullYear();
        calViewMonth = today.getMonth() + 1;
    }

    const isToday = (viewingPlanDateStr === todayStr);

    if (activeUser) {
        userLastReadDailyDate = localStorage.getItem(`lastReadDailyDate_${activeUser}`) || userLastReadDailyDate;
        userLastSolvedDailyDate = localStorage.getItem(`lastSolvedDailyDate_${activeUser}`) || userLastSolvedDailyDate;
    }

    const isReadToday = isToday && (userLastReadDailyDate === todayStr);
    if (isReadToday) {
        walkStatusTag.innerText = "읽기 완료 ✓";
        walkStatusTag.style.background = "#DCFCE7";
        walkStatusTag.style.color = "#15803D";
        wolDeeplink.classList.add('completed');
        wolDeeplink.innerHTML = "<span>✓ 오늘 읽기 완료 (다시 열기)</span>";
    } else {
        walkStatusTag.innerText = "읽기 전";
        walkStatusTag.style.background = "#FEF3C7";
        walkStatusTag.style.color = "#B45309";
        wolDeeplink.classList.remove('completed');
        wolDeeplink.innerHTML = "<span>📖 날마다 성경을 검토함 읽기</span>";
    }

    isPuzzleSolved = isToday && (userLastSolvedDailyDate === todayStr);

    walkStreakBadge.innerText = `☀️ ${currentWalkPlan.date_display || "성구 묵상"}`;
    walkReadingRange.innerText = currentWalkPlan.reading_range.reference_display;
    walkGoalQuestion.innerText = `"${currentWalkPlan.reading_goal.key_question}"`;

    wolDeeplink.onclick = () => {
        walkStatusTag.innerText = "읽기 완료 ✓";
        walkStatusTag.style.background = "#DCFCE7";
        walkStatusTag.style.color = "#15803D";
        wolDeeplink.classList.add('completed');
        wolDeeplink.innerHTML = "<span>✓ 오늘 읽기 완료 (다시 열기)</span>";

        if (isToday) {
            saveUserData(currentScore, totalLives, null, todayStr);
        }
    };

    walkMeditationList.innerHTML = '';
    currentWalkPlan.meditation_summary.forEach(point => {
        const li = document.createElement('li');
        li.innerText = point;
        walkMeditationList.appendChild(li);
    });

    walkPuzzleAttempts = 0;

    if (isPuzzleSolved) {
        puzzleCheckBtn.disabled = true;
        puzzleCheckBtn.innerText = "✓ 오늘 암송 완료";
        puzzleScoreBadge.innerText = "보물 획득 완료 ✓";
    } else if (!isToday) {
        puzzleCheckBtn.disabled = false;
        puzzleCheckBtn.innerText = "맞추기 확인 (자유 복습)";
        puzzleScoreBadge.innerText = "자유 묵상 모드";
    } else {
        puzzleCheckBtn.disabled = false;
        puzzleCheckBtn.innerText = "완성 확인";
        updatePuzzleBadge();
    }

    setupWordPuzzle();
}

window.addEventListener('pageshow', () => {
    const activeUser = currentUser || localStorage.getItem('bibleQuizUser');
    if (activeUser && walkScreen && walkScreen.style.display === 'block') {
        setupWalkMode(viewingPlanDateStr || null);
    }
});

function renderWalkCalendar(year, month) {
    calMonthTitle.innerText = `${year}년 ${month}월`;
    calDaysContainer.innerHTML = '';

    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const todayStr = getTodayDateString();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day-cell disabled';
        calDaysContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'cal-day-cell';
        dayCell.innerText = day;

        const thisDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (thisDateStr === todayStr) {
            dayCell.classList.add('today');
        }

        if (thisDateStr === viewingPlanDateStr) {
            dayCell.classList.add('selected');
        }

        const hasData = walkInData.some(item => item.month === month && item.day === day && year === 2026);
        if (hasData) {
            dayCell.classList.add('has-data');
            dayCell.style.color = "#EA580C";
        }

        dayCell.onclick = () => {
            walkCalendarModal.style.display = 'none';
            setupWalkMode(thisDateStr);
        };

        calDaysContainer.appendChild(dayCell);
    }
}

if (calendarTriggerBtn) {
    calendarTriggerBtn.addEventListener('click', () => {
        if (calViewYear !== 2026) calViewYear = 2026;
        if (calViewMonth < 9) calViewMonth = 9;
        if (calViewMonth > 12) calViewMonth = 12;

        renderWalkCalendar(calViewYear, calViewMonth);
        walkCalendarModal.style.display = 'flex';
    });
}

if (calPrevBtn) {
    calPrevBtn.addEventListener('click', () => {
        if (calViewMonth > 9) {
            calViewMonth--;
            renderWalkCalendar(calViewYear, calViewMonth);
        } else {
            alert("성구 데이터는 2026년 9월부터 제공됩니다. 😊");
        }
    });
}

if (calNextBtn) {
    calNextBtn.addEventListener('click', () => {
        if (calViewMonth < 12) {
            calViewMonth++;
            renderWalkCalendar(calViewYear, calViewMonth);
        } else {
            alert("성구 데이터는 2026년 12월까지 제공됩니다. 😊");
        }
    });
}

if (closeCalendarBtn) {
    closeCalendarBtn.addEventListener('click', () => {
        walkCalendarModal.style.display = 'none';
    });
}

function updatePuzzleBadge() {
    const todayStr = getTodayDateString();
    if (viewingPlanDateStr !== todayStr) {
        puzzleScoreBadge.innerText = "자유 묵상 모드";
        return;
    }
    if (isPuzzleSolved) {
        puzzleScoreBadge.innerText = "보물 획득 완료 ✓";
        return;
    }
    if (walkPuzzleAttempts === 0) {
        puzzleScoreBadge.innerText = "첫 성공 시 💎 10점";
    } else if (walkPuzzleAttempts === 1) {
        puzzleScoreBadge.innerText = "이번 성공 시 💎 8점";
    } else {
        puzzleScoreBadge.innerText = "성공 시 💎 5점";
    }
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
    placeholder.innerText = "아래 단어 조각을 터치해 올바른 순서로 완성하세요.";
    puzzleDropZone.appendChild(placeholder);

    const shuffled = shuffleArray([...currentWalkPlan.memory_verse.puzzle_tiles]);

    shuffled.forEach((tileText) => {
        const tile = document.createElement('div');
        tile.className = "word-tile";
        tile.innerText = tileText;
        tile.onclick = () => handleTileFromBank(tile, tileText);
        puzzleTileZone.appendChild(tile);
    });
}

function handleTileFromBank(tileElement, tileText) {
    if (isPuzzleSolved) return;

    const placeholder = document.getElementById('drop-zone-placeholder');
    if (placeholder) placeholder.remove();

    tileElement.classList.add('placed');
    tileElement.innerHTML = `${tileText} <span class="tile-arrow">⇄</span>`;
    tileElement.onclick = () => handleTileInDropZone(tileElement, tileText);
    
    puzzleDropZone.appendChild(tileElement);
    selectedTiles.push({ text: tileText, element: tileElement });
}

function handleTileInDropZone(tileElement, tileText) {
    if (isPuzzleSolved) return;

    const currentIndex = selectedTiles.findIndex(t => t.element === tileElement);
    if (currentIndex === -1) return;

    if (selectedTiles.length > 1) {
        const nextIndex = (currentIndex + 1) % selectedTiles.length;
        
        const temp = selectedTiles[currentIndex];
        selectedTiles[currentIndex] = selectedTiles[nextIndex];
        selectedTiles[nextIndex] = temp;

        puzzleDropZone.innerHTML = '';
        selectedTiles.forEach(t => puzzleDropZone.appendChild(t.element));
    } else {
        returnTileToBank(tileElement, tileText);
    }
}

function returnTileToBank(tileElement, tileText) {
    if (isPuzzleSolved) return;

    tileElement.classList.remove('placed');
    tileElement.innerText = tileText;
    tileElement.onclick = () => handleTileFromBank(tileElement, tileText);

    selectedTiles = selectedTiles.filter(t => t.element !== tileElement);
    tileElement.remove();
    puzzleTileZone.appendChild(tileElement);

    if (selectedTiles.length === 0) {
        puzzleDropZone.innerHTML = `<span style="font-size: 0.85rem; color: #9CA3AF;" id="drop-zone-placeholder">아래 단어 조각을 터치해 올바른 순서로 완성하세요.</span>`;
    }
}

if (puzzleResetBtn) {
    puzzleResetBtn.addEventListener('click', () => {
        setupWordPuzzle();
    });
}

if (puzzleCheckBtn) {
    puzzleCheckBtn.addEventListener('click', async () => {
        const todayStr = getTodayDateString();
        const isToday = (viewingPlanDateStr === todayStr);

        if (isToday && (isPuzzleSolved || userLastSolvedDailyDate === todayStr)) {
            alert("오늘의 일용할 성구 보물을 이미 획득하셨습니다! 내일 새로운 성구에 도전해 보세요. 😊");
            puzzleCheckBtn.disabled = true;
            puzzleCheckBtn.innerText = "✓ 오늘 암송 완료";
            return;
        }

        const correctTiles = currentWalkPlan.memory_verse.puzzle_tiles;
        const isFull = (selectedTiles.length === correctTiles.length);
        const isCorrect = isFull && selectedTiles.every((t, i) => t.text === correctTiles[i]);

        if (isCorrect) {
            if (isToday) {
                isPuzzleSolved = true;
                puzzleCheckBtn.disabled = true;
                puzzleCheckBtn.innerText = "✓ 오늘 암송 완료";

                let earnedPoints = 5;
                if (walkPuzzleAttempts === 0) {
                    earnedPoints = 10;
                } else if (walkPuzzleAttempts === 1) {
                    earnedPoints = 8;
                }

                currentScore += earnedPoints;
                updateScoreBoard();

                await saveUserData(currentScore, totalLives, todayStr, null);
                await checkRewardMilestones();
                updatePuzzleBadge();

                alert(`🎉 완벽합니다! 오늘의 일용할 성구를 완성하셨습니다!\n획득 보물: 💎 +${earnedPoints}점 (현재 보물: 💎 ${currentScore}개)\n\n"${currentWalkPlan.memory_verse.full_text}"`);
            } else {
                alert(`🎉 완벽합니다! [${currentWalkPlan.date_display}] 성구를 바르게 암송하셨습니다.\n(자유 복습 모드에서는 보물이 추가되지 않습니다. 오늘의 성구도 도전해 보세요!)`);
            }
        } else {
            walkPuzzleAttempts++;
            updatePuzzleBadge();
            alert(`순서가 아직 맞지 않습니다. (조립 박스 안의 조각을 터치해 위치를 조정해 보세요!)\n${isToday ? '현재 남은 기회 보너스: ' + (walkPuzzleAttempts === 1 ? '💎 8점' : '💎 5점') : '다시 차근차근 맞춰 보세요!'}`);
        }
    });
}

// -------------------------------------------------------------
// [모드 3: 『성경 인물 맞추기』 로직]
// -------------------------------------------------------------
function loadPersonQuestion() {
    if (personData.length === 0) {
        alert("인물 데이터를 불러오는 중입니다. data_person.js 파일을 확인해 주세요.");
        return;
    }

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

    personImage.onerror = () => {
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
        personImage.onerror = null;
    };

    personImage.src = currentPerson.image;

    personCluesList.innerHTML = '';
    currentPerson.clues.forEach(clue => {
        const li = document.createElement('li');
        li.innerText = clue;
        personCluesList.appendChild(li);
    });

    const options = shuffleArray([currentPerson.correctAnswer, ...currentPerson.distractors]);
    options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        btn.innerHTML = `<span class="choice-number">${idx + 1}.</span> <strong>${opt}</strong>`;
        btn.onclick = () => handlePersonChoice(opt, btn, currentPerson);
        personChoicesContainer.appendChild(btn);
    });
}

async function handlePersonChoice(selectedAnswer, btn, person) {
    if (selectedAnswer === person.correctAnswer) {
        currentScore += 5;
        updateScoreBoard();
        await saveUserData(currentScore, totalLives);
        await checkRewardMilestones();

        personChoicesContainer.style.display = 'none';
        personFeedbackContainer.style.display = 'block';
        personFeedbackTitle.innerText = `🎉 정답입니다! (${person.correctAnswer}, +💎5)`;
        personFeedbackTitle.style.color = "#10B981";
        personFeedbackText.innerText = `📖 관련 성구: ${person.reference}\n\n위대한 믿음과 용기의 본을 남긴 인물입니다!`;
    } else {
        totalLives--;
        currentScore = Math.max(0, currentScore - 1);
        updateLivesIcon();
        updateScoreBoard();
        await saveUserData(currentScore, totalLives);

        btn.classList.add("wrong");
        btn.disabled = true;

        if (totalLives <= 0) {
            await triggerGameOver();
            return;
        }

        alert(`오답입니다! (-💎1, 남은 라이프: ${'❤️'.repeat(totalLives)}) 다시 선택해 보세요.`);
    }
}

if (personNextBtn) {
    personNextBtn.addEventListener('click', () => {
        currentPersonIndex++;
        loadPersonQuestion();
    });
}

// -------------------------------------------------------------
// [보상 & 랭킹 제어]
// -------------------------------------------------------------
async function checkRewardMilestones() {
    if (currentScore >= SURPRISE_GIFT_SCORE && !hasReceivedSurpriseGift) {
        hasReceivedSurpriseGift = true;
        const rewardMsg = `
            축하합니다! 영적 보물 <strong>${currentScore.toLocaleString()}점</strong>에 도달하셨습니다!<br>
            명예의 전당(${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점)까지 단 1보 남았습니다.<br><br>
            <span style="color: #EA580C; font-weight: bold;">
                📌 깜짝 선물 교환권을 스크린샷하여, 관리자(010-9020-4140)에게 보내주세요.
            </span>
        `.trim();
        
        showRewardModal(
            "🎁✨", 
            "기적의 깜짝 선물!", 
            rewardMsg, 
            `[ ${SURPRISE_GIFT_SCORE}점 전설의 깜짝 선물권 ]`, 
            false
        );
        return;
    }

    if (currentScore >= HALL_OF_FAME_TARGET_SCORE) {
        resetPendingAfterReward = true;
        await saveToHallOfFame();
        showRewardModal(
            "👑🏛️", 
            "명예의 전당 영구 헌액!", 
            `대기록 정복! 보물 <strong>${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점</strong>을 달성하셨습니다!<br>회원님의 이름이 명예의 전당에 영구 기록되었습니다.`, 
            `[ ${HALL_OF_FAME_TARGET_SCORE}점 마스터 헌액패 ]`, 
            true
        );
    }
}

// 🌟 [순위표 개편] 상위 30위까지 표시 + 본인 외 익명화(마스킹) 처리
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

            // 🌟 상위 30위까지 표시
            if (rank <= 30) {
                const li = document.createElement('li');
                li.className = `ranking-item ${isMe ? 'my-rank' : ''}`;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}위`;
                
                // 🌟 본인 외 익명(마스킹) 처리
                const displayName = maskName(d.username, isMe);

                li.innerHTML = `
                    <span class="ranking-rank">${medal}</span>
                    <span class="ranking-name">${displayName} ${isMe ? '(나)' : ''}</span>
                    <span class="ranking-score">💎 ${d.score}</span>
                `;
                rankingListContainer.appendChild(li);
            }
            rank++;
        });

        if (currentUser) {
            myCurrentRankText.innerText = myRank 
                ? `현재 ${currentUser}님의 순위: ${myRank}위 (💎 ${currentScore}개)` 
                : `현재 점수: 💎 ${currentScore}개 (30위권 밖)`;
        }
    } catch (e) {
        console.error(e);
        rankingListContainer.innerHTML = `<li class="ranking-item" style="color:red;">순위 호출 실패</li>`;
    }
}

// 🌟 [명예의 전당] 완주자 명단도 본인 외 익명화(마스킹) 처리
async function showHallOfFame() {
    tabHall.classList.add('active');
    tabRealtime.classList.remove('active');
    rankingListContainer.innerHTML = `<li class="ranking-item">기록을 불러오는 중...</li>`;
    myCurrentRankText.innerText = `👑 ${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점 완주 명예의 전당 헌액자들`;

    try {
        const q = query(collection(db, "hall_of_fame"), orderBy("completions", "desc"));
        const snap = await getDocs(q);
        if (snap.empty) {
            rankingListContainer.innerHTML = `<li class="ranking-item" style="justify-content:center; color:#6B7280; text-align:center;">아직 ${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점 완주자가 없습니다.<br>첫 번째 주인공이 되어 보세요!</li>`;
            return;
        }

        rankingListContainer.innerHTML = '';
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const isMe = (currentUser && d.username === currentUser);
            const displayName = maskName(d.username, isMe);

            const li = document.createElement('li');
            li.className = 'ranking-item';
            li.innerHTML = `
                <span class="ranking-rank">👑</span>
                <span class="ranking-name" style="font-weight:bold;">${displayName} ${isMe ? '(나)' : ''}</span>
                <span class="ranking-score" style="color:#EA580C;">${d.completions}회 완주</span>
            `;
            rankingListContainer.appendChild(li);
        });
    } catch (e) {
        console.error(e);
        rankingListContainer.innerHTML = `<li class="ranking-item" style="color:red;">명예의 전당 호출 실패</li>`;
    }
}

if (viewRankingBtn) viewRankingBtn.addEventListener('click', showLeaderboard);
if (hubViewRankingBtn) hubViewRankingBtn.addEventListener('click', showLeaderboard);
if (inQuizRankingBtn) inQuizRankingBtn.addEventListener('click', showLeaderboard);
if (tabRealtime) tabRealtime.addEventListener('click', showLeaderboard);
if (tabHall) tabHall.addEventListener('click', showHallOfFame);
if (closeRankingBtn) closeRankingBtn.addEventListener('click', () => { rankingModal.style.display = 'none'; });

if (gameoverHomeBtn) {
    gameoverHomeBtn.addEventListener('click', () => {
        gameoverModal.style.display = 'none';
        quizScreen.style.display = 'none';
        walkScreen.style.display = 'none';
        personScreen.style.display = 'none';
        feedbackContainer.style.display = 'none';
        choicesContainer.style.display = 'block';
        hubScreen.style.display = 'block';
    });
}
