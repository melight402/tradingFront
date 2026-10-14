import { Show } from "solid-js";
import { toast } from "../store/store";

const KIND_COLOR = {
  ok: "var(--long)",
  warn: "var(--warn)",
  info: "var(--accent)",
};

export default function Toast() {
  return (
    <Show when={toast()}>
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--bg-elevated)",
          border: `1px solid ${KIND_COLOR[toast().kind] || "var(--border-strong)"}`,
          color: "var(--text-primary)",
          padding: "9px 16px",
          "border-radius": "8px",
          "font-size": "12.5px",
          "box-shadow": "0 10px 30px rgba(0,0,0,0.5)",
          "z-index": 100,
        }}
      >
        {toast().text}
      </div>
    </Show>
  );
}
