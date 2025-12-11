import { useEffect, useState, useCallback, useMemo } from "react";
import "./TestPage.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: string; // used for scoring
  questionType?: string; // Category/subject from backend (e.g., "Analytical", "English", "OOP", "Data Structures")
}

const API_BASE_URL = "http://localhost:8000"; // Django backend URL
const TEST_DURATION_SECONDS = 7200; // 2 hours default

// --- Small UI components ---
const Toast = ({ message }: { message: string }) => (
  <div className="toast-notification">{message}</div>
);

type InstructionDialogProps = {
  agreed: boolean;
  onAgreeChange: (value: boolean) => void;
  onStart: () => void;
  disabled: boolean;
};

const InstructionDialog = ({
  agreed,
  onAgreeChange,
  onStart,
  disabled,
}: InstructionDialogProps) => (
  <div className="instruction-overlay">
    <div className="instruction-modal">
      <h2>Test Instructions</h2>
      <ul className="instruction-list">
        <li>You have <strong>2 Hours</strong> to complete the assessment.</li>
        <li>Three violations will auto-submit the test.</li>
        <li>Tab switch, window resize, paste, and text selection are restricted.</li>
        <li>Ensure a stable connection before you start.</li>
      </ul>
      <label className="agree-row">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
        />
        <span>I agree to the test terms and will follow the instructions.</span>
      </label>
      <button
        className={`btn start-btn ${disabled ? "btn-disabled" : ""}`}
        onClick={onStart}
        disabled={disabled}
      >
        Start Test
      </button>
    </div>
  </div>
);

type QuestionPanelProps = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  typeLabel: string | null;
  selectedAnswer: string | null;
  onSelect: (opt: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLast: boolean;
  isFirst: boolean;
};

const QuestionPanel = ({
  question,
  questionNumber,
  totalQuestions,
  typeLabel,
  selectedAnswer,
  onSelect,
  onPrev,
  onNext,
  onSubmit,
  isLast,
  isFirst,
}: QuestionPanelProps) => (
  <div className="question-section">
    <h3>
      Question {questionNumber} / {totalQuestions}
    </h3>
    {typeLabel && <span className="type-badge">{typeLabel}</span>}
    <p className="question-text">{question.question}</p>

    <div className="options-box">
      {question.options.map((opt, index) => (
        <label key={index} className="option-item">
          <input
            type="radio"
            checked={selectedAnswer === opt}
            onChange={() => onSelect(opt)}
          />
          {opt}
        </label>
      ))}
    </div>

    <div className="nav-buttons">
      <button className="btn nav-btn" disabled={isFirst} onClick={onPrev}>
        Previous
      </button>

      {isLast ? (
        <button className="btn submit-btn" onClick={onSubmit}>
          Submit
        </button>
      ) : (
        <button className="btn nav-btn" onClick={onNext}>
          Next
        </button>
      )}
    </div>
  </div>
);

const ResultPanel = ({ score, totalQuestions }: { score: number | null; totalQuestions: number }) => (
  <div className="submit-box">
    <h2>Test Submitted ✔</h2>
    <p>Your answers have been recorded.</p>
    {score !== null && (
      <p>
        Score: <strong>{score}</strong> / {totalQuestions}
      </p>
    )}
  </div>
);

