/**
 * AISettingsModal.jsx — Phase A8: AI Connection & Configuration Component.
 *
 * Allows students to configure and test their AI connection (Offline Mock,
 * Local Ollama, or Cloud OpenAI-compatible).
 * Securely masks API keys and provides live connection health probes.
 */

import { useState, useEffect } from 'react';
import { getAIConfig, saveAIConfig, testAIConnection } from '../services/api';
import './AISettingsModal.css';

export default function AISettingsModal({ isOpen, onClose, onConfigSaved }) {
  const [activeTab, setActiveTab] = useState('mock'); // 'mock' | 'ollama' | 'cloud'

  // Ollama settings
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');

  // Cloud settings
  const [cloudProvider, setCloudProvider] = useState('openai');
  const [cloudUrl, setCloudUrl] = useState('https://api.openai.com/v1');
  const [cloudApiKey, setCloudApiKey] = useState('');
  const [cloudModel, setCloudModel] = useState('gpt-4o-mini');
  const [showApiKey, setShowApiKey] = useState(false);

  // Testing & Saving status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Load existing config on open
  useEffect(() => {
    if (isOpen) {
      setTestResult(null);
      setSaveSuccess(null);
      getAIConfig()
        .then((res) => {
          if (res?.config) {
            const cfg = res.config;
            if (cfg.provider) setActiveTab(cfg.provider);

            if (cfg.ollama) {
              if (cfg.ollama.base_url) setOllamaUrl(cfg.ollama.base_url);
              if (cfg.ollama.model) setOllamaModel(cfg.ollama.model);
            }

            if (cfg.cloud) {
              if (cfg.cloud.provider_name) setCloudProvider(cfg.cloud.provider_name);
              if (cfg.cloud.base_url) setCloudUrl(cfg.cloud.base_url);
              if (cfg.cloud.api_key) setCloudApiKey(cfg.cloud.api_key);
              if (cfg.cloud.model) setCloudModel(cfg.cloud.model);
            }
          }
        })
        .catch((err) => {
          console.warn('Could not load AI settings:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSaveSuccess(null);

    const testPayload = {
      provider: activeTab,
      ollama: {
        base_url: ollamaUrl,
        model: ollamaModel,
      },
      cloud: {
        provider_name: cloudProvider,
        base_url: cloudUrl,
        api_key: cloudApiKey,
        model: cloudModel,
      },
    };

    try {
      const result = await testAIConnection(testPayload);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        status: 'error',
        message: err.message || 'Failed to execute connection test probe.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);

    const payload = {
      provider: activeTab,
      ollama: {
        base_url: ollamaUrl,
        model: ollamaModel,
      },
      cloud: {
        provider_name: cloudProvider,
        base_url: cloudUrl,
        api_key: cloudApiKey,
        model: cloudModel,
      },
    };

    try {
      const res = await saveAIConfig(payload);
      setSaveSuccess(res.message || 'AI configuration saved successfully!');
      if (onConfigSaved) onConfigSaved(res.config);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setTestResult({
        success: false,
        status: 'error',
        message: err.message || 'Failed to save AI configuration.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ai-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal__header">
          <div className="ai-modal__title-group">
            <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>⚙️</span>
            <h2 className="ai-modal__title">AI Connection & Configuration</h2>
            <span className="ai-modal__phase-tag">Phase A8</span>
          </div>
          <button
            type="button"
            className="ai-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="ai-provider-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mock'}
            className={`ai-provider-tab ${activeTab === 'mock' ? 'ai-provider-tab--active' : ''}`}
            onClick={() => { setActiveTab('mock'); setTestResult(null); }}
          >
            <span>🛡️</span> Offline Mock
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ollama'}
            className={`ai-provider-tab ${activeTab === 'ollama' ? 'ai-provider-tab--active' : ''}`}
            onClick={() => { setActiveTab('ollama'); setTestResult(null); }}
          >
            <span>🦙</span> Local AI (Ollama)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cloud'}
            className={`ai-provider-tab ${activeTab === 'cloud' ? 'ai-provider-tab--active' : ''}`}
            onClick={() => { setActiveTab('cloud'); setTestResult(null); }}
          >
            <span>☁️</span> Cloud AI (OpenAI/API)
          </button>
        </div>

        {/* Modal Body */}
        <div className="ai-modal__body">
          {/* Tab 1: Mock Mode */}
          {activeTab === 'mock' && (
            <div className="ai-info-box">
              <div className="ai-info-box__title">
                <span>🛡️</span> Built-in Socratic Tutor (Zero-Cost Offline Mode)
              </div>
              <p>
                The offline mock provider simulates the AI Tutor using deterministic pedagogical models. It requires <strong>zero API keys</strong>, works completely offline with zero latency, and has zero running costs.
              </p>
              <p style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Ideal for testing, studying without internet, or getting started immediately.
              </p>
            </div>
          )}

          {/* Tab 2: Local Ollama */}
          {activeTab === 'ollama' && (
            <>
              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="ollama-url">
                  Ollama Base URL
                  <span className="ai-form-help">Default: http://localhost:11434</span>
                </label>
                <input
                  id="ollama-url"
                  type="text"
                  className="ai-form-input"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="ollama-model">
                  Model Name
                  <span className="ai-form-help">e.g. llama3, mistral, qwen</span>
                </label>
                <input
                  id="ollama-model"
                  type="text"
                  className="ai-form-input"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3"
                />
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                💡 Tip: Ensure Ollama is running on your machine (<code>ollama serve</code>) and you have pulled your desired model (<code>ollama pull {ollamaModel || 'llama3'}</code>).
              </p>
            </>
          )}

          {/* Tab 3: Cloud AI */}
          {activeTab === 'cloud' && (
            <>
              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-provider">
                  Provider Preset
                </label>
                <select
                  id="cloud-provider"
                  className="ai-form-input"
                  value={cloudProvider}
                  onChange={(e) => {
                    setCloudProvider(e.target.value);
                    if (e.target.value === 'openai') {
                      setCloudUrl('https://api.openai.com/v1');
                      setCloudModel('gpt-4o-mini');
                    }
                  }}
                >
                  <option value="openai">OpenAI (Official)</option>
                  <option value="custom">Custom / OpenAI-Compatible Endpoint</option>
                </select>
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-url">
                  Base URL / Endpoint
                </label>
                <input
                  id="cloud-url"
                  type="text"
                  className="ai-form-input"
                  value={cloudUrl}
                  onChange={(e) => setCloudUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-key">
                  API Key
                  <span className="ai-form-help">Securely masked on backend</span>
                </label>
                <div className="ai-input-password-wrapper">
                  <input
                    id="cloud-key"
                    type={showApiKey ? 'text' : 'password'}
                    className="ai-form-input"
                    value={cloudApiKey}
                    onChange={(e) => setCloudApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    className="ai-password-toggle"
                    onClick={() => setShowApiKey(!showApiKey)}
                    title={showApiKey ? 'Hide key' : 'Show key'}
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-model">
                  Model Identifier
                </label>
                <input
                  id="cloud-model"
                  type="text"
                  className="ai-form-input"
                  value={cloudModel}
                  onChange={(e) => setCloudModel(e.target.value)}
                  placeholder="gpt-4o-mini"
                />
              </div>
            </>
          )}

          {/* Testing State */}
          {isTesting && (
            <div className="ai-test-result ai-test-result--testing">
              <span className="output-spinner" aria-hidden="true" />
              <span>Pinging provider endpoint and validating response…</span>
            </div>
          )}

          {/* Test Connection Results Banner */}
          {!isTesting && testResult && (
            <div
              className={`ai-test-result ${testResult.success ? 'ai-test-result--success' : 'ai-test-result--error'}`}
              role="status"
            >
              <div className="ai-test-result__header">
                <span>{testResult.success ? '✓ Connection Verified' : '✕ Connection Test Failed'}</span>
                {testResult.latency_ms > 0 && (
                  <span className="ai-test-result__latency">{testResult.latency_ms} ms</span>
                )}
              </div>
              <p style={{ margin: 0 }}>{testResult.message}</p>
            </div>
          )}

          {/* Save Success Toast */}
          {saveSuccess && (
            <div className="ai-test-result ai-test-result--success" role="status">
              <strong>✓ Saved:</strong> {saveSuccess}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="ai-modal__footer">
          <button
            type="button"
            className="ai-modal__btn-test"
            onClick={handleTestConnection}
            disabled={isTesting || isSaving}
            id="btn-test-ai-connection"
          >
            {isTesting ? 'Testing…' : '⚡ Test Connection'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ai-modal__btn-save"
              onClick={handleSave}
              disabled={isSaving}
              id="btn-save-ai-settings"
            >
              {isSaving ? 'Saving…' : 'Save & Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
