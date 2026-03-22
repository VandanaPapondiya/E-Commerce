import React from "react";

function ErrorMessage({ message, type = "danger", onClose, autoClose = true }) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose]);

  if (!message) return null;

  const alertClass = `alert alert-${type} alert-dismissible fade show`;

  return (
    <div className={alertClass} role="alert">
      {type === "success" && <strong>✅ Success!</strong>}
      {type === "danger" && <strong>❌ Error!</strong>}
      {type === "warning" && <strong>⚠️ Warning!</strong>}
      {type === "info" && <strong>ℹ️ Info</strong>}
      <span className="ms-2">{message}</span>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
}

export default ErrorMessage;