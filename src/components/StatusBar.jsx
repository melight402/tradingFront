export default function StatusBar() {
  return (
    <div
      style={{
        display: "flex",
        "align-items": "center",
        gap: "8px",
        padding: "4px 14px",
        "border-top": "1px solid var(--border-hair)",
        background: "var(--bg-void)",
        "flex-shrink": 0,
        "font-size": "10.5px",
        color: "var(--text-tertiary)",
      }}
    >
      <span style={{ width: "6px", height: "6px", "border-radius": "50%", background: "var(--long)", "flex-shrink": 0 }} />
      <span>Binance Futures API · публичные рыночные данные в реальном времени</span>
      <span style={{ flex: 1 }} />
      <span>ВНИМАНИЕ: Market и закрытие отправляют реальные ордера Binance Futures; Stop/Limit временно отключены</span>
    </div>
  );
}
