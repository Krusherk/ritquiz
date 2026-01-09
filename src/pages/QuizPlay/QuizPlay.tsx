import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../../contexts/QuizContext';
import { Button, Timer } from '../../components/ui';
import styles from './QuizPlay.module.css';

export function QuizPlay() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        state,
        loadQuiz,
        startQuiz,
        selectAnswer,
        nextQuestion,
        submitQuiz
    } = useQuiz();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            loadQuiz(id).finally(() => setIsLoading(false));
        }
    }, [id]);

    const handleTimeUp = () => {
        if (state.currentQuestionIndex < state.questions.length - 1) {
            nextQuestion();
        } else {
            handleSubmit();
        }
    };

    const handleAnswerSelect = (optionIndex: number) => {
        const currentQuestion = state.questions[state.currentQuestionIndex];
        selectAnswer(currentQuestion.id, optionIndex);
    };

    const handleNext = () => {
        if (state.currentQuestionIndex < state.questions.length - 1) {
            nextQuestion();
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await submitQuiz();
            navigate(`/quiz/${id}/results`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingPage}>
                <div className={styles.loader} />
                <p>Loading quiz...</p>
            </div>
        );
    }

    if (!state.quiz || state.questions.length === 0) {
        return (
            <div className={styles.errorPage}>
                <h2>Quiz not found</h2>
                <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    if (state.isFinished) {
        return (
            <div className={styles.finishedPage}>
                <h2>You've already completed this quiz!</h2>
                <div className={styles.finishedActions}>
                    <Button onClick={() => navigate(`/quiz/${id}/results`)}>View Results</Button>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    if (!state.isStarted) {
        return (
            <div className={styles.startPage}>
                <motion.div
                    className={styles.startCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h1 className={styles.quizTitle}>{state.quiz.title}</h1>
                    <p className={styles.quizDescription}>{state.quiz.description}</p>

                    <div className={styles.quizInfo}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>📝</span>
                            <span>{state.questions.length} Questions</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>⏱️</span>
                            <span>{state.quiz.timerSeconds} seconds per question</span>
                        </div>
                    </div>

                    <div className={styles.rules}>
                        <h3>Rules</h3>
                        <ul>
                            <li>Answer each question before the timer runs out</li>
                            <li>You cannot go back to previous questions</li>
                            <li>Your score is based on correct answers</li>
                        </ul>
                    </div>

                    <Button size="lg" fullWidth onClick={startQuiz}>
                        Start Quiz
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const selectedAnswer = state.answers[currentQuestion.id];
    const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

    return (
        <div className={styles.quizPage}>
            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${((state.currentQuestionIndex + 1) / state.questions.length) * 100}%` }}
                />
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.questionCount}>
                    Question {state.currentQuestionIndex + 1} of {state.questions.length}
                </div>
                <Timer
                    seconds={state.quiz.timerSeconds}
                    onComplete={handleTimeUp}
                    isActive={state.isStarted}
                    size="md"
                />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className={styles.questionContainer}
                >
                    <h2 className={styles.questionText}>{currentQuestion.text}</h2>

                    <div className={styles.optionsGrid}>
                        {currentQuestion.options.map((option, index) => (
                            <motion.button
                                key={index}
                                className={`${styles.optionButton} ${selectedAnswer === index ? styles.selected : ''}`}
                                onClick={() => handleAnswerSelect(index)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className={styles.optionLetter}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className={styles.optionText}>{option}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className={styles.footer}>
                <Button
                    onClick={handleNext}
                    disabled={selectedAnswer === undefined}
                    isLoading={isSubmitting}
                    size="lg"
                >
                    {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                </Button>
            </div>
        </div>
    );
}
