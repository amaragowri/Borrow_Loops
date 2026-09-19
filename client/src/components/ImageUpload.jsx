import React, { useState, useRef } from 'react';
import { Upload, X, Star, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ImageUpload = ({ files = [], setFiles, mainIndex = 0, setMainIndex, existingImages = [], setExistingImages }) => {
  const { showToast } = useNotifications();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate single file
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Please upload JPG, PNG, or WEBP images.', 'error');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('Image size must be less than 5 MB.', 'error');
      return false;
    }
    return true;
  };

  const handleFileChange = (newFileList) => {
    const validNewFiles = [];
    const totalCurrent = files.length + (existingImages ? existingImages.length : 0);

    for (let i = 0; i < newFileList.length; i++) {
      if (totalCurrent + validNewFiles.length >= MAX_FILES) {
        showToast(`You can upload a maximum of ${MAX_FILES} images.`, 'warning');
        break;
      }
      const file = newFileList[i];
      if (validateFile(file)) {
        // Create local preview URL
        file.previewUrl = URL.createObjectURL(file);
        validNewFiles.push(file);
      }
    }

    if (validNewFiles.length > 0) {
      setFiles((prev) => [...prev, ...validNewFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      // Clean up object URL memory
      URL.revokeObjectURL(prev[indexToRemove]?.previewUrl);
      return updated;
    });

    if (mainIndex === indexToRemove) {
      setMainIndex(0);
    } else if (mainIndex > indexToRemove) {
      setMainIndex((prev) => prev - 1);
    }
  };

  const removeExistingImage = (idxToRemove) => {
    if (setExistingImages) {
      setExistingImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    }
  };

  const totalCount = files.length + (existingImages?.length || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Upload Item Photos
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload 1 to 8 clear photos. The highlighted photo will be your main thumbnail.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {totalCount} / {MAX_FILES}
        </span>
      </div>

      {/* Drag and drop upload zone */}
      {totalCount < MAX_FILES && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 bg-slate-50/50 dark:bg-slate-900/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-sm">
              <Upload size={24} />
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag & drop photos here, or <span className="text-brand-600 dark:text-brand-400 underline">browse files</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Supports JPG, PNG, WEBP up to 5MB each.
            </p>
          </div>
        </div>
      )}

      {/* Previews Grid */}
      {(existingImages?.length > 0 || files.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {/* Existing images when editing */}
          {existingImages?.map((img, idx) => (
            <div
              key={`exist-${idx}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-900 shadow-sm"
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {img.isMain && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-md shadow">
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={() => removeExistingImage(idx)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Newly selected files */}
          {files.map((file, idx) => {
            const isMain = idx === mainIndex;
            return (
              <div
                key={`file-${idx}`}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all shadow-sm group bg-slate-900 ${
                  isMain ? 'border-brand-500 ring-2 ring-brand-400/30' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <img
                  src={file.previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />

                {/* Main badge */}
                {isMain ? (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-md shadow flex items-center gap-1">
                    <Star size={10} className="fill-white" /> Main Thumbnail
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMainIndex(idx)}
                    className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 hover:bg-brand-600 text-white text-[10px] font-medium rounded-md backdrop-blur-sm shadow transition"
                  >
                    Set as Main
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-500 text-white flex items-center justify-center backdrop-blur-sm shadow transition"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>

                {/* File size indicator */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-white/80 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                  <span className="truncate max-w-[80px]">{file.name}</span>
                  <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
