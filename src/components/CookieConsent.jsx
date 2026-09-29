import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'salespilot_cookie_consent';
const CONSENT_VERSION = '1.0.0';

const COOKIE_CATEGORIES = [
  {
    id: 'necessary',
    name: '必要性 Cookie',
    nameEn: 'Strictly Necessary',
    description: '維持網站基本功能、安全性驗證、語系設定及網路傳輸所必需的 Cookie。此類別無法停用。',
    locked: true,
    defaultVal: true,
  },
  {
    id: 'analytics',
    name: '分析與效能 Cookie',
    nameEn: 'Analytics & Performance',
    description: '匿名統計與分析造訪頻率、流量來源及熱門功能，協助我們持續改良使用者體驗與系統效能。',
    locked: false,
    defaultVal: true,
  },
  {
    id: 'marketing',
    name: '行銷與廣告 Cookie',
    nameEn: 'Marketing & Targeting',
    description: '用於追蹤跨站點互動，以便向您展示切合需求之專屬產品優惠、促銷資訊與動態推薦。',
    locked: false,
    defaultVal: false,
  },
  {
    id: 'preferences',
    name: '偏好與個人化 Cookie',
    nameEn: 'Preferences & Personalization',
    description: '記錄您的介面客製化設定（如折疊狀態、主題視覺偏好等），提供更一致順暢的個人化操作。',
    locked: false,
    defaultVal: true,
  },
];

