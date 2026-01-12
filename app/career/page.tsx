"use client";

import { useState } from "react";

/* ---------- Helper: Convert AI text into career cards ---------- */
function parseAIResponse(text: string) {
  const sections = text.split(/\n\s*\n/);

  return sections.map((section) => {
    const lines = section.split("\n").filter(Boolean);
    return {
      title: lines[0],
      points: lines.slice(1),
    };
  });
}

export default function CareerPage() {
  const [form, setForm] = useState({
    education: "",
    skills: "",
    interest: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- PDF EXPORT FUNCTION (INSIDE COMPONENT) ---------- */
  function downloadPDF() {
    const content = document.getElementById("ai-result");
    if (!content) return;

    const printWindow = window.open("", "", "width=900,height=650");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>AI Career Guidance</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h2, h3 {
              color: #111;
            }
            ul {
              margin-left: 20px;
            }
            li {
              margin-bottom: 6px;
            }
            .card {
              border: 1px solid #ccc;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to API");
      }

      const data = await res.json();
      setResult(data.ai_response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-zinc-900 p-8 rounded-xl space-y-6">
        <h1 className="text-3xl font-bold text-center">
          AI Career Guidance System
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Education (e.g. B.Tech, BCA, MBA)"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            value={form.education}
            onChange={(e) =>
              setForm({ ...form, education: e.target.value })
            }
            required
          />

          <input
            placeholder="Skills (e.g. JavaScript, Python, SQL)"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            value={form.skills}
            onChange={(e) =>
              setForm({ ...form, skills: e.target.value })
            }
            required
          />

          <input
            placeholder="Interest (e.g. Web Development, AI, Finance)"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            value={form.interest}
            onChange={(e) =>
              setForm({ ...form, interest: e.target.value })
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black p-3 rounded font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Get Career Guidance"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-center font-medium">
            {error}
          </p>
        )}

        {result && (
          <div id="ai-result" className="space-y-4">
            <h2 className="text-xl font-semibold">
              AI Career Recommendations
            </h2>

            {parseAIResponse(result).map((career, index) => (
              <div
                key={index}
                className="card bg-black border border-zinc-700 p-5 rounded-lg"
              >
                <h3 className="text-lg font-bold mb-2">
                  {career.title}
                </h3>

                <ul className="list-disc list-inside text-gray-300">
                  {career.points.map((point, i) => (
                    <li key={i}>
                      {point.replace(/^[-•]\s*/, "")}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* ⬇️ PDF BUTTON MOVED BELOW AI RESULT */}
            <button
              onClick={downloadPDF}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 mt-4"
            >
              Download as PDF
            </button>

            <p className="text-xs text-gray-500 pt-3 border-t border-zinc-800">
              Generated by AI • For educational guidance only
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
