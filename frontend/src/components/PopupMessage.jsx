import { useEffect, useRef } from "react";
import "../styles/PopupMessage.css";

const ICONS = { success: "✓", error: "✕", info: "!" };

function PopupMessage({
  type = "success",
  title,
  message,
  detail,
  buttonText = "OK",
  onClose,
  secondaryText,
  onSecondary,
  closeOnOverlay = true,
}) {
  const buttonRef = useRef(null);
  const dismiss = onSecondary || onClose;

  useEffect(() => {
    buttonRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") dismiss();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  return (
    <div
      className="sp-overlay"
      onClick={closeOnOverlay ? dismiss : undefined}
    >
      <div
        className="sp-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sp-icon ${type}`}>{ICONS[type] || "✓"}</div>

        <h3>{title}</h3>
        <p>{message}</p>
        {detail && <div className="sp-detail">{detail}</div>}

        <div className="sp-actions">
          {secondaryText && (
            <button type="button" className="sp-secondary" onClick={onSecondary}>
              {secondaryText}
            </button>
          )}

          <button type="button" ref={buttonRef} onClick={onClose}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopupMessage;