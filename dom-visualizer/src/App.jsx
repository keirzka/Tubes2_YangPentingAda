import { useState } from 'react'
import InputPanel from "./components/InputPanel";
import OutputPanel from "./components/OutputPanel";
import './App.css'


function App() {
  const [result, setResult] = useState(null);

  return (
    <div div className="h-screen w-full flex flex-col bg-[#fff5f9]">
      <h1 className="text-center font-bold" style={{ color: 'rgb(112, 26, 117)' }}>
        DOM Visualizer
        </h1>

      <InputPanel setResult={setResult} />
    </div>
  );
}

export default App
