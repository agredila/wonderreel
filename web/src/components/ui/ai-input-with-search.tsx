'use client';

import * as React from 'react';

type AIInputWithSearchProps = {
  onSubmit?: (value: string) => void;
  onFileSelect?: (file: File) => void;
};

export function AIInputWithSearch({ onSubmit, onFileSelect }: AIInputWithSearchProps) {
  const [value, setValue] = React.useState('');

  return (
    <form
      className="rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/40"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit?.(trimmed);
      }}
    >
      <div className="flex flex-col gap-3">
        <textarea
          className="min-h-[84px] w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] text-black outline-none focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
          placeholder="Type your idea..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-black/70 dark:text-white/70">
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileSelect?.(file);
                }}
              />
              <span className="cursor-pointer rounded-full border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.04] dark:border-white/10 dark:hover:bg-white/[0.06]">
                Upload
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
          >
            Generate
          </button>
        </div>
      </div>
    </form>
  );
}
