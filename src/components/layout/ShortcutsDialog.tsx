import { Modal } from '@/components/ui/Modal';

const shortcuts = [
  { keys: '⌘ / Ctrl K', label: 'Open search and jump menu' },
  { keys: '/', label: 'Open search (when not typing)' },
  { keys: 'R', label: 'Jump to a random quote' },
  { keys: 'T', label: 'Cycle dark, light and system themes' },
  { keys: '← / →', label: 'Previous or next quote on Discover' },
  { keys: '?', label: 'Show this shortcut list' },
  { keys: 'Esc', label: 'Close a dialog or menu' },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-grid min-w-6 place-items-center rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted">
      {children}
    </kbd>
  );
}

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Keyboard shortcuts"
      description="Available anywhere in the app unless you are typing in a field."
      size="sm"
    >
      <ul className="divide-y divide-line">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.label} className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-[13px] text-muted">{shortcut.label}</span>
            <Kbd>{shortcut.keys}</Kbd>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
