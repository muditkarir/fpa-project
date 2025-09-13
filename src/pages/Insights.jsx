import { useState } from 'react';

export default function Insights() {
  const [text, setText] = useState('');
  const [question, setQuestion] = useState('');
  const [summary, setSummary] = useState(null);
  const [tone, setTone] = useState(null);
  const [qaResult, setQaResult] = useState(null);
  const [edgarSource, setEdgarSource] = useState(null);
  const [loading, setLoading] = useState({
    summary: false,
    tone: false,
    qa: false,
    edgar: false
  });
  const [errors, setErrors] = useState({
    summary: null,
    tone: null,
    qa: null,
    edgar: null
  });

  const clearError = (type) => {
    setErrors(prev => ({ ...prev, [type]: null }));
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, summary: true }));
    clearError('summary');
    
    try {
      const response = await fetch('/api/nlp/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to summarize text');
      }
      
      setSummary(result.summaryBullets);
    } catch (error) {
      console.error('Summarization error:', error);
      setErrors(prev => ({ ...prev, summary: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const handleAnalyzeTone = async () => {
    if (!text.trim()) return;
    
    setLoading(prev => ({ ...prev, tone: true }));
    clearError('tone');
    
    try {
      const response = await fetch('/api/nlp/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze tone');
      }
      
      setTone(result.sentences);
    } catch (error) {
      console.error('Tone analysis error:', error);
      setErrors(prev => ({ ...prev, tone: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, tone: false }));
    }
  };

  const handleAskQuestion = async () => {
    if (!text.trim() || !question.trim()) return;
    
    setLoading(prev => ({ ...prev, qa: true }));
    clearError('qa');
    
    try {
      const response = await fetch('/api/nlp/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: question.trim(), 
          context: text.trim() 
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to answer question');
      }
      
      setQaResult(result);
    } catch (error) {
      console.error('Q&A error:', error);
      setErrors(prev => ({ ...prev, qa: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, qa: false }));
    }
  };

  const handleFetchEdgarOutlook = async () => {
    setLoading(prev => ({ ...prev, edgar: true }));
    clearError('edgar');
    
    try {
      // Fetch latest Adobe 10-Q outlook
      const response = await fetch('/api/edgar/latest-outlook?cik=0000796343');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch EDGAR outlook');
      }
      
      // Set the fetched text and source info
      let displayText = result.excerpt;
      
      // Add confidence-based message
      if (result.confidence === 'low') {
        displayText = "⚠️ Couldn't find a clear Outlook section—showing MD&A excerpt:\n\n" + displayText;
      } else if (result.confidence === 'medium') {
        displayText = "📄 Found MD&A content (no specific Outlook section):\n\n" + displayText;
      } else {
        displayText = "🎯 Found Outlook section:\n\n" + displayText;
      }
      
      setText(displayText);
      setEdgarSource({
        ...result.source,
        confidence: result.confidence
      });
      
      // Clear any previous results
      setSummary(null);
      setTone(null);
      setQaResult(null);
      
      // Auto-run summarization and tone analysis
      setTimeout(async () => {
        if (displayText && displayText.trim().length > 50) {
          // Run summarization with the fetched text
          try {
            setLoading(prev => ({ ...prev, summary: true }));
            const summaryResponse = await fetch('/api/nlp/summarize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: displayText.trim() })
            });
            
            const summaryResult = await summaryResponse.json();
            if (summaryResponse.ok) {
              setSummary(summaryResult.summaryBullets);
            }
          } catch (error) {
            console.error('Auto-summarization error:', error);
          } finally {
            setLoading(prev => ({ ...prev, summary: false }));
          }
          
          // Run tone analysis with the fetched text
          setTimeout(async () => {
            try {
              setLoading(prev => ({ ...prev, tone: true }));
              const toneResponse = await fetch('/api/nlp/tone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: displayText.trim() })
              });
              
              const toneResult = await toneResponse.json();
              if (toneResponse.ok) {
                setTone(toneResult.sentences);
              }
            } catch (error) {
              console.error('Auto-tone analysis error:', error);
            } finally {
              setLoading(prev => ({ ...prev, tone: false }));
            }
          }, 1000); // 1 second delay for tone analysis
        }
      }, 200);
      
    } catch (error) {
      console.error('EDGAR fetch error:', error);
      setErrors(prev => ({ ...prev, edgar: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, edgar: false }));
    }
  };

  const getToneChipClass = (label) => {
    const baseClass = 'tone-chip';
    switch (label.toLowerCase()) {
      case 'positive': return `${baseClass} positive`;
      case 'negative': return `${baseClass} negative`;
      default: return `${baseClass} neutral`;
    }
  };

  const formatConfidence = (score) => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div className="insights-page">
      <div className="page-header">
        <h1>📊 Financial Text Insights</h1>
        <p className="page-subtitle">
          Analyze management commentary, press releases, and financial disclosures using AI
        </p>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <label htmlFor="text-input" className="input-label">
          Management Text or Press Release
        </label>
        <textarea
          id="text-input"
          className="text-input"
          placeholder="Paste MD&A outlook section, earnings call transcript, or press release text here...

