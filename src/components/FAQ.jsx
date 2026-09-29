import { useState } from 'react';
import { FAQ_DATA } from '../data/faqData';

function FAQ() {
    // 預設展開第一項
    const [openId, setOpenId] = useState(FAQ_DATA[0]?.id || null);

    const toggleItem = (id) => {
        setOpenId((prevId) => (prevId === id ? null : id));
    };

    return (
        <section className="faq" id="faq" aria-labelledby="faq-title">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__badge">常見問題</span>
                    <h2 id="faq-title" className="section-header__title">
                        解答您所有的導入與使用疑惑
                    </h2>
                    <p className="section-header__desc">
                        還有其他疑問？歡迎隨時聯繫我們的產品顧問，我們將在第一時間為您解答。
                    </p>
                </div>

                <div className="faq__container">
                    <div className="faq__accordion">
                        {FAQ_DATA.map((item) => {
                            const isOpen = openId === item.id;
                            const headerId = `faq-header-${item.id}`;
                            const panelId = `faq-panel-${item.id}`;

                            return (
                                <div
                                    key={item.id}
                                    className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}
                                >
                                    <h3>
                                        <button
                                            type="button"
                                            id={headerId}
                                            className="faq__trigger"
                                            onClick={() => toggleItem(item.id)}
                                            aria-expanded={isOpen}
                                            aria-controls={panelId}
                                        >
                                            <span className="faq__question">{item.question}</span>
                                            <span className="faq__icon-wrapper" aria-hidden="true">
                                                <svg
                                                    className="faq__icon"
                                                    viewBox="0 0 24 24"
                                                    width="20"
                                                    height="20"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </span>
                                        </button>
                                    </h3>

                                    <div
                                        id={panelId}
                                        className="faq__collapse"
                                        role="region"
                                        aria-labelledby={headerId}
                                    >
                                        <div className="faq__body">
                                            <p className="faq__answer">{item.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FAQ;
