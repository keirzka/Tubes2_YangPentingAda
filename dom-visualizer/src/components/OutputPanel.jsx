import { useState } from 'react'
import '../index.css'

export default function OutputPanel({ result }) {
  return (
    <div>
      <h2>Output</h2>
      <pre>{result ? JSON.stringify(result, null, 2) : "Data kosong"}</pre>
    </div>
  );
}