import { useState, useCallback } from "react";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

const theme = {
  bg: "#F5F0E8",
  surface: "#FDFAF5",
  border: "#E5DDD0",
  text: "#1A1A1A",
  muted: "#6B6560",
  accent: "#2D2D2D",
};

// matte, desaturated colors that sit inside the beige theme
const DOT = {
  inTarget: "#7A9CC4",   // muted steel blue
  outTarget: "#C4956A",  // muted warm amber
  notShown: "#B8B0A4",   // warm grey
};

const HANDLE_STYLE = {
  opacity: 0,
  width: 1,
  height: 1,
  minWidth: 0,
  minHeight: 0,
  border: "none",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

function PersonaNode({ data }) {
  const color = data.reaction?.in_target ? DOT.inTarget : DOT.outTarget;
  const initials = data.persona.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: color,
        border: `2.5px solid ${theme.surface}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: data.selected
          ? `0 0 0 3px ${color}, 0 2px 12px rgba(0,0,0,0.12)`
          : "0 1px 4px rgba(0,0,0,0.10)",
        transition: "box-shadow 0.15s",
      }}
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} />
      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, letterSpacing: "0.02em" }}>
        {initials}
      </span>
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} />
    </div>
  );
}

const nodeTypes = { persona: PersonaNode };

function SidePanel({ persona, onClose }) {
  if (!persona) return null;
  const r = persona.reaction;
  const color = r.in_target ? DOT.inTarget : DOT.outTarget;

  return (
    <div style={{
      width: 260,
      flexShrink: 0,
      background: theme.surface,
      borderLeft: `1px solid ${theme.border}`,
      padding: 24,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      {/* close */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Persona
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.muted, fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
      </div>

      {/* avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>
            {persona.persona.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: theme.text, fontSize: 15 }}>{persona.persona}</p>
          <p style={{ margin: 0, color: theme.muted, fontSize: 13 }}>{persona.age} · {persona.region}</p>
        </div>
      </div>

      {/* status pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 100,
        background: r.in_target ? "#E8EFF7" : "#F7EFE8",
        color: r.in_target ? "#4A7AAA" : "#AA7A4A",
        fontSize: 12, fontWeight: 500, width: "fit-content",
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
        {r.in_target ? "In target" : "Out of target"}
      </div>

      {/* stats row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
      }}>
        {[
          { label: "Liked", value: r.liked ? "✓" : "–", active: r.liked },
          { label: "Commented", value: r.commented ? "✓" : "–", active: r.commented },
          { label: "Shared", value: r.shared ? "✓" : "–", active: r.shared },
        ].map(({ label, value, active }) => (
          <div key={label} style={{
            background: active ? "#EDE8DF" : theme.bg,
            borderRadius: 8, padding: "10px 8px", textAlign: "center",
            border: `1px solid ${theme.border}`,
          }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: active ? theme.text : theme.muted }}>{value}</p>
            <p style={{ margin: 0, fontSize: 10, color: theme.muted, marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* watch */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: theme.muted }}>Watch time</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{r.watch_percentage}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: theme.border }}>
          <div style={{ height: "100%", width: `${r.watch_percentage}%`, borderRadius: 4, background: DOT.inTarget }} />
        </div>
      </div>

      {/* shared to */}
      {r.shared && r.shared_to?.length > 0 && (
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: theme.muted }}>Shared to</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {r.shared_to.map(s => (
              <span key={s} style={{
                padding: "3px 10px", borderRadius: 100,
                background: "#EDE8DF", fontSize: 12, color: theme.accent,
                border: `1px solid ${theme.border}`,
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* comment */}
      {r.comment && (
        <div style={{
          background: theme.bg, borderRadius: 10, padding: "10px 12px",
          border: `1px solid ${theme.border}`,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: theme.muted, marginBottom: 4 }}>Comment</p>
          <p style={{ margin: 0, fontSize: 13, color: theme.text, lineHeight: 1.5 }}>"{r.comment}"</p>
        </div>
      )}

      {/* reason */}
      {r.reason && (
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: theme.muted }}>Reason</p>
          <p style={{ margin: 0, fontSize: 13, color: theme.text, lineHeight: 1.5 }}>{r.reason}</p>
        </div>
      )}
    </div>
  );
}

export default function SpreadGraph({ waves, onSelectPersona, selectedId }) {
  const [activeWave, setActiveWave] = useState("all");

  if (!waves || waves.length === 0) return null;

  // stable unique id — persona names repeat within a wave, so index must be part of it
  const nodeId = (waveIdx, i) => `w${waveIdx}-n${i}`;

  const nodes = [];
  const edges = [];

  const visibleWaves = waves
    .map((wave, waveIdx) => ({ wave, waveIdx }))
    .filter(({ waveIdx }) => activeWave === "all" || activeWave === waveIdx);

  visibleWaves.forEach(({ wave, waveIdx }) => {
    (wave.reactions || []).forEach((r, i) => {
      const id = nodeId(waveIdx, i);
      nodes.push({
        id,
        type: "persona",
        position: {
          x: Number.isFinite(r.x) ? r.x : i * 90,
          y: Number.isFinite(r.y) ? r.y : waveIdx * 180,
        },
        data: { ...r, selected: selectedId === id },
      });
    });
  });

  // edges only between two waves that are both visible
  const shown = new Set(visibleWaves.map(({ waveIdx }) => waveIdx));

  visibleWaves.forEach(({ wave, waveIdx }) => {
    const nextWave = waves[waveIdx + 1];
    if (!shown.has(waveIdx + 1) || !nextWave?.reactions?.length) return;

    const reactions = wave.reactions || [];
    const linked = new Set();

    reactions.forEach((r, i) => {
      if (!r.reaction?.shared || !r.reaction.shared_to?.length) return;

      r.reaction.shared_to.forEach((target, ti) => {
        const t = String(target || "").toLowerCase();

        // prefer a persona whose region matches the share target, otherwise
        // fan out round-robin so every share still draws a line
        const byRegion = nextWave.reactions
          .map((nr, ni) => ({ nr, ni }))
          .filter(({ nr }) => {
            const region = String(nr.region || "").toLowerCase();
            return region && t && (region.includes(t) || t.includes(region));
          });

        const targets = byRegion.length
          ? byRegion
          : [{ ni: (i + ti) % nextWave.reactions.length }];

        targets.forEach(({ ni }) => {
          const targetId = nodeId(waveIdx + 1, ni);
          linked.add(targetId);
          edges.push({
            id: `share-${nodeId(waveIdx, i)}-${targetId}-${ti}`,
            source: nodeId(waveIdx, i),
            target: targetId,
            type: "straight",
            label: target,
            labelStyle: { fontSize: 9, fill: "#6B6560" },
            labelBgStyle: { fill: "#FDFAF5", fillOpacity: 0.85 },
            labelBgPadding: [3, 1],
            labelBgBorderRadius: 3,
            style: { stroke: "#C47A7A", strokeWidth: 1.2, opacity: 0.75 },
          });
        });
      });
    });

    // anyone not reached by a share was surfaced by the algorithm
    nextWave.reactions.forEach((_, ni) => {
      const targetId = nodeId(waveIdx + 1, ni);
      if (linked.has(targetId) || !reactions.length) return;
      edges.push({
        id: `algo-${waveIdx}-${ni}`,
        source: nodeId(waveIdx, ni % reactions.length),
        target: targetId,
        type: "straight",
        style: { stroke: "#C4B9AC", strokeWidth: 1, opacity: 0.6 },
        animated: true,
      });
    });
  });

  const onNodeClick = (_, node) => {
    const [w, n] = node.id.slice(1).split("-n").map(Number);
    const reaction = waves[w]?.reactions?.[n];
    if (reaction) onSelectPersona({ id: node.id, ...reaction });
  };

  const totalPersonas = waves.reduce((sum, w) => sum + (w.reactions?.length || 0), 0);

  const tabStyle = (active) => ({
    padding: "5px 14px",
    borderRadius: 100,
    border: `1px solid ${theme.border}`,
    background: active ? theme.accent : "#EDE8DF",
    color: active ? "#FDFAF5" : "#4A4540",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  });

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Wave tabs */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.surface, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => setActiveWave("all")} style={tabStyle(activeWave === "all")}>
          All waves · {totalPersonas}
        </button>
        {waves.map((wave, i) => (
          <button key={i} onClick={() => setActiveWave(i)} style={tabStyle(activeWave === i)}>
            Wave {i + 1} · {wave.reactions?.length || 0}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${theme.border}`, background: theme.surface, display: "flex", gap: 20, flexWrap: "wrap", flexShrink: 0 }}>
        {[{ color: DOT.inTarget, label: "In-target" }, { color: DOT.outTarget, label: "Out-of-target" }].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 12, color: theme.muted }}>{label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 1.5, background: "#C47A7A" }} />
          <span style={{ fontSize: 12, color: theme.muted }}>Shared directly</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 1.5, background: "#C4B9AC" }} />
          <span style={{ fontSize: 12, color: theme.muted }}>Shown by algo</span>
        </div>
      </div>

      {/* Graph */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          key={activeWave}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          defaultEdgeOptions={{ type: "straight" }}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.15}
          nodesDraggable={false}
          nodesConnectable={false}
          style={{ background: theme.bg }}
        >
          <Background color={theme.border} gap={28} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}