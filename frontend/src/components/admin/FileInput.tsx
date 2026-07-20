"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface FileInputHandle {
  reset: () => void;
}

interface FileInputProps {
  accept?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  selectedFileName?: string | null;
  buttonLabel?: string;
  variant?: "button" | "dropzone";
  dropzoneLabel?: string;
  className?: string;
}

export const FileInput = forwardRef<FileInputHandle, FileInputProps>(function FileInput(
  {
    accept,
    onChange,
    disabled = false,
    selectedFileName,
    buttonLabel = "Обрати файл",
    variant = "button",
    dropzoneLabel = "Перетягніть фото сюди або клікніть, щоб обрати",
    className,
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (inputRef.current) inputRef.current.value = "";
    },
  }));

  function openDialog() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onChange(file);
  }

  // Реальний <input type="file"> лишається в DOM для роботи діалогу вибору файлу,
  // але візуально прихований — керування йде через стилізовану кнопку/зону,
  // а сам інпут прибрано з tab-порядку (tabIndex={-1}), щоб фокус завжди
  // потрапляв на видимий елемент, а не на невидимий системний input.
  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      onChange={handleChange}
      disabled={disabled}
      tabIndex={-1}
      aria-hidden="true"
      className="hidden"
    />
  );

  if (variant === "dropzone") {
    return (
      <div className={className}>
        {hiddenInput}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openDialog}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openDialog();
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-disabled={disabled}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-[3px] border-2 border-dashed px-6 py-8 text-center outline-none transition-colors ${
            disabled
              ? "cursor-not-allowed border-edge opacity-60"
              : "cursor-pointer border-edge hover:border-brass focus-visible:border-brass"
          }`}
        >
          <span className="font-sans text-sm text-ink">{dropzoneLabel}</span>
          {selectedFileName ? (
            <span className="font-sans text-[13px] text-leather">{selectedFileName}</span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      {hiddenInput}
      <button
        type="button"
        onClick={openDialog}
        disabled={disabled}
        className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-60"
      >
        {buttonLabel}
      </button>
      <span className="font-sans text-sm text-leather">{selectedFileName ?? "Файл не обрано"}</span>
    </div>
  );
});