Example: Adobe delivered strong financial results this quarter, with revenue growth of 12% year-over-year driven by our Creative Cloud and Document Cloud solutions. We remain optimistic about market conditions despite ongoing economic uncertainty. Our AI initiatives continue to show promising results and we expect to see meaningful impact in the coming quarters."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
        />
        
        <div className="button-group">
          <button 
            className="action-btn primary"
            onClick={handleFetchEdgarOutlook}
            disabled={loading.edgar}
          >
            {loading.edgar ? 'Fetching...' : '📊 Fetch latest 10-Q Outlook (EDGAR)'}
          </button>
          
          <button 
            className="action-btn primary"
            onClick={handleSummarize}
            disabled={!text.trim() || loading.summary}
          >
            {loading.summary ? 'Summarizing...' : '📝 Summarize'}
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={handleAnalyzeTone}
            disabled={!text.trim() || loading.tone}
          >
            {loading.tone ? 'Analyzing...' : '🎯 Analyze Tone'}
          </button>
        </div>
        
        {/* EDGAR Source Information */}
        {edgarSource && (
          <div className="edgar-source">
            <p>
              <strong>📋 Source:</strong> SEC EDGAR (auto-extracted) • 
              <strong>Form:</strong> {edgarSource.form} • 
              <strong>Filed:</strong> {edgarSource.filedAt} • 
              <strong>Confidence:</strong> {edgarSource.confidence || 'medium'} • 
              <a href={edgarSource.url} target="_blank" rel="noopener noreferrer" className="source-link">
                View Filing →
              </a>
            </p>
          </div>
        )}
        
        {/* EDGAR Error Display */}
        {errors.edgar && (
          <div className="error-state">
            <p>❌ {errors.edgar}</p>
            <button className="retry-btn" onClick={handleFetchEdgarOutlook}>
              Retry EDGAR Fetch
            </button>
          </div>
        )}
      </div>

      {/* Summary Results */}
      {(summary || errors.summary) && (
        <div className="results-section">
          <h3>🎯 Management Outlook & Drivers</h3>
          {errors.summary ? (
            <div className="error-state">
              <p>❌ {errors.summary}</p>
              <button className="retry-btn" onClick={handleSummarize}>
                Retry Summarization
              </button>
            </div>
          ) : summary && (
            <ul className="summary-bullets">
              {summary.map((bullet, index) => (
                <li key={index} className="summary-bullet">{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tone Analysis Results */}
      {(tone || errors.tone) && (
        <div className="results-section">
          <h3>💭 Sentiment Analysis</h3>
          {errors.tone ? (
            <div className="error-state">
              <p>❌ {errors.tone}</p>
              <button className="retry-btn" onClick={handleAnalyzeTone}>
                Retry Tone Analysis
              </button>
            </div>
          ) : tone && (
            <div className="tone-results">
              {tone.map((sentence, index) => (
                <div key={index} className="sentence-analysis">
                  <p className="sentence-text">"{sentence.text}"</p>
                  <div className="tone-info">
                    <span className={getToneChipClass(sentence.label)}>
                      {sentence.label}
                    </span>
                    <span className="confidence">
                      {formatConfidence(sentence.score)} confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Q&A Section */}
      <div className="qa-section">
        <h3>❓ Ask a Question</h3>
        <div className="qa-input-group">
          <input
            type="text"
            className="question-input"
            placeholder="Ask a question about this text..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
          />
          <button 
            className="action-btn primary"
            onClick={handleAskQuestion}
            disabled={!text.trim() || !question.trim() || loading.qa}
          >
            {loading.qa ? 'Thinking...' : 'Ask'}
          </button>
        </div>

        {errors.qa && (
          <div className="error-state">
            <p>❌ {errors.qa}</p>
            <button className="retry-btn" onClick={handleAskQuestion}>
              Retry Question
            </button>
          </div>
        )}

        {qaResult && (
          <div className="qa-result">
            <div className="answer">
              <strong>Answer:</strong> {qaResult.answer}
            </div>
            {qaResult.score > 0 && (
              <div className="qa-confidence">
                Confidence: {formatConfidence(qaResult.score)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="tech-note">
        <p>
          🤖 <strong>Powered by Hugging Face models</strong> - 
          All processing happens securely via serverless functions (no client keys exposed)
        </p>
        <p className="models-info">
          Summarization: facebook/bart-large-cnn • 
          Sentiment: ProsusAI/finbert • 
          Q&A: deepset/roberta-base-squad2
        </p>
      </div>
    </div>
  );
}