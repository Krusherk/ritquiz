export type UserRole = 'player' | 'host' | 'admin';

export interface User {
    id: string;
    privyId: string;
    username: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    role: UserRole;
    createdAt: number;
    updatedAt: number;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    creatorId: string;
    creatorUsername: string;
    creatorType: 'admin' | 'host';
    isGeneral: boolean;
    status: 'draft' | 'scheduled' | 'live' | 'completed';
    timerSeconds: number;
    scheduledAt: number | null;
    createdAt: number;
    questionCount: number;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    order: number;
}

export interface QuizResult {
    id: string;
    quizId: string;
    userId: string;
    username: string;
    avatarUrl: string | null;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    completedAt: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatarUrl: string | null;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}
