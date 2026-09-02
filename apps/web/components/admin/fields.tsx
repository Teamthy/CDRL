'use client';

import type { ChangeEvent, ReactNode } from 'react';

/** Shared labelled field row for console editors. */
export function Field({
    label,
    children,
    wide,
    hint,
    error,
}: {
    label: string;
    children: ReactNode;
    wide?: boolean;
    hint?: string;
    error?: string;
}) {
    return (
        <label className={`admin-field ${wide ? 'admin-field-wide' : ''} ${error ? 'admin-field-error' : ''}`.trim()}>
            <span>{label}</span>
            {children}
            {error ? <em className="admin-field-err-text">{error}</em> : hint ? <em className="admin-field-hint">{hint}</em> : null}
        </label>
    );
}

type TextProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: 'text' | 'url' | 'number' | 'datetime-local' | 'email' | 'tel';
    placeholder?: string;
    required?: boolean;
    wide?: boolean;
    hint?: string;
    list?: string;
};

export function TextInput({ label, value, onChange, type = 'text', placeholder, required, wide, hint, list }: TextProps) {
    return (
        <Field label={label} wide={wide} hint={hint}>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                required={required}
                list={list}
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
    placeholder,
    hint,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    required?: boolean;
    wide?: boolean;
    placeholder?: string;
    hint?: string;
}) {
    return (
        <Field label={label} wide={wide} hint={hint}>
            <textarea
                rows={rows}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={(e) => onChange(e.target.value)}
            />
        </Field>
    );
}

type SelectProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: readonly string[] | { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
    wide?: boolean;
    hint?: string;
};

/** Shared dropdown — unified chevron styling comes from globals.css (.admin-field select). */
export function Select({ label, value, onChange, options, placeholder, required, wide, hint }: SelectProps) {
    return (
        <Field label={label} wide={wide} hint={hint}>
            <select value={value} onChange={(e) => onChange(e.target.value)} required={required}>
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((o) =>
                    typeof o === 'string' ? (
                        <option key={o} value={o}>
                            {o}
                        </option>
                    ) : (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ),
                )}
            </select>
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
