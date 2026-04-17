import { useState } from 'react'
import '../App.css'

export default function OutputPanel({ result }) {
  return (
    <div>
      <h2>Output</h2>
      <pre>{result}</pre>
    </div>
  );
}