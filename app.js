// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, getDoc, doc, setDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { quizData } from "./data.js"; 

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

// ============================================================================
// 🌟 목표 점수 설정 (10,000점 완주 / 9,999점 깜짝 선물)
// ============================================================================
const HALL_OF_FAME_TARGET_SCORE = 10000;                      // 명예의 전당 입성 점수 (1만 점)
const SURPRISE_GIFT_SCORE = HALL_OF_FAME_TARGET_SCORE - 1;    // 깜짝 선물 점수 (9,999점)

// DOM 요소 참조
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const startBtn = document.getElementById('start-btn');
const uploadBtn = document.getElementById('upload-btn');
const viewRankingBtn = document.getElementById('view-ranking-btn');
const inQuizRankingBtn = document.getElementById('in-quiz-ranking-btn');
const usernameInput = document.getElementById('username-input');
const playerDisplay = document.getElementById('player-display');

const choicesContainer = document.getElementById('choices-container');
const feedbackContainer = document.getElementById('feedback-container');
const nextBtn = document.getElementById('next-btn');

// 보상 모달 요소
const rewardModal = document.getElementById('reward-modal');
const rewardModalIcon = document.getElementById('reward-modal-icon');
const rewardModalTitle = document.getElementById('reward-modal-title');
const rewardModalDesc = document.getElementById('reward-modal-desc');
const rewardModalBadge = document.getElementById('reward-modal-badge');
const closeRewardBtn = document.getElementById('close-reward-btn');

// 랭킹 및 명예의 전당 탭 요소
const rankingModal = document.getElementById('ranking-modal');
const rankingListContainer = document.getElementById('ranking-list-container');
const myCurrentRankText = document.getElementById('my-current-rank-text');
const closeRankingBtn = document.getElementById('close-ranking-btn');
const tabRealtime = document.getElementById('tab-realtime');
const tabHall = document.getElementById('tab-hall');

// 게임 오버 모달 요소
const gameoverModal = document.getElementById('gameover-modal');
const gameoverRankBox = document.getElementById('gameover-rank-box');
const gameoverHomeBtn = document.getElementById('gameover-home-btn');

// 게임 진행 상태 변수
let currentUser = "";
let quizDataList = [];
let currentQuizIndex = 0;
let currentScore = 0;
let currentCorrectAnswer = "";

// 목숨 및 문항별 시도 변수
let totalLives = 5;          // 전체 목숨 (하트 5개)
let questionAttempts = 3;    // 해당 문항 내 남은 시도 횟수 (3, 2, 1)

// 보상 상태 변수
let hasReceivedSurpriseGift = false;
let resetPendingAfterReward = false;

// 로컬 스토리지에 저장된 사용자 이름 자동 로드
const savedName = localStorage.getItem('bibleQuizUser');
if (savedName) {
    usernameInput.value = savedName;
}

// 관리자 모드 검사 (?admin=true)
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';
if (isAdmin && uploadBtn) {
    uploadBtn.style.display = "block";
}

// DB 업데이트 버튼 이벤트
if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        uploadBtn.innerText = "업로드 진행 중...";
        uploadBtn.disabled = true;
        try {
            for (const quiz of quizData) {
                await setDoc(doc(db, "quizzes", quiz.id.toString()), quiz);
            }
            alert(`총 ${quizData.length}개의 데이터가 파이어베이스에 성공적으로 업데이트되었습니다!`);
            uploadBtn.innerText = "업로드 완료!";
        } catch (error) {
            console.error(error);
            alert("업로드 실패!");
            uploadBtn.disabled = false;
        }
    });
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function updateLivesIcon() {
    const iconContainer = document.getElementById('attempts-icon');
    const safeLives = Math.max(0, totalLives);
    iconContainer.innerText = '❤️'.repeat(safeLives) + '🤍'.repeat(5 - safeLives);
}

function updateScoreBoard() {
    document.getElementById('score-text').innerText = currentScore;
}

function findVerseText(verseName) {
    for (const q of quizDataList) {
        if (q.verseTexts && q.verseTexts[verseName]) {
            return q.verseTexts[verseName];
        }
    }
    return "성경 본문 구절입니다.";
}

// 사용자 실시간 점수 Firestore 저장
async function saveUserScore(score) {
    if (!currentUser) return;
    try {
        await setDoc(doc(db, "users", currentUser), {
            username: currentUser,
            score: score,
            updatedAt: new Date()
        }, { merge: true });
    } catch (e) {
        console.error("점수 저장 실패:", e);
    }
}

