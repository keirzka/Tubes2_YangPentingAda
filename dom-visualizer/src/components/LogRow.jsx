export default function LogRow({ entry }) {
  const warna = {
    visit: { borderLeft: "4px solid rgb(197, 89, 240)", borderRight: "4px solid rgb(197, 89, 240)" },
    match: { border: "4px solid rgb(119, 204, 96)" },
    skip:  { background: "rgb(255, 255, 255)" },
  }
  const warnaIni = warna[entry.action]

  return (
    <div style={{ ...warnaIni, padding: "8px", borderRadius: "8px"}}>
      {/* Step */}
      <span>#{entry.step} | </span>
      {/* Aksi */}
      <span>{entry.action} | </span>
      {/* Nama Tag */}
      <span>&lt;{entry.tag}&gt; | </span>
      {/* ID Node */}
      <span>id : {entry.nodeId} | </span>
      {/* Depth Pencarian */}
      <span>depth : {entry.depth}</span>
    </div>
  );
}