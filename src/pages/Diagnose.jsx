import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result || '';
      const base64 = String(result).split(',')[1] || '';
      resolve({ base64, mime: file.type || 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  });
}

async function callGemini({ base64, mime, prompt }) {
  const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
  // Use Gemini 3 Flash preview via SDK
  const model = 'gemini-3-flash-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text:
            prompt ||
            'You are an expert agronomist. Given the attached plant image, identify the crop, detect any disease, explain likely causes, and provide short, actionable steps to cure/prevent it. Return concise markdown with headings: "Likely Disease", "Why", "How to Cure", "Prevention". If healthy, say "Looks Healthy" and give care tips.',
        },
        {
          inlineData: {
            mimeType: mime,
            data: base64,
          },
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  const text =
    (typeof response.text === 'function' ? response.text() : response.text) ||
    (response?.response && typeof response.response.text === 'function'
      ? response.response.text()
      : '') ||
    '';
  if (!text) throw new Error('Empty response from Gemini.');
  return text;
}

export default function Diagnose() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setResult('');
    setError('');
    setPreview('');
    setFile(null);
    if (!f) return;

    if (f.size > MAX_SIZE_BYTES) {
      setError('Please choose an image smaller than 5MB.');
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult('');

    if (!file) {
      setError('Please select an image.');
      return;
    }

    try {
      setLoading(true);
      const { base64, mime } = await fileToBase64(file);
      console.log(base64, mime);
      const text = await callGemini({ base64, mime, prompt: customPrompt.trim() });
      console.log(text);
      setResult(text);
    } catch (err) {
      setError(err.message || 'Failed to analyze image.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Diagnose Plant Disease</h1>
      <form className="form" onSubmit={onSubmit}>
        <label className="form__label">Plant Image</label>
        <input className="form__file" type="file" accept="image/*" onChange={onFileChange} />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}
          />
        )}

        <label className="form__label">Optional prompt tweak</label>
        <textarea
          className="form__input"
          rows={3}
          placeholder="Add any context (e.g., crop name, location, time of year)"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
        />

        {error && <div className="alert alert--error">{error}</div>}

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze Image'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Result</h2>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

