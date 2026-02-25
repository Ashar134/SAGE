import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { TestPageSkeleton } from "../Skeletons/Skeletons";
import "./TestPage.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: string; // used for scoring
}

const API_BASE_URL = "http://localhost:8000"; // Django backend URL

const TestPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<(string | null)[]>([]);


  // For each test the voilation then initialize to 0 to start fresh for each test
  const [, setViolations] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch questions from API on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!isAuthenticated) {
        if (!authLoading) setLoading(false);
        return;
      }
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
  }, [isAuthenticated, authLoading]);

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



  // Show loading state or unauthenticated state with skeleton
  if (authLoading || loading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="test-wrapper">
        <TestPageSkeleton />
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
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* ---------- TOP AREA ---------- */}
      <div className="instruction-section">
        <div>
          <h2>Test Instructions</h2>
          <p>You have <strong>2 Hours</strong> to complete the assessment.</p>
          <p>This test is continuously monitored to maintain exam integrity. Any detected violation will result in a warning.</p>
          <p>If you receive three warnings, your test will be automatically submitted.</p>
          <p>To ensure a fair testing environment, actions such as text selection, copying, pasting, and switching browser tabs are disabled during the exam.</p>
        </div>


        <div className="timer-start-block">
          {/* {started && !submitted && (
            <div className="violation-badge">
              ⚠ Violations: {violations}/3
            </div>
          )} */}
          <div className="timer-display">⏱ {formatTime(timeLeft)}</div>

          {!started && !submitted && (
            <button className="btn start-btn" onClick={startTest}>
              Start Test
            </button>
          )}
        </div>
      </div>


      {/* ---------- QUESTION SECTION ---------- */}
      {started && !submitted && questionsData.length > 0 && (
        <div className="question-section">
          <h3>Question {questionsData[currentIndex].id}</h3>
          <p className="question-text">{questionsData[currentIndex].question}</p>

          <div className="options-box">
            {questionsData[currentIndex].options.map((opt, index) => (
              <label key={index} className="option-item">
                <input
                  type="radio"
                  checked={answers[currentIndex] === opt}
                  onChange={() => handleSelect(opt)}
                />
                {opt}
              </label>
            ))}
          </div>

          <div className="nav-buttons">
            <button
              className="btn nav-btn"
              disabled={currentIndex === 0}
              onClick={prevQuestion}
            >
              Previous
            </button>

            {currentIndex === questionsData.length - 1 ? (
              <button className="btn submit-btn" onClick={submitTest}>
                Submit
              </button>
            ) : (
              <button className="btn nav-btn" onClick={nextQuestion}>
                Next
              </button>
            )}
          </div>
        </div>
      )}


      {/* ---------- AFTER SUBMISSION ---------- */}
      {submitted && (
        <div className="submit-box">
          <h2>Test Submitted ✔</h2>
          <p>Your answers have been recorded.</p>
          {score !== null && (
            <p>
              Score: <strong>{score}</strong> / {questionsData.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TestPage;
