import { useState, useEffect } from "react";
import SpreadGraph from "./SpreadGraph";

const theme = {
  bg: "#F5F0E8",
  surface: "#FDFAF5",
  border: "#E5DDD0",
  text: "#1A1A1A",
  muted: "#6B6560",
  accent: "#2D2D2D",
  pill: "#EDE8DF",
  pillText: "#4A4540",
};

const LOADING_WORDS = [
  "Let bro cook...",
  "Checking the vibes...",
  "Aura check...",
  "Rizzing the algorithm...",
  "Gaslighting the algorithm...",
  "Summoning the homies...",
  "Consulting Gen Z...",
  "Collecting 'W' comments...",
  "Collecting 'bro' comments...",
  "Manifesting millions...",
  "Farming dopamine...",
  "Finding the secret sauce...",
  "Stealing attention spans...",
  "Cooking the plot twist...",
  "Borrowing braincells...",
  "Shaking the internet...",
  "Disturbing the timeline...",
  "Spawning NPC viewers...",
  "Triggering FOMO...",
  "Scanning for brainrot...",
  "Checking if it's peak...",
  "Finding main character energy...",
  "Loading plot armor...",
  "Brewing internet chaos...",
  "Summoning the Viral Oracle...",
  "Teaching the algorithm...",
  "Whispering to TikTok...",
  "Sweet-talking Instagram...",
  "Rolling viral dice...",
  "Searching for W edits...",
  "Injecting dopamine...",
  "Almost famous...",
  "Trust the process...",
  "No cap, almost done...",
  "Chat, is this viral?",
  "It's giving viral...",
  "Standing on business...",
  "Locked in...",
  "Cooked? Nah. Cooking.",
  "Touching grass... jk.",
  "Sending it to the GC...",
  "Reading the comments first...",
  "Finding the replay button...",
  "One more replay...",
  "Worth the wait..."
]; 

