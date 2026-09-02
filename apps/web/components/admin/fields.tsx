'use client';

import type { ChangeEvent, ReactNode } from 'react';

/** Shared labelled field row for console editors. */
export function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
    return (
        <label className={`admin-field ${wide ? 'admin-field-wide' : ''}`}>
            <span>{label}</span>
            {children}
        </label>
    );
}

type TextProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: 'text' | 'url' | 'number' | 'datetime-local';
    placeholder?: string;
    required?: boolean;
    wide?: boolean;
};

export function TextInput({ label, value, onChange, type = 'text', placeholder, required, wide }: TextProps) {
    return (
        <Field label={label} wide={wide}>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            />
        </Field>
    );
}

export function TextArea({
    label,
    value,
    onChange,
    rows = 4,
    required,
    wide = true,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    required?: boolean;
    wide?: boolean;
}) {
    return (
        <Field label={label} wide={wide}>
            <textarea rows={rows} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
        </Field>
    );
}

export function Checkbox({
    label,
    checked,
    onChange,
    hint,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    hint?: string;
}) {
    return (
        <label className="admin-checkbox">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span>
                {label}
                {hint && <em>{hint}</em>}
            </span>
        </label>
    );
}