export default function CookieConsent() {
  const [hasConsented, setHasConsented] = useState(true); // default true to avoid flash on mount
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isBannerExiting, setIsBannerExiting] = useState(false);
  const [isModalExiting, setIsModalExiting] = useState(false);

  // Preference selections state
  const [categories, setCategories] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true,
  });

  // Read stored preferences on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === CONSENT_VERSION && parsed.categories) {
          setCategories((prev) => ({
            ...prev,
            ...parsed.categories,
            necessary: true, // always strictly true
          }));
          setHasConsented(true);
          setShowBanner(false);
          return;
        }
      }
    } catch {
      // ignore parse error and proceed to show banner
    }

    setHasConsented(false);
    // Slight delay for smooth slide-in entrance
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Save preferences helper
  const saveConsent = useCallback((newCategories) => {
    const payload = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: {
        ...newCategories,
        necessary: true,
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Unable to save cookie consent to localStorage', e);
    }

    setCategories(payload.categories);
    setHasConsented(true);
  }, []);

  // Accept all handler
  const handleAcceptAll = useCallback(() => {
    const allApproved = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allApproved);
    dismissBanner();
    closeModal();
  }, [saveConsent]);

  // Reject non-essential (Necessary only) handler
  const handleAcceptNecessary = useCallback(() => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(necessaryOnly);
    dismissBanner();
    closeModal();
  }, [saveConsent]);

  // Save modal choices handler
  const handleSavePreferences = useCallback(() => {
    saveConsent(categories);
    closeModal();
    dismissBanner();
  }, [saveConsent, categories]);

  // Animated banner dismissal
  const dismissBanner = () => {
    setIsBannerExiting(true);
    setTimeout(() => {
      setShowBanner(false);
      setIsBannerExiting(false);
    }, 350);
  };

  // Open modal
  const openModal = useCallback(() => {
    setIsModalExiting(false);
    setShowModal(true);
  }, []);

  // Animated modal close
  const closeModal = useCallback(() => {
    setIsModalExiting(true);
    setTimeout(() => {
      setShowModal(false);
      setIsModalExiting(false);
    }, 300);
  }, []);

  // Toggle category
  const toggleCategory = (id) => {
    if (id === 'necessary') return; // cannot toggle necessary
    setCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Keyboard navigation & ESC key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal, closeModal]);

  // Listen to custom open events or clicks on cookie links across the page
  useEffect(() => {
    const handleCustomOpen = () => openModal();
    window.addEventListener('open-cookie-preferences', handleCustomOpen);

    const handleDocumentClick = (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      const href = target.getAttribute('href');
      const text = target.textContent || '';
      if (
        href === '#cookie-settings' ||
        href === '#cookie-preferences' ||
        text.includes('Cookie 政策') ||
        text.includes('Cookie 設定') ||
        text.includes('Cookie 偏好')
      ) {
        e.preventDefault();
        openModal();
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('open-cookie-preferences', handleCustomOpen);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [openModal]);

  return (
    <>
      {/* 1. Persistent Floating Button (Visible once consented or banner dismissed) */}
      {hasConsented && !showBanner && (
        <button
          type="button"
          className="cookie-floating-trigger"
          onClick={openModal}
          aria-label="管理 Cookie 偏好設定"
          title="Cookie 偏好設定"
        >
          <span className="cookie-floating-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M7.5 15.5v.01" />
              <path d="M15.5 14.5v.01" />
              <path d="M11.5 12.5v.01" />
              <path d="M16 8v.01" />
            </svg>
          </span>
          <span className="cookie-floating-label">Cookie 偏好</span>
        </button>
      )}

      {/* 2. Floating Cookie Banner */}
      {showBanner && (
        <aside
          className={`cookie-banner ${isBannerExiting ? 'cookie-banner--exit' : 'cookie-banner--enter'}`}
          aria-label="隱私權與 Cookie 同意橫幅"
          role="region"
        >
          <div className="cookie-banner__inner">
            <div className="cookie-banner__header">
              <div className="cookie-banner__badge">
                <span className="cookie-badge-icon" aria-hidden="true">🍪</span>
                <span>隱私權與 Cookie 設定</span>
              </div>
              <p className="cookie-banner__desc">
                我們使用 Cookie 與相關技術來改善您的瀏覽體驗、提供個人化內容並分析流量。點擊「全部接受」即表示同意我們依據
                <a href="#cookie-settings" onClick={(e) => { e.preventDefault(); openModal(); }} className="cookie-banner__link">
                  Cookie 政策
                </a>
                使用所有 Cookie。您也可以隨時自訂細項偏好。
              </p>
            </div>

            <div className="cookie-banner__actions">
              <button
                type="button"
                className="cookie-btn cookie-btn--ghost"
                onClick={openModal}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                自訂偏好設定
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn--secondary"
                onClick={handleAcceptNecessary}
              >
                僅必要 Cookie
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn--primary"
                onClick={handleAcceptAll}
              >
                全部接受
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Custom Preferences Modal */}
      {showModal && (
        <div
          className={`cookie-modal-backdrop ${isModalExiting ? 'cookie-modal--fade-out' : 'cookie-modal--fade-in'}`}
          onClick={closeModal}
          role="presentation"
        >
          <div
            className={`cookie-modal-card ${isModalExiting ? 'cookie-modal-card--exit' : 'cookie-modal-card--enter'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="cookie-modal-header">
              <div className="cookie-modal-header__title-group">
                <span className="cookie-modal-icon" aria-hidden="true">🛡️</span>
                <div>
                  <h2 id="cookie-modal-title" className="cookie-modal-title">
                    Cookie 偏好設定
                  </h2>
                  <p className="cookie-modal-subtitle">
                    管理各類別 Cookie 的授權狀態。必要性 Cookie 為網站正常運作所需。
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cookie-modal-close-btn"
                onClick={closeModal}
                aria-label="關閉偏好設定視窗 (ESC)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Category List */}
            <div className="cookie-modal-body">
              <div className="cookie-categories-list">
                {COOKIE_CATEGORIES.map((cat) => {
                  const isChecked = !!categories[cat.id];
                  return (
                    <div key={cat.id} className="cookie-category-item">
                      <div className="cookie-category-header">
                        <div className="cookie-category-info">
                          <div className="cookie-category-name-row">
                            <h3 className="cookie-category-name">{cat.name}</h3>
                            <span className="cookie-category-name-en">{cat.nameEn}</span>
                            {cat.locked && (
                              <span className="cookie-badge-locked">始終啟用</span>
                            )}
                          </div>
                          <p className="cookie-category-desc">{cat.description}</p>
                        </div>

                        {/* Modern Toggle Switch */}
                        <div className="cookie-toggle-wrapper">
                          <label className="cookie-switch">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={cat.locked}
                              onChange={() => toggleCategory(cat.id)}
                              aria-label={`切換 ${cat.name}`}
                            />
                            <span className={`cookie-slider ${cat.locked ? 'cookie-slider--locked' : ''}`} />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="cookie-modal-footer">
              <div className="cookie-modal-footer__compliance">
                <span>符合 GDPR / CCPA 隱私法規準則</span>
              </div>
              <div className="cookie-modal-footer__actions">
                <button
                  type="button"
                  className="cookie-btn cookie-btn--secondary"
                  onClick={handleAcceptNecessary}
                >
                  僅允許必要
                </button>
                <button
                  type="button"
                  className="cookie-btn cookie-btn--primary-outline"
                  onClick={handleSavePreferences}
                >
                  儲存自訂偏好
                </button>
                <button
                  type="button"
                  className="cookie-btn cookie-btn--primary"
                  onClick={handleAcceptAll}
                >
                  全部接受
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
