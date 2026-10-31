import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, QrCode as QrIcon } from 'lucide-react';

interface AddressQrCodeProps {
  value: string;
  size?: number;
  label?: string;
  network?: string;
  brandColor?: string;
}

export const AddressQrCode: React.FC<AddressQrCodeProps> = ({
  value,
  size = 140,
  label,
  network,
  brandColor = '#06B6D4'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }, (error) => {
        if (error) console.error('QR generation error', error);
        else if (canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      });
    }
  }, [value, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `tixa-${network || 'payment'}-qr.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl text-center font-mono">
      <div className="p-2 rounded-xl bg-white shadow-inner relative group flex items-center justify-center min-w-[128px] min-h-[128px]">
        {value ? (
          <canvas ref={canvasRef} className="rounded-lg max-w-full" />
        ) : (
          <div className="w-28 h-28 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-lg p-2 text-[10px]">
            <QrIcon className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-[9px] text-slate-400 font-sans">No Address Set</span>
          </div>
        )}
      </div>

      {label && (
        <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
          {label}
        </span>
      )}

      {value && (
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] flex items-center gap-1 transition-colors"
            title="Copy Address Text"
          >
            {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{hasCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {dataUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] flex items-center gap-1 transition-colors"
              title="Download QR Image"
            >
              <Download className="w-3 h-3" />
              <span>QR</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
