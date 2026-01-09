import { db, ref, get, set, update, onValue } from '../lib/firebase';
import type { User, Quiz, Question, QuizResult, LeaderboardEntry } from '../types';

// ============= USER SERVICES =============

export async function getUserByPrivyId(privyId: string): Promise<User | null> {
    const userRef = ref(db, `users/${privyId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return { id: privyId, ...snapshot.val() } as User;
    }
    return null;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
    const usernameRef = ref(db, `usernames/${username.toLowerCase()}`);
    const snapshot = await get(usernameRef);
    return snapshot.exists();
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
    const userRef = ref(db, `users/${userData.privyId}`);
    const usernameRef = ref(db, `usernames/${userData.username.toLowerCase()}`);

    // Reserve the username
    await set(usernameRef, { privyId: userData.privyId });

    // Create user
    await set(userRef, userData);

    return { id: userData.privyId, ...userData };
}

export async function updateUser(privyId: string, updates: Partial<User>): Promise<void> {
    const userRef = ref(db, `users/${privyId}`);
    await update(userRef, { ...updates, updatedAt: Date.now() });
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const users = snapshot.val();
        for (const key of Object.keys(users)) {
            if (users[key].email === email) {
                return { id: key, ...users[key] } as User;
            }
        }
    }
    return null;
}

export async function grantHostAccess(email: string): Promise<boolean> {
    const user = await getUserByEmail(email);
    if (user) {
        await updateUser(user.privyId, { role: 'host' });
        return true;
    }
    return false;
}

export async function revokeHostAccess(email: string): Promise<boolean> {
    const user = await getUserByEmail(email);
    if (user && user.role === 'host') {
        await updateUser(user.privyId, { role: 'player' });
        return true;
    }
    return false;
}

// ============= QUIZ SERVICES =============

export async function createQuiz(quizData: Omit<Quiz, 'id'>): Promise<Quiz> {
    const quizId = Date.now().toString();
    const newQuizRef = ref(db, `quizzes/${quizId}`);

    await set(newQuizRef, quizData);

    return { id: quizId, ...quizData };
}

export async function getQuiz(quizId: string): Promise<Quiz | null> {
    const quizRef = ref(db, `quizzes/${quizId}`);
    const snapshot = await get(quizRef);
    if (snapshot.exists()) {
        return { id: quizId, ...snapshot.val() } as Quiz;
    }
    return null;
}

export async function updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<void> {
    const quizRef = ref(db, `quizzes/${quizId}`);
    await update(quizRef, updates);
}

export async function getAllQuizzes(): Promise<Quiz[]> {
    const quizzesRef = ref(db, 'quizzes');
    const snapshot = await get(quizzesRef);
    if (snapshot.exists()) {
        const quizzes = snapshot.val();
        return Object.keys(quizzes).map(key => ({ id: key, ...quizzes[key] }));
    }
    return [];
}

export async function getGeneralQuizzes(): Promise<Quiz[]> {
    const quizzes = await getAllQuizzes();
    return quizzes.filter(q => q.isGeneral && q.status !== 'draft');
}

export async function getHostQuizzes(): Promise<Quiz[]> {
    const quizzes = await getAllQuizzes();
    return quizzes.filter(q => !q.isGeneral && q.status !== 'draft');
}

export async function getQuizzesByCreator(creatorId: string): Promise<Quiz[]> {
    const quizzes = await getAllQuizzes();
    return quizzes.filter(q => q.creatorId === creatorId);
}

// ============= QUESTION SERVICES =============

export async function addQuestion(quizId: string, questionData: Omit<Question, 'id'>): Promise<Question> {
    const questionId = Date.now().toString();
    const questionRef = ref(db, `quizzes/${quizId}/questions/${questionId}`);

    await set(questionRef, questionData);

    // Update question count
    const quiz = await getQuiz(quizId);
    if (quiz) {
        await updateQuiz(quizId, { questionCount: quiz.questionCount + 1 });
    }

    return { id: questionId, ...questionData };
}

export async function getQuestions(quizId: string): Promise<Question[]> {
    const questionsRef = ref(db, `quizzes/${quizId}/questions`);
    const snapshot = await get(questionsRef);
    if (snapshot.exists()) {
        const questions = snapshot.val();
        return Object.keys(questions)
            .map(key => ({ id: key, ...questions[key] }))
            .sort((a, b) => a.order - b.order);
    }
    return [];
}

export async function updateQuestion(quizId: string, questionId: string, updates: Partial<Question>): Promise<void> {
    const questionRef = ref(db, `quizzes/${quizId}/questions/${questionId}`);
    await update(questionRef, updates);
}

export async function deleteQuestion(quizId: string, questionId: string): Promise<void> {
    const questionRef = ref(db, `quizzes/${quizId}/questions/${questionId}`);
    await set(questionRef, null);

    // Update question count
    const quiz = await getQuiz(quizId);
    if (quiz) {
        await updateQuiz(quizId, { questionCount: Math.max(0, quiz.questionCount - 1) });
    }
}

// ============= RESULT SERVICES =============

export async function submitQuizResult(resultData: Omit<QuizResult, 'id'>): Promise<QuizResult> {
    const resultId = `${resultData.quizId}_${resultData.userId}`;
    const resultRef = ref(db, `results/${resultData.quizId}/${resultData.userId}`);

    await set(resultRef, resultData);

    return { id: resultId, ...resultData };
}

export async function getQuizResults(quizId: string): Promise<QuizResult[]> {
    const resultsRef = ref(db, `results/${quizId}`);
    const snapshot = await get(resultsRef);
    if (snapshot.exists()) {
        const results = snapshot.val();
        return Object.keys(results)
            .map(key => ({ id: `${quizId}_${key}`, ...results[key] }))
            .sort((a, b) => b.score - a.score);
    }
    return [];
}

export async function getUserResult(quizId: string, userId: string): Promise<QuizResult | null> {
    const resultRef = ref(db, `results/${quizId}/${userId}`);
    const snapshot = await get(resultRef);
    if (snapshot.exists()) {
        return { id: `${quizId}_${userId}`, ...snapshot.val() } as QuizResult;
    }
    return null;
}

// ============= LEADERBOARD SERVICES =============

export async function getLeaderboard(quizId: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const results = await getQuizResults(quizId);
    return results.slice(0, limit).map((result, index) => ({
        rank: index + 1,
        userId: result.userId,
        username: result.username,
        avatarUrl: result.avatarUrl,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions
    }));
}

export async function getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const quizzes = await getAllQuizzes();
    const userScores: { [userId: string]: { username: string; avatarUrl: string | null; totalScore: number; totalCorrect: number; totalQuestions: number } } = {};

    for (const quiz of quizzes) {
        const results = await getQuizResults(quiz.id);
        for (const result of results) {
            if (!userScores[result.userId]) {
                userScores[result.userId] = {
                    username: result.username,
                    avatarUrl: result.avatarUrl,
                    totalScore: 0,
                    totalCorrect: 0,
                    totalQuestions: 0
                };
            }
            userScores[result.userId].totalScore += result.score;
            userScores[result.userId].totalCorrect += result.correctAnswers;
            userScores[result.userId].totalQuestions += result.totalQuestions;
        }
    }

    return Object.entries(userScores)
        .map(([userId, data]) => ({
            rank: 0,
            userId,
            username: data.username,
            avatarUrl: data.avatarUrl,
            score: data.totalScore,
            correctAnswers: data.totalCorrect,
            totalQuestions: data.totalQuestions
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

// ============= REALTIME LISTENERS =============

export function subscribeToQuizResults(quizId: string, callback: (results: QuizResult[]) => void): () => void {
    const resultsRef = ref(db, `results/${quizId}`);
    const unsubscribe = onValue(resultsRef, (snapshot) => {
        if (snapshot.exists()) {
            const results = snapshot.val();
            const resultsList = Object.keys(results)
                .map(key => ({ id: `${quizId}_${key}`, ...results[key] }))
                .sort((a, b) => b.score - a.score);
            callback(resultsList);
        } else {
            callback([]);
        }
    });

    return unsubscribe;
}
