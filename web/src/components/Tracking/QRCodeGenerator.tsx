import React from 'react';
import QRCode from "react-qr-code";
import { Printer, ExternalLink, Package } from 'lucide-react';

interface Props {
  shipmentId: string | number;
  productName: string;
}

export const QRCodeGenerator: React.FC<Props> = ({ shipmentId, productName }) => {

  const trackingUrl = `${window.location.origin}/tracking?id=${shipmentId}`;

  const handlePrint = () => {
    const printContent = document.getElementById(`qr-card-${shipmentId}`);
    const win = window.open('', '', 'height=600,width=600');
    if (win && printContent) {
        win.document.write('<html><head><title>Print QR Label</title>');
        win.document.write('<style>body { font-family: sans-serif; display: flex; justify-content: center; padding: 20px; } .card { border: 2px solid #000; padding: 20px; text-align: center; width: 300px; } .title { font-weight: bold; font-size: 18px; margin-bottom: 10px; } .id { font-family: monospace; margin-top: 10px; font-size: 14px; } </style>');
        win.document.write('</head><body>');
        win.document.write(`<div class="card">${printContent.innerHTML}</div>`);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center w-64">
      <div id={`qr-card-${shipmentId}`} className="w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
            <Package className="w-4 h-4" />
            <span className="uppercase text-sm">{productName}</span>
        </div>
        
        <div className="p-2 bg-white border-2 border-gray-900 rounded-lg">
            <QRCode 
                value={trackingUrl} 
                size={140} 
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
            />
        </div>

        <p className="mt-2 text-xs font-mono text-gray-500 font-bold">ID: {shipmentId}</p>
        <p className="text-[10px] text-gray-400 mt-1">Scan to Verify on Blockchain</p>
      </div>

      <div className="flex gap-2 mt-4 w-full">
        <button 
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg transition-colors"
        >
            <Printer className="w-3 h-3" /> In Tem
        </button>
        <a 
            href={trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
            title="Mở link thử"
        >
            <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};