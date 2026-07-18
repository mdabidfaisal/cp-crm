export default function Modal({ open, onClose, title, children, className = 'max-w-md' }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${className}`} onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="font-semibold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
