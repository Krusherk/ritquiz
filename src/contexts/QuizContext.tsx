import { createContext, useContext, useState, ReactNode } from 'react';
import { Quiz, Question, QuizResult } from '../types';
import {
    getQuiz,
    getQuestions,
    submitQuizResult,
    getUserResult
} from '../services/firebase';
import { useAuth } from './AuthContext';

interface QuizState {
    quiz: Quiz | null;
    questions: Question[];
    currentQuestionIndex: number;
    answers: { [questionId: string]: number };
    timeRemaining: number;
    isStarted: boolean;
    isFinished: boolean;
    result: QuizResult | null;
}

interface QuizContextType {
    state: QuizState;
    loadQuiz: (quizId: string) => Promise<void>;
    startQuiz: () => void;
    selectAnswer: (questionId: string, optionIndex: number) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;
    submitQuiz: () => Promise<QuizResult>;
    setTimeRemaining: (time: number) => void;
    resetQuiz: () => void;
}

const initialState: QuizState = {
    quiz: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    isStarted: false,
    isFinished: false,
    result: null
};

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [state, setState] = useState<QuizState>(initialState);

    const loadQuiz = async (quizId: string) => {
        const quiz = await getQuiz(quizId);
        if (!quiz) throw new Error('Quiz not found');

        const questions = await getQuestions(quizId);

        // Check if user already completed this quiz
        let existingResult: QuizResult | null = null;
        if (user) {
            existingResult = await getUserResult(quizId, user.privyId);
        }

        setState({
            ...initialState,
            quiz,
            questions,
            timeRemaining: quiz.timerSeconds,
            result: existingResult,
            isFinished: !!existingResult
        });
    };

    const startQuiz = () => {
        setState(prev => ({
            ...prev,
            isStarted: true,
            timeRemaining: prev.quiz?.timerSeconds || 30
        }));
    };

    const selectAnswer = (questionId: string, optionIndex: number) => {
        setState(prev => ({
            ...prev,
            answers: {
                ...prev.answers,
                [questionId]: optionIndex
            }
        }));
    };

    const nextQuestion = () => {
        setState(prev => {
            if (prev.currentQuestionIndex < prev.questions.length - 1) {
                return {
                    ...prev,
                    currentQuestionIndex: prev.currentQuestionIndex + 1,
                    timeRemaining: prev.quiz?.timerSeconds || 30
                };
            }
            return prev;
        });
    };

    const previousQuestion = () => {
        setState(prev => {
            if (prev.currentQuestionIndex > 0) {
                return {
                    ...prev,
                    currentQuestionIndex: prev.currentQuestionIndex - 1
                };
            }
            return prev;
        });
    };

    const setTimeRemaining = (time: number) => {
        setState(prev => ({ ...prev, timeRemaining: time }));
    };

    const submitQuiz = async (): Promise<QuizResult> => {
        if (!user || !state.quiz) throw new Error('Cannot submit quiz');

        // Calculate score
        let correctAnswers = 0;
        for (const question of state.questions) {
            if (state.answers[question.id] === question.correctIndex) {
                correctAnswers++;
            }
        }

        const score = Math.round((correctAnswers / state.questions.length) * 100);

        const result = await submitQuizResult({
            quizId: state.quiz.id,
            userId: user.privyId,
            username: user.username,
            avatarUrl: user.avatarUrl,
            score,
            correctAnswers,
            totalQuestions: state.questions.length,
            timeSpent: 0, // TODO: Track time spent
            completedAt: Date.now()
        });

        setState(prev => ({
            ...prev,
            isFinished: true,
            result
        }));

        return result;
    };

    const resetQuiz = () => {
        setState(initialState);
    };

    return (
        <QuizContext.Provider
            value={{
                state,
                loadQuiz,
                startQuiz,
                selectAnswer,
                nextQuestion,
                previousQuestion,
                submitQuiz,
                setTimeRemaining,
                resetQuiz
            }}
        >
            {children}
        </QuizContext.Provider>
    );
}

export function useQuiz() {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
}
