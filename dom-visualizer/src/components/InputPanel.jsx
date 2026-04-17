import { useState } from "react";
import "./InputPanel.css";

export default function InputPanel({ onSubmit }) {
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [method, setMethod] = useState("BFS");
  const [selector, setSelector] = useState("");
  const [limitType, setLimitType] = useState("all");
  const [limitValue, setLimitValue] = useState("");
  const [inputType, setInputType] = useState("url");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setHtml(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    onSubmit({
      url,
      html,
      method,
      selector,
      limit: limitType === "all" ? "all" : limitValue,
    });
  };

  return (
    <div className="container">
      <h2 className="title">Input Data</h2>

    <div className="group">
        <label>Pilihan Jenis Input</label>
        <select
            className="input"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
        >
            <option value="url">URL</option>
            <option value="file">File HTML</option>
        </select>
    </div>
        
      {/* URL */}
      {inputType === "url" && (
        <div className="group">
            <label>URL Website</label>
            <input
            className="input"
            type="text"
            placeholder="https://....."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            />
        </div>
      )}

      {/* FILE */}
      {inputType === "file" && (
        <div className="group">
            <label>Upload HTML File</label>
            <input
            className="file-input"
            type="file"
            accept=".html"
            onChange={handleFileChange}
            />
        </div>
      )}

      {/* METHOD */}
      <div className="group">
        <label>Pilihan Algoritma</label>
        <select
          className="input"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="BFS">Breadth First Search (BFS)</option>
          <option value="DFS">Depth First Search (DFS)</option>
        </select>
      </div>

      {/* SELECTOR */}
      <div className="group">
        <label>CSS Selector</label>
        <input
          className="input"
          type="text"
          placeholder="Example: div, .class, #id"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
        />
      </div>

      {/* LIMIT */}
      <div className="group">
        <label>Jumlah Hasil</label>
        <select
          className="input"
          value={limitType}
          onChange={(e) => setLimitType(e.target.value)}
        >
          <option value="all">Semua</option>
          <option value="top">Top N</option>
        </select>

        {limitType === "top" && (
          <input
            className="input"
            type="text"
            placeholder="Masukkan jumlah hasil..."
            value={limitValue}
            onChange={(e) => setLimitValue(e.target.value)}
          />
        )}
      </div>

      <button className="button" onClick={handleSubmit}>
        Proses
      </button>
    </div>
  );
}