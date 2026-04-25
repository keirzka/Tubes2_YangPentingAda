import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../index.css'

export default function InputPanel({ onSubmit }) {
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [method, setMethod] = useState("BFS");
  const [selector, setSelector] = useState("");
  const [limitType, setLimitType] = useState("all");
  const [limitValue, setLimitValue] = useState("");
  const [inputType, setInputType] = useState("url");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    e.preventDefault(); // Mencegah reload halaman

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setHtml(event.target.result);
    };
    reader.readAsText(file);
  };

  // Error Detection
  const validate = () => {
    // reset error
    setError("");

    // Validasi URL
    if (inputType === "url") {
      if (!url.trim()) {
        setError("URL tidak boleh kosong!");
        return false;
      }

      try {
        new URL(url);
      } catch {
        setError("Format URL tidak valid!");
        return false;
      }
    }

    // Validasi File HTML
    if (inputType === "html") {
      if (!html.trim()) {
        setError("Teks HTML tidak boleh kosong!");
        return false;
      }
    }

    // Validasi Selector
    if (!selector.trim()) {
      setError("CSS Selector tidak boleh kosong!");
      return false;
    }

    // Validasi Nilai Limit
    if (limitType === "top") {
      const n = parseInt(limitValue);

      if (isNaN(n) || n <= 0) {
        setError("Limit harus angka > 0!");
        return false;
      }
    }

    return true;
  };

  // Submit untuk Proses Pencarian
  const handleSubmit = () => {
    if(!validate()) return;

    onSubmit({
      url,
      html,
      method,
      selector,
      limit: limitType === "all" ? "all" : limitValue,
    });
    
    navigate('/visualization');

  };

  return (
    <div className="container">
      <h2 className="title">Input Data</h2>

    {/* Jenis Input */}
    <div className="group">
        <label>Pilihan Jenis Input</label>
        <select
            className="input"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
        >
            <option value="url">URL</option>
            <option value="html">HTML</option>
        </select>
    </div>
        
      {/* Input URL */}
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

      {/* Input HTML */}
      {inputType === "html" && (
        <div className="group">
            <label> HTML </label>
            <textarea
            className="input"
            type="text"
            placeholder={"<html>\n......\n</html>"}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={10}
            />
        </div>
      )}

      {/* Pilihan Algoritma */}
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

      {/* Input Selector */}
      <div className="group">
        <label>CSS Selector</label>
        <input
          className="input"
          type="text"
          placeholder="Contoh: div, .class, #id"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
        />
      </div>

      {/* Pilihan Nilai Limit */}
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

      {/* Error handling */}
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* Proses Pencarian */}
      <button className="button" onClick={handleSubmit}>
        Proses
      </button>
    </div>
  );
}