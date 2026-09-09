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
            <div className="ai-modal__icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <div className="ai-modal__title-row">
                <h2 className="ai-modal__title">AI Provider & Connection Settings</h2>
                <span className="ai-modal__phase-tag">Provider Engine</span>
              </div>
              <p className="ai-modal__header-desc">
                Select your inference backend for Socratic tutoring, code analysis, and error explanations
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ai-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Provider Cards / Tabs */}
        <div className="ai-provider-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mock'}
            className={`ai-provider-nav-btn ${activeTab === 'mock' ? 'ai-provider-nav-btn--active' : ''}`}
            onClick={() => { setActiveTab('mock'); setTestResult(null); }}
          >
            <div className="ai-provider-nav-btn__top">
              <span className="ai-provider-nav-btn__icon">🛡️</span>
              <span className="ai-provider-nav-btn__name">Offline Mock</span>
            </div>
            <span className="ai-provider-nav-btn__badge ai-provider-nav-btn__badge--free">Zero Setup</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ollama'}
            className={`ai-provider-nav-btn ${activeTab === 'ollama' ? 'ai-provider-nav-btn--active' : ''}`}
            onClick={() => { setActiveTab('ollama'); setTestResult(null); }}
          >
            <div className="ai-provider-nav-btn__top">
              <span className="ai-provider-nav-btn__icon">🦙</span>
              <span className="ai-provider-nav-btn__name">Local Ollama</span>
            </div>
            <span className="ai-provider-nav-btn__badge ai-provider-nav-btn__badge--local">Private & Free</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cloud'}
            className={`ai-provider-nav-btn ${activeTab === 'cloud' ? 'ai-provider-nav-btn--active' : ''}`}
            onClick={() => { setActiveTab('cloud'); setTestResult(null); }}
          >
            <div className="ai-provider-nav-btn__top">
              <span className="ai-provider-nav-btn__icon">☁️</span>
              <span className="ai-provider-nav-btn__name">Cloud Model</span>
            </div>
            <span className="ai-provider-nav-btn__badge ai-provider-nav-btn__badge--cloud">OpenAI API</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="ai-modal__body">
          {/* Tab 1: Mock Mode */}
          {activeTab === 'mock' && (
            <div className="ai-info-box">
              <div className="ai-info-box__header">
                <span className="ai-info-box__icon">🛡️</span>
                <div>
                  <h4 className="ai-info-box__title">Built-in Socratic Engine (Deterministic Offline)</h4>
                  <span className="ai-info-box__status">Active Default • Zero Latency • 100% Privacy</span>
                </div>
              </div>
              <p className="ai-info-box__desc">
                The offline mock provider simulates AI mentoring using deterministic pedagogical rules and curated educational templates. It requires <strong>no API keys</strong>, runs completely offline, and incurs zero usage costs.
              </p>
              <div className="ai-info-box__perks">
                <span className="ai-info-box__perk">✓ Instant 0ms response time</span>
                <span className="ai-info-box__perk">✓ No external network calls</span>
                <span className="ai-info-box__perk">✓ Ideal for offline study</span>
              </div>
            </div>
          )}

          {/* Tab 2: Local Ollama */}
          {activeTab === 'ollama' && (
            <div className="ai-form-stack">
              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="ollama-url">
                  <span>Ollama Base URL</span>
                  <span className="ai-form-help">Default: http://localhost:11434</span>
                </label>
                <div className="ai-input-wrapper">
                  <input
                    id="ollama-url"
                    type="text"
                    className="ai-form-input"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                </div>
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="ollama-model">
                  <span>Target Model Name</span>
                  <span className="ai-form-help">e.g., llama3, mistral, qwen2.5-coder</span>
                </label>
                <div className="ai-input-wrapper">
                  <input
                    id="ollama-model"
                    type="text"
                    className="ai-form-input"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3"
                  />
                </div>
              </div>

              <div className="ai-callout-note">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>
                  Make sure Ollama is actively running (<code>ollama serve</code>) and pull your model (<code>ollama pull {ollamaModel || 'llama3'}</code>) before testing connection.
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Cloud AI */}
          {activeTab === 'cloud' && (
            <div className="ai-form-stack">
              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-provider">
                  <span>Provider Preset</span>
                </label>
                <select
                  id="cloud-provider"
                  className="ai-form-input ai-form-select"
                  value={cloudProvider}
                  onChange={(e) => {
                    setCloudProvider(e.target.value);
                    if (e.target.value === 'openai') {
                      setCloudUrl('https://api.openai.com/v1');
                      setCloudModel('gpt-4o-mini');
                    }
                  }}
                >
                  <option value="openai">OpenAI (Official API)</option>
                  <option value="custom">Custom / OpenAI-Compatible Endpoint</option>
                </select>
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-url">
                  <span>Base URL / Endpoint</span>
                </label>
                <div className="ai-input-wrapper">
                  <input
                    id="cloud-url"
                    type="text"
                    className="ai-form-input"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-key">
                  <span>API Key</span>
                  <span className="ai-form-help">Never exposed in plain text</span>
                </label>
                <div className="ai-input-password-wrapper">
                  <input
                    id="cloud-key"
                    type={showApiKey ? 'text' : 'password'}
                    className="ai-form-input ai-form-input--key"
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
                    {showApiKey ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="ai-form-group">
                <label className="ai-form-label" htmlFor="cloud-model">
                  <span>Model Identifier</span>
                </label>
                <div className="ai-input-wrapper">
                  <input
                    id="cloud-model"
                    type="text"
                    className="ai-form-input"
                    value={cloudModel}
                    onChange={(e) => setCloudModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Testing State */}
          {isTesting && (
            <div className="ai-test-banner ai-test-banner--testing">
              <span className="output-spinner" aria-hidden="true" />
              <span>Pinging provider endpoint and validating model handshake…</span>
            </div>
          )}

          {/* Test Connection Results Banner */}
          {!isTesting && testResult && (
            <div
              className={`ai-test-banner ${testResult.success ? 'ai-test-banner--success' : 'ai-test-banner--error'}`}
              role="status"
            >
              <div className="ai-test-banner__header">
                <div className="ai-test-banner__status">
                  <span className="ai-test-banner__dot" />
                  <strong>{testResult.success ? 'Handshake Successful' : 'Connection Handshake Failed'}</strong>
                </div>
                {testResult.latency_ms > 0 && (
                  <span className="ai-test-banner__latency">{testResult.latency_ms} ms</span>
                )}
              </div>
              <p className="ai-test-banner__msg">{testResult.message}</p>
            </div>
          )}

          {/* Save Success Toast */}
          {saveSuccess && (
            <div className="ai-test-banner ai-test-banner--saved" role="status">
              <div className="ai-test-banner__status">
                <span className="ai-test-banner__dot" />
                <strong>Configuration Saved</strong>
              </div>
              <p className="ai-test-banner__msg">{saveSuccess}</p>
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {isTesting ? 'Probing Endpoint…' : 'Test Connection'}
          </button>

          <div className="ai-modal__footer-actions">
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
              className="btn btn--primary"
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
