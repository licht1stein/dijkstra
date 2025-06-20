import { h } from 'preact';

export function ConnectionEditor({ 
  selectedConnection, 
  editValue, 
  onEditValueChange, 
  onUpdate, 
  onCancel 
}) {
  if (!selectedConnection) return null;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onUpdate();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  return (
    <div className="connection-editor">
      <div className="connection-editor__content">
        <span className="connection-editor__label">
          Edit connection weight:
        </span>
        <div className="connection-editor__controls">
          <input
            type="number"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="connection-editor__input"
            min="1"
            step="1"
            autoFocus
          />
          <button
            onClick={onUpdate}
            className="btn btn--warning btn--sm"
          >
            Update
          </button>
          <button
            onClick={onCancel}
            className="btn btn--secondary btn--sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}