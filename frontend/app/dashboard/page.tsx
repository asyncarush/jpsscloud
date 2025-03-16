import FileUpload from "@/app/components/FileUpload";
import Header from "@/app/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-medium mb-3 tracking-tight ">
            Your Personal Cloud Storage
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload and manage your files securely with unlimited storage
            capacity
          </p>
        </div>

        <div className="mb-12">
          <FileUpload />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-black/5 p-4 flex items-start gap-3 hover:border-black/10 transition-colors">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
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
            </div>
            <div>
              <h3 className="font-medium mb-1 text-black">All File Types</h3>
              <p className="text-sm text-gray-600">
                Upload any type of file without restrictions
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-black/5 p-4 flex items-start gap-3 hover:border-black/10 transition-colors">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
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
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1 text-black">Unlimited Storage</h3>
              <p className="text-sm text-gray-600">
                Store as much as you need, no limits
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
