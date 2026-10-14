import { activeTool, setActiveTool, selectedId, symbol, removeDrawing, clearDrawings } from "../store/store";
import { IconCursor, IconHLine, IconRay, IconTrend, IconLong, IconShort, IconTrash } from "./Icons";

const TOOLS = [
  { id: "cursor", icon: IconCursor, title: "Курсор" },
  { id: "hline", icon: IconHLine, title: "Горизонтальная линия" },
  { id: "ray", icon: IconRay, title: "Горизонтальный луч" },
  { id: "trendline", icon: IconTrend, title: "Трендлиния" },
  { id: "long", icon: IconLong, title: "Длинная позиция (Long)" },
  { id: "short", icon: IconShort, title: "Короткая позиция (Short)" },
];

export default function Toolbar() {
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "3px" }}>
      {TOOLS.map((t) => (
        <button
          onClick={() => setActiveTool(t.id)}
          title={t.title}
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            width: "28px",
            height: "28px",
            "border-radius": "6px",
            border: "1px solid transparent",
            background: activeTool() === t.id ? "var(--accent-dim)" : "transparent",
            color: activeTool() === t.id ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          <t.icon width="15" height="15" />
        </button>
      ))}
      <div style={{ width: "1px", height: "18px", background: "var(--border-hair)", margin: "0 4px" }} />
      <button
        onClick={() => selectedId() && removeDrawing(symbol(), selectedId())}
        disabled={!selectedId()}
        title="Удалить выбранный объект"
        style={{
          display: "flex",
          "align-items": "center",
          gap: "4px",
          height: "28px",
          padding: "0 8px",
          "border-radius": "6px",
          border: "1px solid var(--border-hair)",
          background: "transparent",
          color: selectedId() ? "var(--text-secondary)" : "var(--text-tertiary)",
          opacity: selectedId() ? 1 : 0.5,
        }}
      >
        <IconTrash width="13" height="13" />
        <span style={{ "font-size": "11px" }}>1</span>
      </button>
      <button
        onClick={() => clearDrawings(symbol())}
        title="Удалить все объекты на графике"
        style={{
          display: "flex",
          "align-items": "center",
          gap: "4px",
          height: "28px",
          padding: "0 8px",
          "border-radius": "6px",
          border: "1px solid var(--border-hair)",
          background: "transparent",
          color: "var(--text-secondary)",
        }}
      >
        <IconTrash width="13" height="13" />
        <span style={{ "font-size": "11px" }}>все</span>
      </button>
    </div>
  );
}
