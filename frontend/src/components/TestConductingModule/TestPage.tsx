import { useEffect, useState } from "react";
import "./TestPage.css";

interface Question {
  id: number;
  question: string;
  options: string[];
}


const questionsData: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Paris", "London", "Madrid", "Berlin"]
  },
  {
    id: 2,
    question: "React is used for?",
    options: ["Backend", "Frontend UI", "Network", "Database"]
  },
  {
    id: 3,
    question: "Which one is a JS library?",
    options: ["Laravel", "React", "Django", "Flask"]
  }
];



const TestPage = () => {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(questionsData.length).fill(null)
  );


  // For each test the voilation then initialize to 0 to start fresh for each test
  const [, setViolations] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);




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
  }, [started, submitted]);



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

  const submitTest = () => {
    if (submitted) return;
    setSubmitted(true);
    setToastMessage("Test Submitted!");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };



  return (
    <div className="test-wrapper">
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* ---------- TOP AREA ---------- */}
      <div className="instruction-section">
        <div>
          <h2>Test Instructions</h2>
          <p>You have <strong>2 minutes</strong> to complete the assessment.</p>
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
      {started && !submitted && (
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
        </div>
      )}
    </div>
  );
};

export default TestPage;
