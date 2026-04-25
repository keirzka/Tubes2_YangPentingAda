import Tree from "react-d3-tree";
import { useRef, useEffect, useState } from "react";
import '../index.css'

export default function DOMTreeViewer({ data }) {
  const containerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Hitung posisi tengah container setelah mount
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 60 });
    }
  }, []);

  const renderNode = ({ nodeDatum }) => {
    let fill = "white";
    let stroke = "#d070ea";

    if (nodeDatum.attributes?.match) {
      fill = "rgb(103,221,70)";
      stroke = "rgb(46,119,25)";
    } else if (nodeDatum.attributes?.visited) {
      fill = "rgb(201, 127, 230)";
      stroke = "rgb(115,30,149)";
    }

    // Hitung lebar kotak berdasarkan panjang teks
    const label = nodeDatum.name + (nodeDatum.attributes?.class ? `.${nodeDatum.attributes.class}` : "");
    const boxW = Math.max(100, label.length * 8 + 30);
    const isMatch = nodeDatum.attributes?.match;
    const textColor = nodeDatum.attributes?.match || nodeDatum.attributes?.visited
      ? "white"
      : "#6b21a8";
      
    return (
      <g>
        {/* Kotak utama node */}
        <rect
          width={boxW}
          height={30}
          x={-boxW / 2}
          y={-15}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.2}
          rx={6}
        />

        {/* Badge MATCH */}
        {isMatch && (
          <>
            <rect
              width={46}
              height={14}
              x={-23}
              y={15}
              fill="rgb(46,119,25)"
              rx={4}
            />
            <text
              x={1.5} y={25}
              textAnchor="middle"
              fontSize={9} 
              fill="white"
              stroke="none"
            >
              MATCH
            </text>
          </>
        )}

        {/* Label tag */}
        <text textAnchor="middle" dy="0.35em" fontSize={11} fill="black" stroke="none" fontWeight="600">
          &lt;{nodeDatum.name}&gt;
          {nodeDatum.attributes?.class ? ` .${nodeDatum.attributes.class}` : ""}
        </text>
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "600px",
        border: "1px solid #e9caf2",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Tree
        data={data}
        renderCustomNodeElement={renderNode}
        translate={translate}
        orientation="vertical"
        pathFunc="step"
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        nodeSize={{ x: 160, y: 80 }}
        zoom={0.7}

        pathClassFunc={(link) => {
        const target = link.target.data.attributes;

        if (target?.match || target?.visited) return "path-active";
        return "path-default";
      }}
      />
    </div>
  );
}