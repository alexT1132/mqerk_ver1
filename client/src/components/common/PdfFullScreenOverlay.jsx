import React from 'react';
import { X } from 'lucide-react';
import PdfMobileViewer from './PdfMobileViewer.jsx';

export default function PdfFullScreenOverlay({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2a145f] text-white">
        <div className="text-xs sm:text-sm font-semibold truncate">Visor PDF</div>
        <button onClick={onClose} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs">
          <X className="w-4 h-4"/> Cerrar
        </button>
      </div>
      <div className="flex-1 p-2 overflow-hidden">
        <PdfMobileViewer url={url} initialPage={1} enableGestures={true} />
      </div>
    </div>
  );
}
