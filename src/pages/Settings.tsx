import {
  ArrowRight,
  Download,
  FileJson,
  FileText,
  HardDrive,
  Info,
  Monitor,
  Moon,
  Smartphone,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Switch } from '@/components/ui/Switch';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { APP_VERSION, REPO_URL } from '@/lib/constants';
import { datedFilename, downloadText } from '@/lib/download';
import {
  BackupError,
  exportFavouritesAsMarkdown,
  exportLibraryAsJson,
  parseBackup,
  summariseBackup,
  type ParsedBackup,
} from '@/lib/library';
import { useLibrary } from '@/providers/LibraryProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';
import type { FontScale, ThemePreference } from '@/types';

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { value: 'dark', label: 'Dark', description: 'Deep charcoal, warm gold', icon: Moon },
  { value: 'light', label: 'Light', description: 'Warm paper, deep ink', icon: Sun },
  { value: 'system', label: 'System', description: 'Follow your device', icon: Monitor },
];

const fontOptions: Array<{ value: FontScale; label: string }> = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Default' },
  { value: 'lg', label: 'Large' },
];

export default function Settings() {
  useDocumentTitle('Settings');
  const { settings, setTheme, setFontScale, setMotion, setShowDisputed } = useSettings();
  const { library, mergeImportedLibrary, clearLibrary, storageAvailable, persistFailed } =
    useLibrary();
  const { addToast } = useToast();
  const { canInstall, isStandalone, promptInstall } = useInstallPrompt();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [pendingImport, setPendingImport] = useState<ParsedBackup | null>(null);
  const [importError, setImportError] = useState('');
  const [clearOpen, setClearOpen] = useState(false);

  const notes = library.favourites.filter((favourite) => Boolean(favourite.note)).length;
  const preview = pendingImport ? summariseBackup(pendingImport) : null;
  const hasData =
    library.favourites.length +
      library.collections.length +
      library.history.length +
      library.advice.length +
      library.reflections.length >
    0;

  const exportJson = () => {
    downloadText(
      exportLibraryAsJson(library, settings),
      datedFilename('lin4cre-quotes-backup', 'json'),
    );
    addToast({
      title: 'Backup downloaded',
      description: 'JSON with favourites, notes, collections, reflections, history and advice.',
      variant: 'success',
    });
  };

  const exportMarkdown = () => {
    downloadText(
      exportFavouritesAsMarkdown(library),
      datedFilename('lin4cre-quotes-favourites', 'md'),
      'text/markdown',
    );
    addToast({ title: 'Favourites downloaded as Markdown', variant: 'success' });
  };

  const reviewBackup = (text: string) => {
    try {
      const parsed = parseBackup(text);
      setPendingImport(parsed);
      setImportOpen(true);
      setImportError('');
    } catch (reason) {
      setPendingImport(null);
      setImportOpen(true);
      setImportError(
        reason instanceof BackupError ? reason.message : 'That backup could not be imported.',
      );
    }
  };

  const applyBackup = () => {
    if (!pendingImport) return;
    const incoming = pendingImport;
    mergeImportedLibrary(incoming.library);
    setImportOpen(false);
    setPendingImport(null);
    setImportText('');
    setImportError('');
    addToast({
      title: 'Backup imported',
      description: `${incoming.library.favourites.length} favourites, ${incoming.library.collections.length} collections and ${incoming.library.reflections.length} reflections merged.`,
      variant: 'success',
    });
    for (const warning of incoming.warnings) {
      addToast({ title: 'Import note', description: warning, variant: 'info' });
    }
  };

  const onFileChosen = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5_000_000) {
      setPendingImport(null);
      setImportError('That file is too large to be a LIN4CRE QUOTES backup.');
      setImportOpen(true);
      return;
    }
    const text = await file.text();
    reviewBackup(text);
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      addToast({
        title: 'Installation started',
        description: 'LIN4CRE QUOTES is being added to your device.',
        variant: 'success',
      });
    } else if (outcome === 'unavailable') {
      addToast({
        title: 'Install from your browser menu',
        description: 'Use the browser menu and choose “Install app” or “Add to Home Screen”.',
        variant: 'info',
      });
    }
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="App"
        title="Settings"
        description="Appearance, data and installation. Nothing here requires an account, and no personal data is collected."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="appearance-heading"
          >
            <h2 id="appearance-heading" className="text-lg font-semibold text-ink">
              Appearance
            </h2>
            <p className="mt-1 text-[12px] text-muted">
              These preferences are saved in this browser.
            </p>

            <fieldset className="mt-5">
              <legend className="label-caps">Theme</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = settings.theme === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition',
                        active
                          ? 'border-accent/50 bg-accent-soft'
                          : 'border-line bg-surface-2 hover:border-line-strong',
                      )}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={option.value}
                        checked={active}
                        onChange={() => setTheme(option.value)}
                        className="sr-only"
                      />
                      <Icon
                        className={cn('size-4', active ? 'text-accent' : 'text-muted')}
                        aria-hidden
                      />
                      <span className="text-[12.5px] font-medium text-ink">{option.label}</span>
                      <span className="text-[10.5px] leading-snug text-subtle">
                        {option.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="label-caps">Text size</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {fontOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFontScale(option.value)}
                    aria-pressed={settings.fontScale === option.value}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-[12.5px] font-medium transition',
                      settings.fontScale === option.value
                        ? 'border-accent/50 bg-accent-soft text-accent'
                        : 'border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 font-serif text-[15px] text-muted">
                “The limits of my language mean the limits of my world.”
              </p>
            </fieldset>

            <div className="mt-5 space-y-4 border-t border-line pt-4">
              <Switch
                id="reduce-motion"
                checked={settings.motion === 'reduced'}
                onChange={(checked) => setMotion(checked ? 'reduced' : 'system')}
                label="Reduce motion"
                description="Turns off entrance animations and transitions. The app also follows your operating system's reduced-motion setting automatically."
              />
              <Switch
                id="show-disputed"
                checked={settings.showDisputed}
                onChange={setShowDisputed}
                label="Show disputed attributions"
                description="Disputed quotes are always labelled. Turn this off to hide them from browsing lists."
              />
            </div>
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="data-heading"
          >
            <h2 id="data-heading" className="text-lg font-semibold text-ink">
              Library and data
            </h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted">
              Your library is stored in this browser using local storage. It is not uploaded and
              does not sync between devices. Export a backup to move it somewhere else.
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { label: 'Favourites', value: library.favourites.length },
                { label: 'Collections', value: library.collections.length },
                { label: 'Reflections', value: library.reflections.length },
                { label: 'Notes', value: notes },
                { label: 'Advice', value: library.advice.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-line bg-surface-2 px-3 py-2.5"
                >
                  <dt className="text-[10px] tracking-wide text-subtle uppercase">{stat.label}</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-ink tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            {!storageAvailable || persistFailed ? (
              <p
                className="mt-4 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2 text-[11.5px] text-danger"
                role="alert"
              >
                Storage is unavailable, so changes are not being saved. Check private browsing or
                site data settings.
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportJson} disabled={!hasData}>
                <FileJson className="size-4" aria-hidden />
                Export backup
              </Button>
              <Button
                variant="outline"
                onClick={exportMarkdown}
                disabled={library.favourites.length === 0}
              >
                <FileText className="size-4" aria-hidden />
                Favourites as Markdown
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" aria-hidden />
                Import backup
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setPendingImport(null);
                  setImportError('');
                  setImportOpen(true);
                }}
              >
                Paste JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                aria-label="Choose a backup file"
                onChange={(event) => {
                  void onFileChosen(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </div>

            <p className="mt-3 flex items-start gap-2 text-[10.5px] leading-relaxed text-subtle">
              <Download className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Imports are merged, never destructive: existing favourites and notes win, and matching
              collection names are combined.
            </p>

            {hasData ? (
              <div className="mt-5 border-t border-line pt-4">
                <Button variant="danger" onClick={() => setClearOpen(true)}>
                  <Trash2 className="size-4" aria-hidden />
                  Clear all saved data
                </Button>
                <p className="mt-2 text-[10.5px] text-subtle">
                  Removes favourites, collections, reflections, notes, history and saved advice from
                  this browser.
                </p>
              </div>
            ) : null}
          </section>

          <section
            className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
            aria-labelledby="install-heading"
          >
            <h2 id="install-heading" className="text-lg font-semibold text-ink">
              Install the app
            </h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted">
              LIN4CRE QUOTES is a progressive web app. Once installed it opens in its own window,
              works offline with your saved library, and updates itself.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {isStandalone ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[12px] text-success">
                  <Smartphone className="size-4" aria-hidden />
                  Installed on this device
                </span>
              ) : (
                <Button onClick={() => void handleInstall()} disabled={!canInstall}>
                  <Smartphone className="size-4" aria-hidden />
                  {canInstall ? 'Install app' : 'Use your browser’s install option'}
                </Button>
              )}
            </div>

            <div className="mt-4 grid gap-2 text-[11px] leading-relaxed text-subtle sm:grid-cols-3">
              <p>
                <span className="font-medium text-muted">iPhone / iPad:</span> Share menu → Add to
                Home Screen.
              </p>
              <p>
                <span className="font-medium text-muted">Android:</span> Browser menu → Install app
                or Add to Home Screen.
              </p>
              <p>
                <span className="font-medium text-muted">Desktop:</span> Look for the install icon
                in the address bar.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="label-caps flex items-center gap-2">
              <HardDrive className="size-3.5" aria-hidden />
              Storage
            </h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Everything is kept locally. Clearing your browser’s site data will remove your
              library, so export a backup first.
            </p>
            <Link
              to="/about"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-accent transition hover:underline"
            >
              Privacy details
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="label-caps flex items-center gap-2">
              <Info className="size-3.5" aria-hidden />
              About
            </h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              {APP_VERSION} · built with React, TypeScript, Vite and Tailwind CSS.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-accent transition hover:underline"
            >
              View source on GitHub
              <ArrowRight className="size-3" aria-hidden />
            </a>
          </div>
        </aside>
      </div>

      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportError('');
        }}
        title="Import a backup"
        description="Paste or choose a LIN4CRE QUOTES JSON backup. You will see a summary before anything is merged."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setImportOpen(false);
                setPendingImport(null);
                setImportText('');
                setImportError('');
              }}
            >
              Cancel
            </Button>
            {pendingImport ? (
              <Button onClick={applyBackup}>
                Import{' '}
                {preview ? preview.favourites + preview.collections + preview.reflections : 0} saved
                items
              </Button>
            ) : (
              <Button onClick={() => reviewBackup(importText)} disabled={!importText.trim()}>
                Review import
              </Button>
            )}
          </>
        }
      >
        {preview ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">Ready to merge</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                Nothing has changed yet. Existing notes win, matching collection names are combined,
                and reflections with the same id are kept once.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: 'Favourites', value: preview.favourites },
                { label: 'Notes', value: preview.notes },
                { label: 'Collections', value: preview.collections },
                { label: 'Reflections', value: preview.reflections },
                { label: 'History', value: preview.history },
                { label: 'Advice', value: preview.advice },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-line bg-surface-2 px-3 py-2.5"
                >
                  <dt className="text-[10px] tracking-wide text-subtle uppercase">{item.label}</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-ink tabular-nums">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            {preview.warnings.length > 0 ? (
              <ul className="space-y-1.5 rounded-xl border border-warning/30 bg-warning/5 p-3 text-[11px] leading-relaxed text-warning">
                {preview.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <>
            <label htmlFor="backup-json" className="label-caps">
              Backup JSON
            </label>
            <textarea
              id="backup-json"
              value={importText}
              onChange={(event) => {
                setImportText(event.target.value);
                setImportError('');
              }}
              rows={8}
              placeholder='{"app":"lin4cre-quotes","schemaVersion":3,…}'
              className="field mt-2 resize-y font-mono text-[11px] leading-relaxed"
              aria-invalid={Boolean(importError)}
              aria-describedby={importError ? 'backup-error' : undefined}
            />
            {importError ? (
              <p id="backup-error" role="alert" className="mt-2 text-xs text-danger">
                {importError}
              </p>
            ) : null}
          </>
        )}
      </Modal>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear all saved data?"
        description="This removes every saved quote, collection, note, reflection, history entry and advice entry from this browser. Settings are kept."
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearLibrary();
                setClearOpen(false);
                addToast({
                  title: 'Library cleared',
                  description: 'Your saved data has been removed.',
                  variant: 'info',
                });
              }}
            >
              Clear everything
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          This cannot be undone. Export a backup first if you might want this data later.
        </p>
        {hasData ? (
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              exportJson();
              setClearOpen(false);
            }}
          >
            <Download className="size-4" aria-hidden />
            Export a backup first
          </Button>
        ) : null}
      </Modal>
    </div>
  );
}
