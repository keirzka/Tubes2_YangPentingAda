import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { convertDomToTree } from "../utils/convertDomToTree";
import { useRef } from 'react';
import DOMTreeViewer from "./DOMTreeViewer";
import LogRow from "./LogRow";
import '../index.css';

// Untuk testing aja
import { dummyScrape, dummySearch } from "./dummyData"; 

export default function OutputPanel({ result }) {
  const navigate = useNavigate();
  const [domTree, setDomTree] = useState(null);
  const [maxDepth, setMaxDepth] = useState(0);
  const [hasilCari, setHasilCari] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabAktif, setTabAktif] = useState("pohon");

  // Set berisi semua id node yang MATCH
  const matchIds = new Set();
  if(hasilCari && hasilCari.results){
      for (const node of hasilCari.results) {
        matchIds.add(node.id);
      }
  }

  // Set berisi semua id node yang VISITED (dari log)
  const visitedIds = new Set();
  if(hasilCari && hasilCari.traversalLog){
      for (const node of hasilCari.traversalLog) {
        visitedIds.add(node.nodeId);
      }
  }

  const treeData = domTree ? convertDomToTree(domTree, matchIds, visitedIds) : null;

  // Download file log pencarian
  const downloadLog = () => {
    const blob = new Blob(
        [JSON.stringify(hasilCari.traversalLog, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "DOM-traversal-log.json";
      a.click();
  };

  useEffect(() => {
    if (!result) return;

    const jalankan = async () => {
      setLoading(true);
      setError(null);

      try { //Pemanggilan API Backend
        // PANGGIL ENDPOINT 1: scrape
        const responScrape = await fetch("http://localhost:3000/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputType: result.url ? "url" : "html",
            input: result.url || result.html,
          }),
        });
        const dataScrape = await responScrape.json();

        if (!responScrape.ok) {
          setError("Gagal scraping: " + (dataScrape.error || responScrape.statusText));
          setLoading(false);
          return;
        }

        setDomTree(dataScrape.domTree);
        setMaxDepth(dataScrape.maxDepth);

        // PANGGIL ENDPOINT 2: search
        const responCari = await fetch("http://localhost:3000/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domTree: dataScrape.domTree,
            algorithm: result.method.toLowerCase(),
            selector: result.selector,
            limit: result.limit === "all" ? "all" : parseInt(result.limit),
          }),
        });
        const dataCari = await responCari.json();
        
        if (!responCari.ok){
          throw new Error("Gagal mencari: " + (dataCari.error || responCari.statusText));
        }
        
        setHasilCari(dataCari);

        // // Untuk testing dengan file dummy
        // setDomTree(dummyScrape.domTree);
        // setMaxDepth(dummyScrape.maxDepth);
        // setHasilCari(dummySearch);

      } catch (err) {
        setError(err.message || "Tidak bisa terhubung ke backend.");
      }

      setLoading(false);
    };

    jalankan();
  }, [result]);


  // Penanganan Rendering
  // Loading
  if(loading) return <div>Sedang memproses...</div>

  // Error 
  if (error) return (
      <div className = "result">
          <p>{error}</p>
          <button className="button" onClick={() => navigate("/")}>Kembali</button>
      </div>
  );

  // Tidak ditemukan
  if (!domTree) return (
      <div className = "result">
          <p>Tidak ditemukan hasil pencarian</p>
          <button className="button" onClick={() => navigate("/")}>Kembali</button>
      </div>
  );

  if(!hasilCari) return null;
  
  return (    
    <div className="container">
      {/* Informasi Hasil Pencarian */}
      <label>Hasil Pencarian</label>
      <div className="result">
        <ul>
          <li>Algoritma : {result.method}</li>
          <li>Selector : {result.selector}</li>
          <li>maxDepth : {maxDepth}</li>
          <li>Node yang dikunjungi : {hasilCari.stats.nodesVisited}</li>
          <li>Waktu pencarian : {hasilCari.stats.timeMs} ms</li>
          <li>Jumlah hasil : {hasilCari.results.length}</li>
        </ul>
      </div>
      
      <label style={{ display: "block", marginTop: "20px", marginBottom: "12px"}}>Visualisasi DOM Tree</label>
      
      {/* Legenda Warna */}
      <div style={{ display: "flex", gap: "16px",  marginBottom: "12px"}}>
        {[
          { warna: "rgb(103, 221, 70)",  border: "rgb(46, 119, 25)",  teks: "Match" },
          { warna: "rgb(204, 118, 238)",  border: "rgb(115, 30, 149)", teks: "Visited" },
          { warna: "rgb(255, 255, 255)", border: "#d070ea",           teks: "Node biasa" },
        ].map((item) => (
          <div key={item.teks} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Kotak warna kecil */}
            <div style={{
              width: "16px",
              height: "16px",
              background: item.warna,
              border: `2px solid ${item.border}`,
              borderRadius: "4px",
            }} />
            {/* Teks keterangan */}
            <span>{item.teks}</span>
          </div>
        ))}
      </div>

      {/* Konten tab */}
      {tabAktif === "pohon" && treeData && (
        <DOMTreeViewer data={treeData}/>
      )}

      {/* Hasil Pencarian Node */}
      {hasilCari && hasilCari.results.length > 0 && (
        <div className="result">
          <label>Elemen yang cocok : ({hasilCari.results.length} hasil)</label>

          {hasilCari.results.map((node, index) => (
            <div className="result" key={node.id}>
              
              {/* Baris pertama: nomor, tag, id, depth */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span>#{index + 1}</span>
                <span>&lt;{node.tag}&gt;</span>
                <span>id: {node.id}</span>
                <span>depth: {node.depth}</span>
              </div>

              {/* Baris kedua: tampilkan semua attributes kalau ada */}
              {node.attributes && Object.keys(node.attributes).length > 0 && (
                <div style={{ marginTop: "6px" }}>
                  {Object.entries(node.attributes).map(([namaAttr, nilaiAttr]) => (
                    <span key={namaAttr} style={{ marginRight: "8px" }}>
                      {namaAttr}="{nilaiAttr}"
                    </span>
                  ))}
                </div>
              )}

              {/* Baris ketiga: innerText kalau ada */}
              {node.innerText && (
                <div style={{ marginTop: "6px", fontStyle: "italic" }}>
                  "{node.innerText}"
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Keterangan Log Pencarian */}
      <div className="result">
        <label style={{display: "block", marginBottom: "12px"}}>Traversal Log</label>

        {hasilCari.traversalLog.map((log) => (
          <LogRow key={log.step} entry={log} />
        ))}
      </div>

      {/* Tombol Download Log */}
      <div style={{ marginTop: "16px" }}>
        <button className="button" onClick={downloadLog}>
          Download Traversal Log
        </button>
      </div>

      {/* Tombol kembali ke page awal */}
      <div style={{ marginTop: "24px" }}>
        <button
          className="button"
          onClick={() => navigate("/")}
        >
          ← Kembali
        </button>
      </div>

    </div>
  );
}
