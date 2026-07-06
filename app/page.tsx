"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setStatusMessage({ text: "", type: "" });
    setResults([]);
    
    try {
      const res = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (res.status === 202) {
        // Cache Miss: The worker is crawling it
        setStatusMessage({ 
          text: `Neural Network confidence too low. Dispatching Web Crawler to fetch new data...`, 
          type: "crawling" 
        });
        setResults(data.results || []); // Show the weak matches anyway
      } else if (res.status === 404) {
        // AI couldn't figure out what the user meant
        setStatusMessage({ 
          text: "The AI could not resolve this concept to a known Wikipedia topic.", 
          type: "error" 
        });
      } else {
        // Cache Hit: High confidence matches found
        setResults(data.results || []);
        if (data.results.length === 0) {
          setStatusMessage({ text: "No results found in the vector database.", type: "error" });
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
      setStatusMessage({ text: "Failed to connect to the Semantic Search API.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <main className="max-w-4xl mx-auto px-4 py-16">
        
        {/* Search Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-5xl font-bold text-slate-800 tracking-tight">Semantic<span className="text-blue-600">Search</span></h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide mt-2">AI Powered</span>
          </div>
          
          <form onSubmit={handleSearch} className="w-full max-w-2xl flex shadow-xl rounded-full bg-white border border-gray-200 overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              className="w-full px-6 py-4 outline-none text-lg bg-transparent"
              placeholder="Search by concept, sentence, or question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="px-8 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? "Thinking..." : "Search"}
            </button>
          </form>
        </div>

        {/* Status Messages */}
        {statusMessage.text && (
          <div className={`text-center p-4 mb-8 rounded-lg border font-medium ${
            statusMessage.type === 'crawling' ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' : 
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Results Container */}
        <div className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {results.length > 0 ? (
            results.map((result: any, index: number) => (
              <div key={index} className="group pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-emerald-700 truncate max-w-md">
                    {result.url}
                  </span>
                  {/* The Mathematical Similarity Score Badge */}
                  {result.similarity_score && (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200" title="Cosine Similarity Score">
                      Match: {(result.similarity_score * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="block">
                  <h2 className="text-2xl font-medium text-blue-700 group-hover:underline mb-2">
                    {result.title}
                  </h2>
                </a>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {result.snippet}...
                </p>
              </div>
            ))
          ) : (
            !loading && !statusMessage.text && (
              <div className="text-center text-gray-400 py-12">
                Type a concept above to search the vector database.
              </div>
            )
          )}
        </div>

      </main>
    </div>
  );
}