import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/layout';
import { Button, Card, Input, Modal } from '../../components/ui';
import {
    createQuiz,
    getQuizzesByCreator,
    addQuestion,
    getQuestions,
    updateQuiz
} from '../../services/firebase';
import type { Quiz } from '../../types';
import styles from './HostDashboard.module.css';

export function HostDashboard() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    // Create quiz form
    const [quizForm, setQuizForm] = useState({
        title: '',
        description: '',
        timerSeconds: 30
    });

    // Question form
    const [questionForm, setQuestionForm] = useState({
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0
    });

    useEffect(() => {
        if (user) {
            loadQuizzes();
        }
    }, [user]);

    const loadQuizzes = async () => {
        if (!user) return;
        try {
            const data = await getQuizzesByCreator(user.privyId);
            setQuizzes(data);
        } catch (error) {
            console.error('Error loading quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const newQuiz = await createQuiz({
                title: quizForm.title,
                description: quizForm.description,
                creatorId: user.privyId,
                creatorUsername: user.username,
                creatorType: 'host',
                isGeneral: false,
                status: 'draft',
                timerSeconds: quizForm.timerSeconds,
                scheduledAt: null,
                createdAt: Date.now(),
                questionCount: 0
            });

            setQuizzes([...quizzes, newQuiz]);
            setShowCreateModal(false);
            setQuizForm({ title: '', description: '', timerSeconds: 30 });
            setSelectedQuiz(newQuiz);
            setShowQuestionModal(true);
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuiz) return;

        try {
            const questions = await getQuestions(selectedQuiz.id);

            await addQuestion(selectedQuiz.id, {
                text: questionForm.text,
                options: questionForm.options.filter(o => o.trim()),
                correctIndex: questionForm.correctIndex,
                order: questions.length + 1
            });

            // Reset form for next question
            setQuestionForm({
                text: '',
                options: ['', '', '', ''],
                correctIndex: 0
            });

            // Reload quizzes to update count
            loadQuizzes();
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const handlePublishQuiz = async (quizId: string) => {
        try {
            await updateQuiz(quizId, { status: 'live' });
            loadQuizzes();
        } catch (error) {
            console.error('Error publishing quiz:', error);
        }
    };

    return (
        <Layout>
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Host Dashboard</h1>
                            <p className={styles.subtitle}>Create and manage your quizzes</p>
                        </div>
                        <Button onClick={() => setShowCreateModal(true)}>
                            + Create Quiz
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className={styles.loading}>Loading...</div>
                    ) : quizzes.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h3>No quizzes yet</h3>
                            <p>Create your first quiz to get started!</p>
                            <Button onClick={() => setShowCreateModal(true)}>Create Quiz</Button>
                        </div>
                    ) : (
                        <div className={styles.quizGrid}>
                            {quizzes.map((quiz) => (
                                <Card key={quiz.id} variant="default" padding="lg">
                                    <div className={styles.quizCard}>
                                        <div className={styles.quizHeader}>
                                            <span className={`${styles.status} ${styles[quiz.status]}`}>
                                                {quiz.status}
                                            </span>
                                        </div>
                                        <h3 className={styles.quizTitle}>{quiz.title}</h3>
                                        <p className={styles.quizMeta}>
                                            {quiz.questionCount} questions · {quiz.timerSeconds}s timer
                                        </p>
                                        <div className={styles.quizActions}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedQuiz(quiz);
                                                    setShowQuestionModal(true);
                                                }}
                                            >
                                                Add Questions
                                            </Button>
                                            {quiz.status === 'draft' && quiz.questionCount > 0 && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePublishQuiz(quiz.id)}
                                                >
                                                    Publish
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Quiz Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Quiz"
            >
                <form onSubmit={handleCreateQuiz} className={styles.form}>
                    <Input
                        label="Quiz Title"
                        placeholder="Enter quiz title"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        placeholder="What is this quiz about?"
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        required
                    />
                    <Input
                        label="Timer (seconds per question)"
                        type="number"
                        min="10"
                        max="120"
                        value={quizForm.timerSeconds}
                        onChange={(e) => setQuizForm({ ...quizForm, timerSeconds: parseInt(e.target.value) })}
                        required
                    />
                    <Button type="submit" fullWidth>
                        Create Quiz
                    </Button>
                </form>
            </Modal>

            {/* Add Question Modal */}
            <Modal
                isOpen={showQuestionModal}
                onClose={() => setShowQuestionModal(false)}
                title={`Add Question to: ${selectedQuiz?.title}`}
                size="lg"
            >
                <form onSubmit={handleAddQuestion} className={styles.form}>
                    <Input
                        label="Question"
                        placeholder="Enter your question"
                        value={questionForm.text}
                        onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                        required
                    />

                    <div className={styles.optionsSection}>
                        <label className={styles.label}>Answer Options</label>
                        {questionForm.options.map((option, index) => (
                            <div key={index} className={styles.optionRow}>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={questionForm.correctIndex === index}
                                    onChange={() => setQuestionForm({ ...questionForm, correctIndex: index })}
                                    className={styles.radio}
                                />
                                <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...questionForm.options];
                                        newOptions[index] = e.target.value;
                                        setQuestionForm({ ...questionForm, options: newOptions });
                                    }}
                                    required={index < 2}
                                />
                            </div>
                        ))}
                        <p className={styles.hint}>Select the correct answer with the radio button</p>
                    </div>

                    <div className={styles.formActions}>
                        <Button type="submit">
                            Add Question
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowQuestionModal(false)}
                        >
                            Done
                        </Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
