"use client";

import { useState } from "react";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState<any>(null);

  const generateBlog = async () => {
    setLoading(true);
    setBlog(null);

    try {
      const res = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      setBlog(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        AI Blog Generator 🚀
      </h1>

      <input
        className="border p-3 w-full rounded mb-4"
        placeholder="Enter a topic (e.g. Benefits of meditation)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button
        onClick={generateBlog}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate Blog"}
      </button>

      {blog && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-bold">{blog.title}</h2>
          <p className="mt-2 whitespace-pre-line">{blog.blog}</p>

          <p className="mt-4 text-sm text-gray-500">
            {blog?.summary}
          </p>

          <div className="mt-2">
            {blog?.keywords?.map((k: string, i: number) => (
              <span
                key={i}
                className="inline-block bg-gray-200 px-2 py-1 mr-2 mt-2 rounded"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}