import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import './App.css'


function App() {
  const [result, setResult] = useState(null);

  const handleDataSubmit = (data) => {
    console.log("Data dari InputPanel:", data);
    setResult(data);
  };

  return (
    <BrowserRouter>
      <div className="h-screen w-full flex flex-col bg-[#fff5f9]">
        <h1 className="text-center font-bold" style={{ color: 'rgb(112, 26, 117)' }}>
          DOM Visualizer
          </h1>

        <Routes>
          {/* Input Page */}
          <Route 
            path="/" 
            element={<InputPanel onSubmit={handleDataSubmit} />} 
          />
          
          {/* Output Page */}
          <Route 
            path="/visualization" 
            element={<OutputPanel result={result} />}
          />
          
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App