export default function App() {
  const [file, setFile] = useState(null);
  const [demographic, setDemographic] = useState("");
  const [personaCount, setPersonaCount] = useState(10);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loadingWord, setLoadingWord] = useState(LOADING_WORDS[0]);

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setLoadingWord(LOADING_WORDS[0]);
    const id = setInterval(() => {
      i = (i + 1) % LOADING_WORDS.length;
      setLoadingWord(LOADING_WORDS[i]);
    }, 4000);
    return () => clearInterval(id);
  }, [loading]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const runSimulation = async () => {
    if (!file || !demographic) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedPersona(null);
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("persona_count", personaCount);
      formData.append("demographic", demographic);
      const res = await fetch("/api/simulate/run", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Simulation failed"); }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Dropzone = (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput").click()}
      style={{
        border: `1.5px dashed ${dragging ? theme.accent : theme.border}`,
        borderRadius: 16, background: dragging ? "#EDE8DF" : theme.surface,
        padding: "48px 24px",
        textAlign: "center", cursor: "pointer",
        transition: "all 0.2s ease",
        height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      <input id="fileInput" type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} />
      {file ? (
        <>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🎬</div>
          <p style={{ color: theme.text, fontWeight: 500, margin: 0, wordBreak: "break-word" }}>{file.name}</p>
          <p style={{ color: theme.muted, fontSize: 13, marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 26, marginBottom: 8 }}>↑</div>
          <p style={{ color: theme.text, fontWeight: 500, margin: 0 }}>Drop your video here</p>
          <p style={{ color: theme.muted, fontSize: 13, marginTop: 4 }}>or click to browse · MP4, MOV, WebM</p>
        </>
      )}
    </div>
  );

  const Settings = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Target demographic
          </label>
          <input
            type="text"
            placeholder="e.g. Gen Z fitness enthusiasts in India"
            value={demographic}
            onChange={(e) => setDemographic(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.muted, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Persona count — <span style={{ color: theme.text }}>{personaCount}</span>
          </label>
          <input type="range" min={5} max={50} step={5} value={personaCount} onChange={(e) => setPersonaCount(Number(e.target.value))} style={{ width: "100%", accentColor: theme.accent }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: theme.muted, marginTop: 4 }}>
            <span>5</span><span>50</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Gen Z India", "Millennials US", "Fitness buffs", "Tech Twitter", "College students"].map(tag => (
          <button key={tag} onClick={() => setDemographic(tag)} style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${theme.border}`, background: demographic === tag ? theme.accent : theme.pill, color: demographic === tag ? "#FDFAF5" : theme.pillText, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s ease" }}>
            {tag}
          </button>
        ))}
      </div>

      <button
        onClick={runSimulation}
        disabled={!file || !demographic || loading}
        style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: file && demographic && !loading ? theme.accent : theme.pill, color: file && demographic && !loading ? "#FDFAF5" : theme.muted, fontSize: 15, fontWeight: 600, cursor: file && demographic && !loading ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s ease" }}
      >
        {loading ? (
          <span key={loadingWord} className="loading-word">{loadingWord}…</span>
        ) : "Run simulation →"}
      </button>

      {error && (
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "#FDF0EE", border: "1px solid #F5D0C8", color: "#A03020", fontSize: 14 }}>
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Inter', sans-serif", paddingBottom: 56 }}>
      {/* Header */}
      <div className={`page ${result ? "page--wide" : "page--narrow"}`} style={{ paddingTop: result ? 32 : 48, paddingBottom: result ? 24 : 32 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: theme.muted, textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          Virality Predictor
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: theme.text, margin: 0, lineHeight: 1.2 }}>
          Will your video go viral?
        </h1>
        <p style={{ color: theme.muted, marginTop: 8, fontSize: 15, lineHeight: 1.6, maxWidth: 560 }}>
          AI personas simulate real audience behaviour to predict reach before you post.
        </p>
      </div>

      {/* Body */}
      <div className={`page ${result ? "page--wide" : "page--narrow"}`}>
        <div className="split">
          {Dropzone}
          {Settings}
        </div>

        {result && (
          <div className="graph-row" style={{ marginTop: 24 }}>
            {/* Graph */}
            <div style={{ height: "78vh", minHeight: 520, borderRadius: 16, overflow: "hidden", border: `1px solid ${theme.border}` }}>
              <SpreadGraph waves={result.waves} onSelectPersona={setSelectedPersona} selectedId={selectedPersona?.id} />
            </div>

            {/* Persona detail */}
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 16, background: theme.surface, height: "78vh", minHeight: 520, overflowY: "auto" }}>
              {selectedPersona ? (
                <PersonaPanel persona={selectedPersona} onClose={() => setSelectedPersona(null)} />
              ) : (
                <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}></div>
                  <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Click any persona dot to see their reaction details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score section */}
        {result && (
          <div style={{ marginTop: 32 }}>

            {/* Final verdict + score ring */}
            <div style={{
              background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 16, padding: "28px 32px", marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: theme.muted, textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                  Final verdict
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 52, lineHeight: 1 }}>{result.final_virality.label.split(" ")[0]}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 26, fontWeight: 600, color: theme.text }}>
                      {result.final_virality.label.split(" ").slice(1).join(" ")}
                    </p>
                    <p style={{ margin: "4px 0 0", color: theme.muted, fontSize: 13 }}>
                      {result.total_personas_reached} personas · {result.total_waves} wave{result.total_waves > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score ring */}
              <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                {/* 4 stat pills */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Like rate", value: `${result.final_virality.like_rate}%` },
                    { label: "Comment rate", value: `${result.final_virality.comment_rate}%` },
                    { label: "Share rate", value: `${result.final_virality.share_rate}%` },
                    { label: "Avg watch", value: `${result.final_virality.avg_watch_percentage}%` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: theme.bg, borderRadius: 10, padding: "12px 16px", border: `1px solid ${theme.border}`, minWidth: 110 }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: theme.text }}>{value}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: theme.muted }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Ring */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: "50%",
                    background: `conic-gradient(${theme.accent} ${result.final_virality.score * 3.6}deg, ${theme.border} 0deg)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: theme.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: theme.text, lineHeight: 1 }}>{result.final_virality.score}</span>
                      <span style={{ fontSize: 10, color: theme.muted }}>/ 100</span>
                    </div>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: theme.muted }}>Virality score</p>
                </div>
              </div>
            </div>

            {/* Wave breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${result.waves.length}, 1fr)`, gap: 12 }}>
              {result.waves.map((wave) => (
                <div key={wave.wave} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Wave {wave.wave}</span>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: theme.muted }}>{wave.personas_shown} personas</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.text }}>{wave.score.score}</p>
                      <p style={{ margin: 0, fontSize: 11, color: theme.muted }}>{wave.score.label}</p>
                    </div>
                  </div>

                  {/* score bar */}
                  <div style={{ height: 3, borderRadius: 3, background: theme.border, marginBottom: 14 }}>
                    <div style={{ height: "100%", width: `${wave.score.score}%`, borderRadius: 3, background: theme.accent }} />
                  </div>

                  {/* stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Likes", value: `${wave.score.like_rate}%` },
                      { label: "Comments", value: `${wave.score.comment_rate}%` },
                      { label: "Shares", value: `${wave.score.share_rate}%` },
                      { label: "Watch", value: `${wave.score.avg_watch_percentage}%` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: theme.bg, borderRadius: 8, padding: "8px 10px", border: `1px solid ${theme.border}` }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: theme.text }}>{value}</p>
                        <p style={{ margin: 0, fontSize: 10, color: theme.muted, marginTop: 2 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

const DOT = {
  inTarget: "#7A9CC4",
  outTarget: "#C4956A",
};

function PersonaPanel({ persona, onClose }) {
  const r = persona.reaction;
  const color = r.in_target ? DOT.inTarget : DOT.outTarget;
  const theme = { text: "#1A1A1A", muted: "#6B6560", border: "#E5DDD0", bg: "#F5F0E8", accent: "#2D2D2D" };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Persona</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.muted, fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{persona.persona.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: theme.text, fontSize: 15 }}>{persona.persona}</p>
          <p style={{ margin: 0, color: theme.muted, fontSize: 13 }}>{persona.age} · {persona.region}</p>
        </div>
      </div>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 100, background: r.in_target ? "#E8EFF7" : "#F7EFE8", color: r.in_target ? "#4A7AAA" : "#AA7A4A", fontSize: 12, fontWeight: 500, width: "fit-content" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
        {r.in_target ? "In target" : "Out of target"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[{ label: "Liked", value: r.liked ? "✓" : "–", active: r.liked }, { label: "Commented", value: r.commented ? "✓" : "–", active: r.commented }, { label: "Shared", value: r.shared ? "✓" : "–", active: r.shared }].map(({ label, value, active }) => (
          <div key={label} style={{ background: active ? "#EDE8DF" : theme.bg, borderRadius: 8, padding: "10px 8px", textAlign: "center", border: `1px solid ${theme.border}` }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: active ? theme.text : theme.muted }}>{value}</p>
            <p style={{ margin: 0, fontSize: 10, color: theme.muted, marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: theme.muted }}>Watch time</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{r.watch_percentage}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: theme.border }}>
          <div style={{ height: "100%", width: `${r.watch_percentage}%`, borderRadius: 4, background: DOT.inTarget }} />
        </div>
      </div>

      {r.shared && r.shared_to?.length > 0 && (
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: theme.muted }}>Shared to</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {r.shared_to.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 100, background: "#EDE8DF", fontSize: 12, color: theme.accent, border: `1px solid ${theme.border}` }}>{s}</span>)}
          </div>
        </div>
      )}

      {r.comment && (
        <div style={{ background: theme.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${theme.border}` }}>
          <p style={{ margin: 0, fontSize: 12, color: theme.muted, marginBottom: 4 }}>Comment</p>
          <p style={{ margin: 0, fontSize: 13, color: theme.text, lineHeight: 1.5 }}>"{r.comment}"</p>
        </div>
      )}

      {r.reason && (
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: theme.muted }}>Reason</p>
          <p style={{ margin: 0, fontSize: 13, color: theme.text, lineHeight: 1.5 }}>{r.reason}</p>
        </div>
      )}



      
    </div>

    
  );
}