import React, { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  label: string;
  value?: string | File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  helpText?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  className = "",
  required = false,
  disabled = false,
  placeholder = "Click to upload or drag and drop",
  error,
  helpText,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        onChange(null);
        return;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        onChange(null);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Update parent component
      onChange(file);
    },
    [onChange, maxSize]
  );

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle click on upload area
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show existing image if value is a URL string
  React.useEffect(() => {
    if (typeof value === "string" && value && !value.startsWith("data:")) {
      setPreview(value);
    } else if (value instanceof File) {
      handleFileSelect(value);
    } else {
      setPreview(null);
    }
  }, [value, handleFileSelect]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg shadow-sm"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                {placeholder}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, WebP up to {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {helpText && <p className="text-sm text-gray-500">{helpText}</p>}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