// 10,000점 완주자 명예의 전당 영구 보존
async function saveToHallOfFame() {
    if (!currentUser) return;
    try {
        const hallDocRef = doc(db, "hall_of_fame", currentUser);
        const docSnap = await getDoc(hallDocRef);
        
        let completions = 1;
        if (docSnap.exists()) {
            completions = (docSnap.data().completions || 1) + 1;
        }

        await setDoc(hallDocRef, {
            username: currentUser,
            completions: completions,
            lastAchievedAt: new Date()
        }, { merge: true });
    } catch (e) {
        console.error("명예의 전당 영구 보존 실패:", e);
    }
}

// 현재 사용자 실시간 등수 조회
async function fetchUserRank() {
    try {
        const q = query(collection(db, "users"), orderBy("score", "desc"));
        const querySnapshot = await getDocs(q);
        let rank = 1;
        for (const docSnap of querySnapshot.docs) {
            if (docSnap.data().username === currentUser) {
                return rank;
            }
            rank++;
        }
        return rank;
    } catch (e) {
        console.error("순위 조회 실패:", e);
        return null;
    }
}

// 실시간 TOP 10 렌더링
async function showLeaderboard() {
    tabRealtime.classList.add('active');
    tabHall.classList.remove('active');
    rankingListContainer.innerHTML = `<li class="ranking-item">순위를 집계 중입니다...</li>`;
    myCurrentRankText.innerText = "";
    rankingModal.style.display = 'flex';

    try {
        const q = query(collection(db, "users"), orderBy("score", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            rankingListContainer.innerHTML = `<li class="ranking-item">등록된 순위가 없습니다.</li>`;
            return;
        }

        rankingListContainer.innerHTML = '';
        let rank = 1;
        let myRank = null;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const isMe = (currentUser && data.username === currentUser);
            if (isMe) myRank = rank;

            if (rank <= 10) {
                const li = document.createElement('li');
                li.className = `ranking-item ${isMe ? 'my-rank' : ''}`;
                
                let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}위`;
                li.innerHTML = `
                    <span class="ranking-rank">${medal}</span>
                    <span class="ranking-name">${data.username} ${isMe ? '(나)' : ''}</span>
                    <span class="ranking-score">💎 ${data.score}</span>
                `;
                rankingListContainer.appendChild(li);
            }
            rank++;
        });

        if (currentUser) {
            if (myRank !== null) {
                myCurrentRankText.innerText = `현재 ${currentUser}님의 순위: ${myRank}위 (💎 ${currentScore}개)`;
            } else {
                myCurrentRankText.innerText = `현재 ${currentUser}님의 점수: 💎 ${currentScore}개`;
            }
        }
    } catch (error) {
        console.error(error);
        rankingListContainer.innerHTML = `<li class="ranking-item" style="color:red;">순위를 불러오지 못했습니다.</li>`;
    }
}

// 명예의 전당 헌액자 렌더링
async function showHallOfFame() {
    tabHall.classList.add('active');
    tabRealtime.classList.remove('active');
    rankingListContainer.innerHTML = `<li class="ranking-item">영구 보존 기록을 불러오는 중...</li>`;
    myCurrentRankText.innerText = `👑 ${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점 완주 명예의 전당 헌액자들`;

    try {
        const q = query(collection(db, "hall_of_fame"), orderBy("completions", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            rankingListContainer.innerHTML = `<li class="ranking-item" style="justify-content:center; color:#6B7280; text-align:center;">아직 ${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점을 완주한 영웅이 없습니다.<br>첫 번째 헌액자가 되어 보세요!</li>`;
            return;
        }

        rankingListContainer.innerHTML = '';
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const li = document.createElement('li');
            li.className = 'ranking-item';
            
            li.innerHTML = `
                <span class="ranking-rank">👑</span>
                <span class="ranking-name" style="font-weight:bold;">${data.username}</span>
                <span class="ranking-score" style="color:#EA580C;">${data.completions}회 완주</span>
            `;
            rankingListContainer.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        rankingListContainer.innerHTML = `<li class="ranking-item" style="color:red;">명예의 전당을 불러오지 못했습니다.</li>`;
    }
}

// ============================================================================
// 🌟 [퀴즈 시작하기] 로직 개선: 이전 점수 이어받기 및 동일 이름 중복 체크
// ============================================================================
startBtn.addEventListener('click', async () => {
    const inputName = usernameInput.value.trim();
    if (!inputName) {
        alert("학습자 본인의 이름을 입력해 주세요!");
        usernameInput.focus();
        return;
    }

    startBtn.innerText = "사용자 확인 중...";
    startBtn.disabled = true;

    try {
        const userDocRef = doc(db, "users", inputName);
        const userDocSnap = await getDoc(userDocRef);
        const localSavedName = localStorage.getItem('bibleQuizUser');

        if (userDocSnap.exists()) {
            // Firestore에 이미 존재하는 이름일 때
            if (localSavedName === inputName) {
                // 본인이 기존에 접속하던 기기인 경우 ➔ 이전 점수 불러와서 이어하기!
                const existingScore = userDocSnap.data().score || 0;
                currentScore = existingScore;
                alert(`반갑습니다, ${inputName}님!\n이전에 모으신 하늘보물 💎 ${currentScore}개부터 계속 이어갑니다.`);
            } else {
                // 다른 기기나 다른 사람이 이미 등록한 이름을 처음 입력한 경우 ➔ 중복 방지
                alert(`[${inputName}] 이름은 이미 등록되어 있습니다.\n동명이인 구분을 위해 다른 이름(예: ${inputName}A, ${inputName}1 등)으로 입력해 주세요.`);
                startBtn.innerText = "퀴즈 시작하기";
                startBtn.disabled = false;
                usernameInput.focus();
                return;
            }
        } else {
            // 데이터베이스에 처음 등록되는 신규 사용자
            currentScore = 0;
        }

        currentUser = inputName;
        localStorage.setItem('bibleQuizUser', currentUser);
        playerDisplay.innerText = currentUser;

        // 게임 시작 시 목숨 5개 리셋
        totalLives = 5;

        // 문제 리스트 로드 (비어있을 때만)
        if (quizDataList.length === 0) {
            startBtn.innerText = "문제 불러오는 중...";
            const querySnapshot = await getDocs(collection(db, "quizzes"));
            querySnapshot.forEach((docSnap) => quizDataList.push(docSnap.data()));
            quizDataList = shuffleArray(quizDataList);
        }
        
        // 현재 점수 저장 및 동기화
        await saveUserScore(currentScore);

        startBtn.innerText = "퀴즈 시작하기";
        startBtn.disabled = false;
        homeScreen.style.display = 'none';
        quizScreen.style.display = 'block';
        loadQuestion();

    } catch (error) {
        console.error("로그인 및 사용자 확인 오류:", error);
        alert("사용자 정보를 확인하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        startBtn.innerText = "퀴즈 시작하기";
        startBtn.disabled = false;
    }
});

function loadQuestion() {
    if (currentQuizIndex >= quizDataList.length) {
        alert(`준비된 모든 퀴즈를 완주하셨습니다! 문제를 다시 섞어 순환 출제합니다.`);
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

    const shuffledCorrectVerses = shuffleArray([...quiz.correctVerses]);
    currentCorrectAnswer = shuffledCorrectVerses[0];

    let wrongAnswers = [];
    quizDataList.forEach(q => {
        if (q.id !== quiz.id) {
            wrongAnswers.push(...q.correctVerses);
        }
    });
    wrongAnswers = shuffleArray(wrongAnswers).slice(0, 4);

    const choices = shuffleArray([currentCorrectAnswer, ...wrongAnswers]);
    
    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = "choice-btn";
        
        const fullText = findVerseText(choice);

        btn.innerHTML = `
            <span class="choice-number">${index + 1}.</span> ${choice}
            <span class="tooltip-text">💡 [성구 힌트] ${choice}\n"${fullText}"</span>
        `;
        
        btn.onclick = () => handleChoice(choice, btn, quiz);
        choicesContainer.appendChild(btn);
    });
}

async function handleChoice(selectedChoice, buttonElement, quiz) {
    if (selectedChoice === currentCorrectAnswer) {
        let points = (questionAttempts === 3) ? 5 : (questionAttempts === 2) ? 3 : 1;
        currentScore += points;
        updateScoreBoard();
        saveUserScore(currentScore);

        // 9,999점 및 10,000점 도달 감지
        await checkRewardMilestones();

        const fullText = findVerseText(currentCorrectAnswer);
        const feedbackMsg = `📖 정답 성구: ${currentCorrectAnswer}\n"${fullText}"\n\n💡 묵상 포인트: ${quiz.hintExplanation}`;
        showFeedback(`🎉 정답입니다! (+💎${points})`, feedbackMsg, true);
    } else {
        questionAttempts--;
        currentScore = Math.max(0, currentScore - 1);
        
        updateScoreBoard();
        saveUserScore(currentScore);
        
        buttonElement.classList.add("wrong"); 
        buttonElement.disabled = true;

        if (questionAttempts === 1) {
            const activeButtons = choicesContainer.querySelectorAll('.choice-btn:not(:disabled)');
            activeButtons.forEach(btn => btn.classList.add('show-hint'));
        }

        // 문제를 3번 다 틀렸을 때만 목숨 1개 차감
        if (questionAttempts <= 0) {
            totalLives--;
            updateLivesIcon();

            if (totalLives <= 0) {
                triggerGameOver();
                return;
            }

            showFeedback(`😢 아쉽습니다! (0점)`, `💡 힌트 성구: ${quiz.hintVerse}\n\n${quiz.hintExplanation}`, false);
        }
    }
}

async function triggerGameOver() {
    const allButtons = choicesContainer.querySelectorAll('.choice-btn');
    allButtons.forEach(btn => btn.disabled = true);

    gameoverRankBox.innerText = "최종 등수를 계산하고 있습니다...";
    gameoverModal.style.display = 'flex';

    const userRank = await fetchUserRank();
    if (userRank !== null) {
        gameoverRankBox.innerHTML = `
            내 최종 보물: <strong>💎 ${currentScore}개</strong><br>
            현재 전체 순위: <strong>${userRank}위</strong>
        `;
    } else {
        gameoverRankBox.innerHTML = `내 최종 보물: <strong>💎 ${currentScore}개</strong>`;
    }
}

// 9,999점 깜짝 선물 & 10,000점 명예의 전당 영구 헌액
async function checkRewardMilestones() {
    // 1. 깜짝 선물 (9,999점 도달 시 1회 발동)
    if (currentScore >= SURPRISE_GIFT_SCORE && !hasReceivedSurpriseGift) {
        hasReceivedSurpriseGift = true;
        showRewardModal(
            "🎁✨", 
            "기적의 깜짝 선물 달성!", 
            `놀랍습니다! 영적 보물 <strong>${currentScore.toLocaleString()}점</strong>을 달성하셨습니다!<br>오랜 인내와 성실한 연구가 맺은 빛나는 결실입니다.<br>명예의 전당까지 단 1걸음 남았습니다!`, 
            `[ ${SURPRISE_GIFT_SCORE.toLocaleString()}점 전설의 깜짝 선물권 ]`,
            false
        );
        return;
    }

    // 2. 명예의 전당 영구 헌액 (10,000점 도달 시)
    if (currentScore >= HALL_OF_FAME_TARGET_SCORE) {
        resetPendingAfterReward = true;
        
        await saveToHallOfFame();

        showRewardModal(
            "👑🏛️", 
            "명예의 전당 영구 헌액!", 
            `대기록 달성! 보물 <strong>${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점</strong>을 정복하셨습니다!<br><strong>명예의 전당에 회원님의 이름이 영구히 새겨졌습니다.</strong><br>확인을 누르시면 점수는 0점으로 새로 리셋되어 다회 완주에 도전하실 수 있습니다.`, 
            `[ ${HALL_OF_FAME_TARGET_SCORE.toLocaleString()}점 마스터 영구 헌액패 ]`,
            true
        );
    }
}

function showRewardModal(icon, title, desc, badgeText, willReset) {
    rewardModalIcon.innerText = icon;
    rewardModalTitle.innerText = title;
    rewardModalDesc.innerHTML = desc;
    rewardModalBadge.innerText = badgeText;
    resetPendingAfterReward = willReset;
    rewardModal.style.display = 'flex';
}

function showFeedback(title, text, isCorrect) {
    choicesContainer.style.display = 'none';
    feedbackContainer.style.display = 'block';
    
    const titleElement = document.getElementById('feedback-title');
    titleElement.innerText = title;
    titleElement.style.color = isCorrect ? "#10B981" : "#EF4444"; 
    
    document.getElementById('feedback-text').innerText = text;
}

nextBtn.addEventListener('click', () => {
    currentQuizIndex++;
    loadQuestion();
});

closeRewardBtn.addEventListener('click', () => {
    rewardModal.style.display = 'none';
    if (resetPendingAfterReward) {
        currentScore = 0;
        resetPendingAfterReward = false;
        hasReceivedSurpriseGift = false;
        updateScoreBoard();
        saveUserScore(currentScore);
        alert("점수가 0점으로 리셋되었습니다. 명예의 전당 다회 완주에 도전해 보세요!");
    }
});

// 순위표 및 명예의 전당 탭 이벤트
viewRankingBtn.addEventListener('click', showLeaderboard);
inQuizRankingBtn.addEventListener('click', showLeaderboard);
tabRealtime.addEventListener('click', showLeaderboard);
tabHall.addEventListener('click', showHallOfFame);

closeRankingBtn.addEventListener('click', () => {
    rankingModal.style.display = 'none';
});

gameoverHomeBtn.addEventListener('click', () => {
    gameoverModal.style.display = 'none';
    quizScreen.style.display = 'none';
    feedbackContainer.style.display = 'none';
    homeScreen.style.display = 'block';
});
