import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MainChart from "./components/MainChart";
import StatusBar from "./components/StatusBar";
import Toast from "./components/Toast";

export default function App() {
  return (
    <div style={{ display: "flex", "flex-direction": "column", height: "100%" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", "min-height": 0 }}>
        <div style={{ flex: 1, "min-width": 0 }}>
          <MainChart />
        </div>
        <Sidebar />
      </div>
      <StatusBar />
      <Toast />
    </div>
  );
}
