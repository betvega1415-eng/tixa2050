import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, Radio, Shield, Globe } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  value: string;
}

interface Packet {
  id: number;
  fromNode: number;
  toNode: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

const NODES: Node[] = [
  { id: 'TIXA', name: 'TIXA NET', x: 120, y: 55, color: '#06b6d4', value: '$985K' },
  { id: 'QXA', name: 'QXA COIN', x: 260, y: 35, color: '#10b981', value: '$124.5K' },
  { id: 'NISI', name: 'NISI CORE', x: 380, y: 65, color: '#f59e0b', value: '$91.2K' },
  { id: 'SARA', name: 'SARA NODE', x: 190, y: 95, color: '#8b5cf6', value: '$3.4K' },
  { id: 'MUN', name: 'MUN RELAY', x: 320, y: 105, color: '#3b82f6', value: '$210.8' },
];

const CONNECTIONS = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 0, to: 3 },
  { from: 3, to: 4 },
  { from: 1, to: 4 },
  { from: 2, to: 4 },
];

export const CoinNetworkMotion: React.FC = () => {
  const [packets, setPackets] = useState<Packet[]>([]);

  useEffect(() => {
    // Initialize data packets
    const initialPackets: Packet[] = [
      { id: 1, fromNode: 0, toNode: 1, progress: 0.2, speed: 0.015, color: '#06b6d4' },
      { id: 2, fromNode: 1, toNode: 2, progress: 0.6, speed: 0.012, color: '#10b981' },
      { id: 3, fromNode: 0, toNode: 3, progress: 0.4, speed: 0.018, color: '#8b5cf6' },
      { id: 4, fromNode: 3, toNode: 4, progress: 0.8, speed: 0.014, color: '#3b82f6' },
      { id: 5, fromNode: 1, toNode: 4, progress: 0.1, speed: 0.016, color: '#f59e0b' },
    ];
    setPackets(initialPackets);

    const interval = setInterval(() => {
      setPackets(prev =>
        prev.map(p => {
          let nextProg = p.progress + p.speed;
          if (nextProg >= 1) {
            // Reset to another random connection
            const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
            return {
              ...p,
              fromNode: conn.from,
              toNode: conn.to,
              progress: 0,
              speed: 0.01 + Math.random() * 0.015,
              color: NODES[conn.from].color
            };
          }
          return { ...p, progress: nextProg };
        })
      );
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-32 sm:h-36 rounded-2xl bg-gradient-to-r from-slate-950 via-[#060c21] to-slate-950 border border-cyan-500/30 overflow-hidden shadow-inner flex items-center justify-between px-4 sm:px-6">
      
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      {/* Left info badge */}
      <div className="relative z-10 flex flex-col justify-center space-y-1 max-w-[200px]">
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>COIN NETWORK MOTION</span>
        </div>
        <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wider font-heading">
          Live Node Data Stream
        </h4>
        <p className="text-[10px] text-slate-400 font-mono">
          33Hz decentralized peer-to-peer packet transfer across 34 assets.
        </p>
      </div>

      {/* Center SVG Animated Network Graph */}
      <div className="relative flex-1 h-full max-w-md hidden sm:block">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 440 130">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connections (Lines) */}
          {CONNECTIONS.map((conn, idx) => {
            const n1 = NODES[conn.from];
            const n2 = NODES[conn.to];
            return (
              <line
                key={`conn-${idx}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Moving Data Packets */}
          {packets.map(p => {
            const n1 = NODES[p.fromNode];
            const n2 = NODES[p.toNode];
            const px = n1.x + (n2.x - n1.x) * p.progress;
            const py = n1.y + (n2.y - n1.y) * p.progress;
            return (
              <g key={`packet-${p.id}`}>
                <circle
                  cx={px}
                  cy={py}
                  r="4"
                  fill={p.color}
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                <circle
                  cx={px}
                  cy={py}
                  r="7"
                  stroke={p.color}
                  strokeWidth="1"
                  fill="none"
                  opacity="0.6"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node, i) => (
            <g key={`node-${node.id}`} className="cursor-pointer group">
              <circle
                cx={node.x}
                cy={node.y}
                r="14"
                fill="#090e1f"
                stroke={node.color}
                strokeWidth="2"
                filter="url(#glow)"
              />
              <text
                x={node.x}
                y={node.y + 3}
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {node.id.substring(0, 3)}
              </text>
              <text
                x={node.x}
                y={node.y + 22}
                fill="#94a3b8"
                fontSize="7"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {node.value}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Right status badge */}
      <div className="relative z-10 flex flex-col items-end justify-center space-y-1 text-right">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          33Hz Active
        </span>
        <span className="text-[10px] font-mono text-cyan-300 font-bold">34 Native Assets</span>
      </div>

    </div>
  );
};
