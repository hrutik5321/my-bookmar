import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import AddFolder from "./components/AddFolder";
import AddLink from "./components/AddLink";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddFolder />} />
        <Route path="/add/:id" element={<AddLink />} />
      </Routes>
    </Router>
  );
}
