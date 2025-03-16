"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// {
//   "id": "1df3161424947dfca8169c67e284caca",
//   "name": "17420050374202133473790227828298.jpg",
//   "size": 2340510,
//   "type": "binary/octet-stream",
//   "preview": null,
//   "url": "http://100.79.21.59:9000/media-storage/17420050374202133473790227828298.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20250315%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250315T173405Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=b5cb2b81a332ec54ef0803b6588f4a88d4b1e42e90fce8f17e301e0e84a98748",
//   "uploadedAt": "2025-03-15T02:17:31.780000+00:00"
// }

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  preview: string | null;
  url: string;
  uploadedAt: string;
}

export default function Page() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    "image" | "video" | "pdf" | "text" | "other" | null
  >(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (isLoaded && !user) {
      router.push("/");
      return;
    }

    const getFiles = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/files`,
          {
            headers: {
              "user-id": user.id,
              "user-name": user.fullName || user.username || user.id,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    if (user) {
      getFiles();
    }
  }, [user, isLoaded, router]);

  const getPreview = async (file: File) => {
    // Ensure URL is valid and set preview type accordingly
    const url = file.url;
    if (!url) {
      setPreviewType("other");
      setPreview(true);
      return;
    }
    setPreviewUrl(url);

    if (file.type.startsWith("image/")) {
      setPreviewType("image");
    } else if (file.type.startsWith("video/")) {
      setPreviewType("video");
    } else if (file.type === "application/pdf") {
      setPreviewType("pdf");
    } else if (
      file.type.startsWith("text/") ||
      file.type === "application/json" ||
      file.type === "application/javascript" ||
      file.type === "application/typescript"
    ) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setTextContent(text);
        setPreviewType("text");
      } catch (error) {
        console.error("Error fetching text content:", error);
        setPreviewType("other");
      }
    } else {
      setPreviewType("other");
    }
    setPreview(true);
  };

  return (
    <div
      className={`relative w-full h-screen ${preview ? "overflow-hidden" : ""}`}
    >
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold mb-4">Uploaded Files:</h2>
        <div className="space-y-4">
          {files.length > 0 ? (
            files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-black/5 p-4 flex items-center justify-between hover:border-black/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    {file.type.startsWith("image/") ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    ) : file.type.startsWith("video/") ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{file.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => getPreview(file)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Preview
                  </button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>

        {preview && (
          <div
            onClick={() => setPreview(false)}
            className={`absolute flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 w-full h-full`}
          >
            <div
              onClick={() => setPreview(false)}
              className="text-white absolute cursor-pointer right-20 top-40 rounded-full p-3 bg-blue/100"
            >
              X
            </div>
            <div className="flex flex-col gap-6 overflow-hidden rounded-xl bg-white p-6 max-w-[90vw] max-h-[90vh]">
              {previewType === "image" && previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={800}
                  height={600}
                  className="object-contain max-h-[80vh]"
                />
              )}
              {previewType === "video" && (
                <video
                  controls
                  className="max-w-[800px] max-h-[80vh]"
                  src={previewUrl || undefined}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {previewType === "pdf" && (
                <iframe
                  src={previewUrl || undefined}
                  className="w-full h-[80vh]"
                  title="PDF Preview"
                >
                  This browser does not support PDF preview.
                </iframe>
              )}
              {previewType === "text" && (
                <pre className="whitespace-pre-wrap overflow-auto p-4 bg-gray-50 rounded-lg text-sm max-h-[80vh]">
                  {textContent}
                </pre>
              )}
              {previewType === "other" && (
                <div className="text-center py-8">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600">
                    Preview not available for this file type.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Please download the file to view its contents.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
