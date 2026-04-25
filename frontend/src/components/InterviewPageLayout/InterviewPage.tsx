import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./InterviewPage.css";

const API_BASE_URL = "http://localhost:8000";

// Extend Window type for SpeechRecognition (browser API)
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface TranscriptEntry {
  question: string;
  answer: string;
}

type InterviewState =
  | "loading"
  | "intro"
  | "speaking"
  | "recording"
  | "transcribing"
  | "next"
  | "submitting"
  | "done"
  | "error";

const InterviewPage = () => {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get("application_id") || "";

  const [state, setState] = useState<InterviewState>("loading");
  const [questions, setQuestions] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [liveTranscript, setLiveTranscript] = useState(""); // real-time interim text
  const [errorMsg, setErrorMsg] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mixedDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const liveTranscriptRef = useRef(""); // track latest live text for use in stopRecording
  const isRecordingRef = useRef(false); // track recording state for silence detection

  // ── Camera setup ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      // videoRef may not be mounted yet — attaching is handled by the effect below
    } catch {
      // Camera permission denied — continue without video
    }
  }, []);

  // Attach stream to video element once when both are ready
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [state]); // only re-check when state changes (e.g. after intro mounts the video)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMicMuted; });
    setIsMicMuted(prev => !prev);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
    setIsCamOff(prev => !prev);
  };

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (interviewStarted) {
      timerRef.current = setInterval(() => setElapsedTime(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [interviewStarted]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Fetch questions ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!applicationId) { setErrorMsg("No application ID provided."); setState("error"); return; }
    if (!accessToken) { setErrorMsg("You are not logged in."); setState("error"); return; }

    fetch(`${API_BASE_URL}/api/interview/questions/?application_id=${applicationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions);
          setJobTitle(data.job_title);
          startCamera().then(() => setState("intro"));
        } else {
          setErrorMsg(data.error || "Failed to load interview.");
          setState("error");
        }
      })
      .catch(() => { setErrorMsg("Network error. Please try again."); setState("error"); });
  }, [applicationId, accessToken, authLoading]);

  // ── Play TTS question ─────────────────────────────────────────────────────
  const playQuestion = async (index: number) => {
    setState("speaking");
    try {
      const res = await fetch(`${API_BASE_URL}/api/interview/tts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ text: questions[index] })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      // Route TTS audio through the Web Audio mixer so it's captured in the recording
      if (audioContextRef.current && mixedDestRef.current) {
        try {
          const ttsSource = audioContextRef.current.createMediaElementSource(audio);
          ttsSource.connect(mixedDestRef.current);
          ttsSource.connect(audioContextRef.current.destination); // also play to speakers
        } catch {
          // If already connected, just play normally
        }
      }

      audio.onended = () => setState("recording");
      audio.play();
    } catch {
      setState("recording");
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    // Request fullscreen for immersive interview experience
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    // Set up Web Audio mixer to capture both mic + TTS audio in the recording
    if (streamRef.current) {
      try {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const dest = ctx.createMediaStreamDestination();
        mixedDestRef.current = dest;

        // Connect microphone audio to mixer
        const micSource = ctx.createMediaStreamSource(streamRef.current);
        micSource.connect(dest);

        // Build mixed video stream: video from camera + mixed audio
        const videoTrack = streamRef.current.getVideoTracks()[0];
        const mixedStream = new MediaStream([
          ...(videoTrack ? [videoTrack] : []),
          ...dest.stream.getAudioTracks(),
        ]);

        videoChunksRef.current = [];
        const videoRecorder = new MediaRecorder(mixedStream);
        videoRecorderRef.current = videoRecorder;
        videoRecorder.ondataavailable = e => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
        videoRecorder.start(1000);
      } catch {
        // Fallback: record camera stream directly if Web Audio API fails
        videoChunksRef.current = [];
        const videoRecorder = new MediaRecorder(streamRef.current);
        videoRecorderRef.current = videoRecorder;
        videoRecorder.ondataavailable = e => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
        videoRecorder.start(1000);
      }
    }
    playQuestion(0);
  };

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = async () => {
    audioChunksRef.current = [];
    liveTranscriptRef.current = "";
    setLiveTranscript("");
    isRecordingRef.current = true;

    try {
      // Always use a fresh dedicated audio stream — more reliable than sharing camera tracks
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 }
      });
      // Pick best supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const recorder = mimeType
        ? new MediaRecorder(audioStream, { mimeType })
        : new MediaRecorder(audioStream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(250);
    } catch {
      setState("error");
      setErrorMsg("Microphone access denied.");
      isRecordingRef.current = false;
      return;
    }

    // ── Start Web Speech API for real-time transcription ──────────────────
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalText = "";
      let lastSpeechTime = Date.now();
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;

      // Function to start/reset silence timer
      const resetSilenceTimer = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        lastSpeechTime = Date.now();
        
        silenceTimer = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTime;
          console.log('[Silence Detection] 5 seconds of silence, stopping. Time since last speech:', timeSinceLastSpeech);
          if (isRecordingRef.current) {
            handleStopRecording();
          }
        }, 5000);
      };

      // Start silence timer immediately (handles case where user doesn't speak at all)
      resetSilenceTimer();

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Reset silence timer on any speech activity
        resetSilenceTimer();

        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + " ";
            console.log('[Speech] Final result:', result[0].transcript);
          } else {
            interim += result[0].transcript;
          }
        }
        const combined = (finalText + interim).trim();
        liveTranscriptRef.current = finalText.trim();
        setLiveTranscript(combined);
      };

      recognition.onspeechend = () => {
        // Speech has ended, start the 5-second countdown
        console.log('[Speech] Speech ended, starting 5s countdown');
        resetSilenceTimer();
      };

      recognition.onerror = () => {
        // Silently ignore errors
      };

      recognition.onend = () => {
        // Clean up silence timer
        if (silenceTimer) clearTimeout(silenceTimer);
        
        // Auto-restart if still recording (recognition times out after ~60s of silence)
        if (isRecordingRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          try { 
            recognition.start();
            // Restart silence timer when recognition restarts
            resetSilenceTimer();
          } catch { /* already started */ }
        }
      };

      try {
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch {
        speechRecognitionRef.current = null;
      }
    }
  };

  const stopRecording = () => new Promise<Blob>(resolve => {
    isRecordingRef.current = false;

    // Stop Web Speech API (this will also clean up the silence timer via onend)
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch { /* ignore */ }
      speechRecognitionRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder) { resolve(new Blob()); return; }
    recorder.onstop = () => {
      recorder.stream.getTracks().forEach(t => t.stop());
      resolve(new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" }));
    };
    recorder.stop();
  });

  const handleStopRecording = async () => {
    // Use only the live transcript — no Whisper call
    const finalAnswer = liveTranscriptRef.current.trim();

    // Stop recording
    await stopRecording();

    // Auto-confirm and move to next question
    const updated = [...transcript, { question: questions[currentIndex], answer: finalAnswer }];
    setTranscript(updated);
    setLiveTranscript("");
    liveTranscriptRef.current = "";
    const next = currentIndex + 1;
    if (next < questions.length) {
      setCurrentIndex(next);
      playQuestion(next);
    } else {
      submitInterview(updated);
    }
  };

  useEffect(() => {
    if (state === "recording") startRecording();
  }, [state]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitInterview = async (finalTranscript: TranscriptEntry[]) => {
    setState("submitting");
    stopCamera();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    // Close Web Audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop video recording
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/interview/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ application_id: applicationId, transcript: finalTranscript })
      });
      const data = await res.json();
      if (data.success) {
        setState("done");
        // Upload video for confidence analysis in background
        uploadVideo();
      } else {
        setErrorMsg(data.error || "Submission failed.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error during submission.");
      setState("error");
    }
  };

  const uploadVideo = async () => {
    if (videoChunksRef.current.length === 0) return;
    const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append("video", videoBlob, "interview.webm");
    formData.append("application_id", applicationId);
    try {
      await fetch(`${API_BASE_URL}/api/interview/upload-video/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
    } catch {
      // Silent fail — confidence scoring is non-blocking
    }
  };

  const handleLeave = () => {
    stopCamera();
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    navigate(-1);
  };

  // ── Status label ──────────────────────────────────────────────────────────
  const getStatusLabel = () => {
    if (state === "intro") return "Ready to start";
    if (state === "speaking") return "Interviewer speaking...";
    if (state === "recording") return "🔴 Recording";
    if (state === "transcribing") return "Processing...";
    if (state === "next") return "Review your answer";
    if (state === "submitting") return "Submitting...";
    return "";
  };

  // ── Special screens ───────────────────────────────────────────────────────
  if (state === "loading") return (
    <div className="meet-loading">
      <div className="meet-spinner" />
      <p>Preparing your interview...</p>
    </div>
  );

  if (state === "error") return (
    <div className="meet-loading">
      <div className="meet-error-icon">⚠</div>
      <h3>Error</h3>
      <p>{errorMsg}</p>
      <button className="meet-btn meet-btn-red" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (state === "done") return (
    <div className="meet-loading">
      <div className="meet-done-icon">✓</div>
      <h3>Interview Complete</h3>
      <p>Thank you, <strong>{user?.first_name || "Candidate"}</strong>.</p>
      <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>HR will review your application and get back to you.</p>
      <button className="meet-btn meet-btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/application")}>
        View My Applications
      </button>
    </div>
  );

  if (state === "submitting") return (
    <div className="meet-loading">
      <div className="meet-spinner" />
      <p>Evaluating your responses...</p>
      <p style={{ color: "#94a3b8", fontSize: 13 }}>This may take a moment.</p>
    </div>
  );

  // ── Main interview UI ─────────────────────────────────────────────────────
  return (
    <div className="meet-root">

      {/* ── Top bar ── */}
      <div className="meet-topbar">
        <div className="meet-topbar-left">
          <span className="meet-job-title">{jobTitle} — AI Interview</span>
          {interviewStarted && <span className="meet-timer">{formatTime(elapsedTime)}</span>}
        </div>
        <div className="meet-topbar-right">
          <span className={`meet-status-pill ${state === "recording" ? "pill-recording" : state === "speaking" ? "pill-speaking" : "pill-idle"}`}>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="meet-body">

        {/* ── Video area (center) ── */}
        <div className="meet-video-area">

          {/* Candidate tile — fills the area */}
          <div className="meet-tile meet-tile-self">
            <video
              ref={(el) => {
                if (el && el !== videoRef.current) {
                  videoRef.current = el;
                  if (streamRef.current) el.srcObject = streamRef.current;
                }
              }}
              autoPlay
              muted
              playsInline
              className={`meet-video ${isCamOff ? "hidden" : ""}`}
            />
            {isCamOff && (
              <div className="meet-cam-off">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="23" y1="1" x2="1" y2="23" />
                </svg>
              </div>
            )}
            <span className="meet-tile-label">You</span>
            {state === "recording" && <div className="meet-rec-badge">● REC</div>}
          </div>

          {/* Bot tile — PiP bottom right */}
          <div className="meet-tile meet-tile-bot">
            <div className="meet-bot-avatar">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#6366f1" />
                <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 7a7 7 0 0 1 14 0H5z" fill="white" />
              </svg>
            </div>
            <span className="meet-tile-label">SAGE Interviewer</span>
            {state === "speaking" && (
              <div className="meet-speaking-indicator">
                <span /><span /><span /><span />
              </div>
            )}
          </div>

        </div>

        {/* ── Right panel ── */}
        <div className="meet-panel">
          <div className="meet-panel-header">
            <span>Interview Progress</span>
            <span className="meet-panel-counter">{Math.min(currentIndex + 1, questions.length)} / {questions.length}</span>
          </div>

          {/* Progress bar */}
          <div className="meet-panel-progress">
            <div className="meet-panel-progress-fill" style={{ width: `${(currentIndex / questions.length) * 100}%` }} />
          </div>

          {/* Current question — only show after interview has started */}
          {questions.length > 0 && state !== "intro" && (
            <div className="meet-panel-section">
              <p className="meet-panel-label">Current Question</p>
              <div className="meet-question-box">
                <p>{questions[currentIndex]}</p>
              </div>
            </div>
          )}

          {/* Transcription */}
          <div className="meet-panel-section meet-panel-transcript-section">
            <p className="meet-panel-label">
              {state === "recording" ? "🔴 Listening..." : "Your Answer"}
            </p>
            <div className={`meet-transcript-box ${state === "recording" ? "active" : ""}`}>
              {state === "recording" && (
                <>
                  <div className="meet-wave">
                    <span /><span /><span /><span /><span />
                  </div>
                  {liveTranscript ? (
                    <p className="meet-live-text">{liveTranscript}<span className="meet-cursor">|</span></p>
                  ) : (
                    <p style={{ color: "#64748b", fontStyle: "italic", marginTop: 8 }}>Listening for your answer...</p>
                  )}
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                    Auto-advances after 5s of silence
                  </p>
                </>
              )}
              {(state === "intro" || state === "speaking") && (
                <p style={{ color: "#64748b", fontStyle: "italic" }}>Your answer will appear here...</p>
              )}
              {/* Past answers */}
              {transcript.length > 0 && (
                <div className="meet-past-answers">
                  {transcript.map((t, i) => (
                    <div key={i} className="meet-past-entry">
                      <p className="meet-past-q">Q{i + 1}: {t.question.slice(0, 60)}...</p>
                      <p className="meet-past-a">{t.answer || "No answer"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="meet-panel-action">
            {state === "intro" && (
              <button className="meet-btn meet-btn-primary meet-btn-full" onClick={startInterview}>
                ▶ Start Interview
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="meet-controls">
        <button className={`meet-ctrl-btn ${isMicMuted ? "ctrl-off" : ""}`} onClick={toggleMic} title={isMicMuted ? "Unmute" : "Mute"}>
          {isMicMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          <span>{isMicMuted ? "Unmute" : "Mute"}</span>
        </button>

        <button className={`meet-ctrl-btn ${isCamOff ? "ctrl-off" : ""}`} onClick={toggleCam} title={isCamOff ? "Start camera" : "Stop camera"}>
          {isCamOff ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
              <path d="M23 7l-7 5 7 5V7z" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          )}
          <span>{isCamOff ? "Start Cam" : "Stop Cam"}</span>
        </button>

        <button className="meet-ctrl-btn ctrl-leave" onClick={handleLeave} title="Leave">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;
