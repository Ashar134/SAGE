import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [searchParams] = useSearchParams();
  const jobTitle = searchParams.get('job') || 'Software Engineer';  // passed from Take Test button
  const jobId = searchParams.get('job_id') || '';  // Job UUID for fetching requirements
  const [questionsData, setQuestionsData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [loadingMessage, setLoadingMessage] = useState(0);

  const LOADING_MESSAGES = [
    '⚙️ Initializing your test...',
    '🔍 Analyzing job requirements...',
    '🤖 Generating role-specific questions...',
    `📝 Crafting ${jobTitle} scenarios...`,
    '✨ Almost there, finalizing your test...'
  ];


  // For each test the voilation then initialize to 0 to start fresh for each test
  const [, setViolations] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('error');

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Fetch questions from API on component mount
  useEffect(() => {
    const controller = new AbortController();

    const fetchQuestions = async () => {
      if (!isAuthenticated) {
        if (!authLoading) setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        // Pass job_id and candidate info to get job-specific questions
        const encodedJobTitle = encodeURIComponent(jobTitle);
        const candidateId = user?.id || 'default';
        const response = await fetch(`${API_BASE_URL}/api/generate-test/?job_title=${encodedJobTitle}&job_id=${jobId}&candidate_id=${candidateId}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.questions) {
          setQuestionsData(data.questions);
          setAnswers(Array(data.questions.length).fill(null));
          // Set time left from backend (data.time_allowed is in minutes, convert to seconds)
          if (data.time_allowed) {
            setTimeLeft(data.time_allowed * 60);
          }
        } else {
          throw new Error(data.error || "Failed to load questions");
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : "Failed to load questions");
        console.error("Error fetching questions:", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, authLoading]);

  // Cycle through loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMessage(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // CORE TEST LOGIC - Define submitTest early so it can be referenced
  const submitTest = useCallback(async () => {
    if (submitted) return;

    // Calculate score locally by comparing selected answer with correct answer
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

    try {
      showToast("Submitting your results...", 'warning');

      const response = await fetch(`${API_BASE_URL}/api/submit-test/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          job_id: jobId,
          candidate_id: user?.id,
          answers: answers,  // send full answers array for backend scoring
          score: computedScore,
          total_questions: questionsData.length
        })
      });

      const data = await response.json();

      if (data.success) {
        setScore(computedScore);
        setSubmitted(true);
        const passed = data.new_status === 'interview';
        const pct = data.percentage != null ? data.percentage.toFixed(1) : (computedScore / questionsData.length * 100).toFixed(1);
        showToast(`Test Submitted! Your score: ${pct}%`, passed ? 'success' : 'error');
      } else {
        throw new Error(data.error || "Failed to submit test");
      }
    } catch (err) {
      console.error("Submission error:", err);
      showToast(`Error submitting test: ${err instanceof Error ? err.message : "Unknown error"}`, 'error');
      // Fallback for UI if API fails (still mark as submitted locally for safety)
      setScore(computedScore);
      setSubmitted(true);
    }
  }, [submitted, questionsData, answers, jobId, user]);

  // VIOLATION COUNTING AND HANDLING
  const addViolation = (reason: string) => {
    showToast(`⚠ Warning: ${reason}`, 'warning');

    setViolations((prev) => {
      const newCount = prev + 1;

      if (newCount > 3) {
        showToast("Test auto-submitted due to multiple violations.", 'warning');
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
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="test-wrapper">
        <TestPageSkeleton />
      </div>
    );
  }

  // Show animated loading state while fetching questions
  if (loading) {
    return (
      <div className="test-wrapper">
        <div className="test-loading-state">
          <div className="test-loading-spinner"></div>
          <h2 className="test-loading-title">Preparing Your Assessment</h2>
          <p className="test-loading-message">{LOADING_MESSAGES[loadingMessage]}</p>
          <p className="test-loading-subtext">This may take up to a minute — our AI is tailoring questions just for you.</p>
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
      {toastMessage && <div className={`toast-notification toast-${toastType}`}>{toastMessage}</div>}

      {/* ---------- TOP AREA ---------- */}
      <div className="instruction-section">
        <div>
          <h2>Test Instructions</h2>
          <p>
            You have <strong>
              {timeLeft >= 3600
                ? `${Math.round(timeLeft / 3600)} Hour${Math.round(timeLeft / 3600) > 1 ? 's' : ''}`
                : `${Math.round(timeLeft / 60)} Minute${Math.round(timeLeft / 60) > 1 ? 's' : ''}`}
            </strong> to complete the assessment.
          </p>
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
        <div className={`submit-box${score !== null && (score / questionsData.length) * 100 < 40 ? ' submit-box--failed' : ''}`}>
          <h2>{score !== null && (score / questionsData.length) * 100 >= 40 ? 'Test Submitted ' : 'Test Submitted '}</h2>
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