const TestPage = () => {
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<(string | null)[]>([]);


  // For each test the voilation then initialize to 0 to start fresh for each test
  const [, setViolations] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Fetch questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, generate CS test (as requested)
        const response = await fetch(`${API_BASE_URL}/api/generate-test/?expertise=cs`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.questions) {
          setQuestionsData(data.questions);
          setAnswers(Array(data.questions.length).fill(null));
        } else {
          throw new Error(data.error || "Failed to load questions");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions");
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // CORE TEST LOGIC - Define submitTest early so it can be referenced
  const submitTest = useCallback(() => {
    if (submitted) return;

    // Calculate score by comparing selected answer with correct answer
    let computedScore = 0;
    questionsData.forEach((q, idx) => {
      const userAns = answers[idx];
      const correct = q.correctAnswer;
      if (
        userAns &&
        correct &&
        userAns.toString().trim().toLowerCase() ===
          correct.toString().trim().toLowerCase()
      ) {
        computedScore += 1;
      }
    });

    setScore(computedScore);
    setSubmitted(true);
    setToastMessage(`Test Submitted! Score: ${computedScore}/${questionsData.length}`);
  }, [submitted, questionsData, answers]);

  // VIOLATION COUNTING AND HANDLING
  const addViolation = (reason: string) => {
    setToastMessage(`⚠ Warning: ${reason}`);

    setViolations((prev) => {
      const newCount = prev + 1;

      if (newCount > 3) {
        setToastMessage("Test auto-submitted due to multiple violations.");
        submitTest();
      }

      return newCount;
    });
  };




  // TIMER LOGIC


  useEffect(() => {
    if (!started || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, submitted, submitTest]);



  // IF THE  USER TRY TO SWITCH  THE TAB 

  useEffect(() => {
    if (!started || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation("Switched tab or minimized browser");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [started, submitted]);



  // WHENEVER USER TRY TO MINIMIZE OR RESIZE THE WINDOW TOO SMALL

  useEffect(() => {
    if (!started || submitted) return;

    const handleResize = () => {
      if (window.innerWidth < 700 || window.innerHeight < 400) {
        addViolation("Window resized too small (possible minimizing)");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [started, submitted]);


  // Ctrl+V PASTE 

  useEffect(() => {
    if (!started || submitted) return;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("Paste attempt detected");
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [started, submitted]);



  // DISABLE TEXT SELECTION 


  useEffect(() => {
    if (!started || submitted) return;

    const blockSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("selectstart", blockSelection);

    return () => {
      document.removeEventListener("selectstart", blockSelection);
    };
  }, [started, submitted]);



  // CORE TEST LOGIC
  const startTest = () => {
    if (!agreed) {
      setToastMessage("Please agree to the terms to start the test.");
      return;
    }
    // reset violation count
    setViolations(0);
    setScore(null);
    setStarted(true);
  };

  const handleSelect = (option: string) => {
    const updated = [...answers];
    updated[currentIndex] = option;
    setAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentIndex < questionsData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const timerLabel = useMemo(() => `⏱ ${formatTime(timeLeft)}`, [timeLeft]);

  const currentType = useMemo(() => {
    const q = questionsData[currentIndex];
    if (!q) return null;
    // Use questionType from backend (calculated based on test composition)
    return q.questionType || null;
  }, [questionsData, currentIndex]);



  // Show loading state
  if (loading) {
    return (
      <div className="test-wrapper">
        <div className="instruction-section">
          <h2>Loading Test...</h2>
          <p>Please wait while we prepare your test questions.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="test-wrapper">
        <div className="instruction-section">
          <h2>Error Loading Test</h2>
          <p style={{ color: "red" }}>{error}</p>
          <button 
            className="btn start-btn" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no questions loaded
  if (questionsData.length === 0) {
    return (
      <div className="test-wrapper">
        <div className="instruction-section">
          <h2>No Questions Available</h2>
          <p>Unable to load test questions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-wrapper">
      {toastMessage && <Toast message={toastMessage} />}

      {/* Instructions overlay only before start */}
      {!started && !submitted && (
        <InstructionDialog
          onStart={startTest}
          disabled={!agreed}
          agreed={agreed}
          onAgreeChange={setAgreed}
        />
      )}

      {/* Header & timer */}
      <div className="instruction-section">
        <div>
          <h2>{currentType || "Test"}</h2>
          <p>This assessment is monitored for integrity.</p>
        </div>

        <div className="timer-start-block">
          <div className="timer-display">{timerLabel}</div>
          {!started && !submitted && (
            <button className="btn start-btn" onClick={startTest} disabled={!agreed}>
              Start Test
            </button>
          )}
        </div>
      </div>

      {/* Question Panel */}
      {started && !submitted && questionsData.length > 0 && (
        <QuestionPanel
          question={questionsData[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questionsData.length}
          typeLabel={currentType}
          selectedAnswer={answers[currentIndex]}
          onSelect={handleSelect}
          onPrev={prevQuestion}
          onNext={nextQuestion}
          onSubmit={submitTest}
          isLast={currentIndex === questionsData.length - 1}
          isFirst={currentIndex === 0}
        />
      )}

      {/* Results */}
      {submitted && (
        <ResultPanel score={score} totalQuestions={questionsData.length} />
      )}
    </div>
  );
};

export default TestPage;
