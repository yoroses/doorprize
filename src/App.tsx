import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import AdminPage from "./AdminPage";
import "./App.css";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </HashRouter>
  );
}
