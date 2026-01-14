import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// CORRECCIÓN AQUÍ: Quité 'Facheck' que estaba mal escrito y no se usaba
import { FaCloudUploadAlt, FaFileArchive, FaTrash, FaDownload, FaSpinner } from 'react-icons/fa';

export default function WebPConverter() {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.8);

  const convertToWebP = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            resolve({
              originalName: file.name,
              newName: file.name.replace(/\.(png|jpe?g)$/i, '') + '.webp',
              blob: blob,
              preview: URL.createObjectURL(blob),
              size: (blob.size / 1024).toFixed(2) + ' KB',
              originalSize: (file.size / 1024).toFixed(2) + ' KB'
            });
          }, 'image/webp', quality);
        };
      };
    });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    const processedImages = [];

    for (const file of files) {
      if (file.type.match('image.*')) {
        const result = await convertToWebP(file);
        processedImages.push(result);
      }
    }

    setImages((prev) => [...prev, ...processedImages]);
    setIsProcessing(false);
  };

  const downloadSingle = (img) => {
    saveAs(img.blob, img.newName);
  };

  const downloadAllZip = () => {
    const zip = new JSZip();
    images.forEach((img) => {
      zip.file(img.newName, img.blob);
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "imagenes_webp_mqerk.zip");
    });
  };

  const clearAll = () => {
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        <div className="bg-[#3c26cc] p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Conversor Masivo a WebP 🚀</h1>
          <p className="opacity-80">Sube tus JPG/PNG y obtén WebP optimizados listos para la web.</p>
        </div>

        <div className="p-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-gray-700">Calidad: {quality * 100}%</label>
               <input 
                 type="range" 
                 min="0.1" 
                 max="1" 
                 step="0.1" 
                 value={quality} 
                 onChange={(e) => setImages([]) || setQuality(parseFloat(e.target.value))}
                 className="w-32 accent-[#3c26cc]"
               />
            </div>
            {images.length > 0 && (
                <div className="flex gap-3">
                    <button onClick={clearAll} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition font-medium flex items-center gap-2">
                        <FaTrash /> Limpiar
                    </button>
                    <button 
                        onClick={downloadAllZip} 
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition font-bold flex items-center gap-2"
                    >
                        <FaFileArchive /> Descargar ZIP ({images.length})
                    </button>
                </div>
            )}
          </div>

          <div className="relative border-4 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-[#3c26cc] hover:bg-blue-50 transition-colors group cursor-pointer">
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFiles} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#3c26cc] transition-colors">
                {isProcessing ? (
                    <FaSpinner className="h-16 w-16 animate-spin mb-4" />
                ) : (
                    <FaCloudUploadAlt className="h-16 w-16 mb-4" />
                )}
                <p className="text-lg font-medium">
                    {isProcessing ? "Procesando imágenes..." : "Arrastra tus imágenes aquí o haz clic para seleccionar"}
                </p>
                <p className="text-sm mt-2 opacity-60">Soporta selección múltiple</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Imágenes Listas ({images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all">
                            <div className="relative h-40 bg-gray-200">
                                <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => downloadSingle(img)}
                                        className="bg-white text-gray-900 p-2 rounded-full hover:scale-110 transition"
                                        title="Descargar esta imagen"
                                    >
                                        <FaDownload />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-gray-500 truncate" title={img.originalName}>
                                    De: {img.originalName}
                                </p>
                                <p className="text-sm font-bold text-gray-800 truncate" title={img.newName}>
                                    A: {img.newName}
                                </p>
                                <div className="flex justify-between items-center mt-2 text-xs">
                                    <span className="text-red-400 line-through">{img.originalSize}</span>
                                    <span className="text-green-600 font-bold">{img.size}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}