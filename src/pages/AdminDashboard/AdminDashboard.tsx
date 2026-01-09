import { useState, useEffect } from 'react';
import { Layout } from '../../components/layout';
import { Button, Card, Input, Modal } from '../../components/ui';
import {
    getAllQuizzes,
    grantHostAccess,
    createQuiz,
    addQuestion,
    updateQuiz
} from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Quiz } from '../../types';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'quizzes' | 'hosts'>('quizzes');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    // Forms
    const [hostEmail, setHostEmail] = useState('');
    const [hostMessage, setHostMessage] = useState('');
    const [quizForm, setQuizForm] = useState({
        title: '',
        description: '',
        timerSeconds: 30
    });
    const [questionForm, setQuestionForm] = useState({
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0
    });

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await getAllQuizzes();
            setQuizzes(data);
        } catch (error) {
            console.error('Error loading quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGrantHost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await grantHostAccess(hostEmail);
            setHostMessage(success ? '✓ Host access granted!' : '✗ User not found');
            if (success) setHostEmail('');
        } catch (error) {
            setHostMessage('✗ Error granting access');
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
                creatorType: 'admin',
                isGeneral: true,
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
            await addQuestion(selectedQuiz.id, {
                text: questionForm.text,
                options: questionForm.options.filter(o => o.trim()),
                correctIndex: questionForm.correctIndex,
                order: selectedQuiz.questionCount + 1
            });

            setQuestionForm({ text: '', options: ['', '', '', ''], correctIndex: 0 });
            loadQuizzes();
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const handlePublishQuiz = async (quizId: string) => {
        await updateQuiz(quizId, { status: 'live' });
        loadQuizzes();
    };

    const generalQuizzes = quizzes.filter(q => q.isGeneral);
    const hostQuizzes = quizzes.filter(q => !q.isGeneral);

    return (
        <Layout>
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Admin Dashboard</h1>
                            <p className={styles.subtitle}>Manage quizzes and host access</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'quizzes' ? styles.active : ''}`}
                            onClick={() => setActiveTab('quizzes')}
                        >
                            Quizzes
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'hosts' ? styles.active : ''}`}
                            onClick={() => setActiveTab('hosts')}
                        >
                            Host Management
                        </button>
                    </div>

                    {activeTab === 'quizzes' ? (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>General Quizzes</h2>
                                <Button onClick={() => setShowCreateModal(true)}>+ Create Quiz</Button>
                            </div>

                            {isLoading ? (
                                <div className={styles.loading}>Loading...</div>
                            ) : (
                                <div className={styles.quizGrid}>
                                    {generalQuizzes.map((quiz) => (
                                        <Card key={quiz.id} variant="default" padding="lg">
                                            <div className={styles.quizCard}>
                                                <span className={`${styles.status} ${styles[quiz.status]}`}>{quiz.status}</span>
                                                <h3>{quiz.title}</h3>
                                                <p>{quiz.questionCount} questions</p>
                                                <div className={styles.actions}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => { setSelectedQuiz(quiz); setShowQuestionModal(true); }}
                                                    >
                                                        Add Questions
                                                    </Button>
                                                    {quiz.status === 'draft' && quiz.questionCount > 0 && (
                                                        <Button size="sm" onClick={() => handlePublishQuiz(quiz.id)}>
                                                            Publish
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className={styles.sectionHeader}>
                                <h2>Host Quizzes</h2>
                            </div>
                            <div className={styles.quizGrid}>
                                {hostQuizzes.map((quiz) => (
                                    <Card key={quiz.id} variant="glass" padding="md">
                                        <div className={styles.quizCard}>
                                            <span className={`${styles.status} ${styles[quiz.status]}`}>{quiz.status}</span>
                                            <h3>{quiz.title}</h3>
                                            <p>by {quiz.creatorUsername} · {quiz.questionCount} questions</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Card variant="default" padding="lg">
                            <h2 className={styles.cardTitle}>Grant Host Access</h2>
                            <p className={styles.cardText}>Enter the email address of a user to grant them host privileges.</p>

                            <form onSubmit={handleGrantHost} className={styles.hostForm}>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={hostEmail}
                                    onChange={(e) => setHostEmail(e.target.value)}
                                    required
                                />
                                <Button type="submit">Grant Access</Button>
                            </form>

                            {hostMessage && (
                                <p className={`${styles.message} ${hostMessage.includes('✓') ? styles.success : styles.error}`}>
                                    {hostMessage}
                                </p>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Create Quiz Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create General Quiz">
                <form onSubmit={handleCreateQuiz} className={styles.form}>
                    <Input label="Title" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                    <Input label="Description" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} required />
                    <Input label="Timer (seconds)" type="number" min="10" max="120" value={quizForm.timerSeconds} onChange={(e) => setQuizForm({ ...quizForm, timerSeconds: parseInt(e.target.value) })} required />
                    <Button type="submit" fullWidth>Create Quiz</Button>
                </form>
            </Modal>

            {/* Add Question Modal */}
            <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title={`Add Question: ${selectedQuiz?.title}`} size="lg">
                <form onSubmit={handleAddQuestion} className={styles.form}>
                    <Input label="Question" value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} required />
                    <div className={styles.optionsGrid}>
                        {questionForm.options.map((opt, i) => (
                            <div key={i} className={styles.optionRow}>
                                <input type="radio" name="correct" checked={questionForm.correctIndex === i} onChange={() => setQuestionForm({ ...questionForm, correctIndex: i })} />
                                <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => { const opts = [...questionForm.options]; opts[i] = e.target.value; setQuestionForm({ ...questionForm, options: opts }); }} required={i < 2} />
                            </div>
                        ))}
                    </div>
                    <div className={styles.formActions}>
                        <Button type="submit">Add Question</Button>
                        <Button type="button" variant="secondary" onClick={() => setShowQuestionModal(false)}>Done</Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
