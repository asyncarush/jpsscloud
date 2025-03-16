"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

type FileWithPreview = {
  file: File;
  preview?: string;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
};

export default function FileUpload() {
  const { user } = useUser();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUploadMore, setShowUploadMore] = useState<boolean>(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFileSelection(droppedFiles);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    await handleFileSelection(selectedFiles);
  };

  const handleFileSelection = async (newFiles: File[]) => {
    const filePromises = newFiles.map(async (file) => {
      const preview = file.type.startsWith("image/")
        ? await readFileAsDataURL(file)
        : undefined;
      return {
        file,
        preview,
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: "pending" as const,
      };
    });

    const processedFiles = await Promise.all(filePromises);
    setFiles((prev) => [...prev, ...processedFiles]);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev: FileWithPreview[]) =>
      prev.filter((file) => file.id !== id)
    );
  };

  const handleUploadMore = () => {
    setShowUploadMore(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: FileWithPreview) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file.file);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setFiles((prev: FileWithPreview[]) =>
            prev.map((f: FileWithPreview) =>
              f.id === file.id ? { ...f, progress } : f
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFiles((prev: FileWithPreview[]) =>
            prev.map((f: FileWithPreview) =>
              f.id === file.id ? { ...f, status: "success" as const } : f
            )
          );
          resolve(xhr.response);
        } else {
          setFiles((prev: FileWithPreview[]) =>
            prev.map((f: FileWithPreview) =>
              f.id === file.id
                ? { ...f, status: "error" as const, error: "Upload failed" }
                : f
            )
          );
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        setFiles((prev: FileWithPreview[]) =>
          prev.map((f: FileWithPreview) =>
            f.id === file.id
              ? { ...f, status: "error" as const, error: "Network error" }
              : f
          )
        );
        reject(new Error("Network error"));
      });

      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/upload/`);
      xhr.setRequestHeader("user-id", user.id);
      xhr.setRequestHeader(
        "user-name",
        user.fullName || user.username || user.id
      );

      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(
      (f: FileWithPreview) => f.status === "pending"
    );

    for (const file of pendingFiles) {
      setFiles((prev: FileWithPreview[]) =>
        prev.map((f: FileWithPreview) =>
          f.id === file.id ? { ...f, status: "uploading" as const } : f
        )
      );

      try {
        await uploadFile(file);
      } catch (error) {
        console.error(`Error uploading ${file.file.name}:`, error);
      }
    }

    setShowUploadMore(true);
  };

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl border bg-white ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : "border-black/5 hover:border-black/10"
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {showUploadMore ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-white rounded-full p-4 border border-black/5">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium tracking-tight mb-1 text-black">
                Upload Complete!
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Your files have been successfully uploaded
              </p>
              <Link
                href="/files"
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                View your files →
              </Link>
            </div>
            <button
              onClick={handleUploadMore}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 transition-colors"
            >
              Upload More Files
            </button>
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center space-y-4">
            {files.length === 0 ? (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-white rounded-full p-4 border border-black/5">
                    <svg
                      className="w-12 h-12 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8"
                      />
                    </svg>
                  </div>
                </div>
                <div className="max-w-sm mx-auto">
                  <h3 className="text-xl font-medium tracking-tight mb-1 text-black">
                    Drop files to upload
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    or select files from your computer
                  </p>
                  <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 transition-colors cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="group relative p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-black/5 hover:border-black/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {file.preview ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/5 group-hover:bg-black/[0.075] transition-colors">
                              <Image
                                src={file.preview}
                                alt={file.file.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 40px, 48px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-black/5 group-hover:bg-black/[0.075] transition-colors flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {file.status === "pending" && (
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
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
                      {file.status === "uploading" && (
                        <div className="mt-2">
                          <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {file.status === "error" && (
                        <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {file.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {files.some((f) => f.status === "pending") && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleUpload}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload Files
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
