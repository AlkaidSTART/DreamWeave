"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import Image from "next/image";
import { X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  value?: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  accept?: string;
}

export function UploadZone({
  value,
  onChange,
  accept = "image/png,image/jpeg,image/webp,image/gif",
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!accept.includes(file.type)) return;
    const previewUrl = URL.createObjectURL(file);
    onChange(file, previewUrl);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card-elevated p-6 text-center transition-all duration-200 ease-smooth",
        isDragging
          ? "border-primary bg-indigo-50 dark:bg-indigo-950/20"
          : "border-border hover:border-border-accent hover:bg-card",
      )}
      role="button"
      tabIndex={0}
      aria-label="上传图片"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {value ? (
        <div className="relative flex h-full w-full items-center justify-center">
          <img
            src={value}
            alt="上传预览"
            className="max-h-[180px] rounded-[10px] object-contain shadow-md"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleClear();
            }}
            className="absolute right-0 top-0 rounded-full bg-card p-1.5 text-foreground shadow-md transition-colors hover:bg-error hover:text-white"
            aria-label="移除图片"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-full bg-card p-3 shadow-sm">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              拖拽图片到此处，或点击上传
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              支持 PNG、JPG、WebP、GIF，最大 10MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}
