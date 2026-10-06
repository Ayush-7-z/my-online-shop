import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./ImageViewer.css";

function ImageViewer({ src, onClose }) {
  const touch = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="image-viewer-overlay"
      onClick={onClose}
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dy) > 80) onClose(); // swipe down/up to dismiss
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button className="image-viewer-close" onClick={onClose} type="button" aria-label="Close image viewer">✕</button>
      <img className="image-viewer-img" src={src} alt="Product preview" onClick={(e) => e.stopPropagation()}
        onError={(e) => { e.target.onerror = null; e.target.src = "/images/placeholder.svg"; }} />
    </div>,
    document.body
  );
}

export default ImageViewer;
