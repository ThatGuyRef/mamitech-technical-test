"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { disclaimer, info } from "@/content/home";
import { KOS_CITIES, KOS_TYPES } from "@/data/kos";

const EMPTY_VALUES = {
  name: "",
  email: "",
  phone: "",
  contactMethod: "",
  city: "",
  type: "",
  message: "",
};

type Values = typeof EMPTY_VALUES;
type FieldName = keyof Values;
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_STEPS: FieldName[][] = [
  ["name", "email"],
  ["phone", "contactMethod"],
  ["city", "type", "message"],
];
const LAST_STEP = FIELD_STEPS.length - 1;

type SubmitResult =
  | { kind: "success"; message: string }
  | { kind: "invalid"; message: string; fields: FieldErrors }
  | { kind: "failed"; message: string };

async function postSubscribe(values: Values): Promise<SubmitResult> {
  let response: Response;
  try {
    response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
  } catch {
    return { kind: "failed", message: info.form.networkError };
  }

  const body = await response.json().catch(() => null);

  if (response.ok) {
    return { kind: "success", message: body?.message ?? info.form.successFallback };
  }

  const fields: FieldErrors =
    response.status === 409 ? { email: body?.error } : (body?.fields ?? {});

  if ((response.status === 400 || response.status === 409) && Object.keys(fields).length > 0) {
    return { kind: "invalid", message: body?.error, fields };
  }

  return {
    kind: "failed",
    message: body?.error ?? `Server membalas dengan status ${response.status}.`,
  };
}

function firstErrorField(fields: FieldErrors) {
  return FIELD_STEPS.flat().find((field) => fields[field]);
}

function stepOfField(field: FieldName) {
  return FIELD_STEPS.findIndex((fields) => fields.includes(field));
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: FieldName;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow text-white/70">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs leading-relaxed text-alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * A native select's popup cannot be sized, so options open in a modal instead: a bottom
 * sheet with large tap targets on phones and a centered dialog on bigger screens. As a
 * top-layer <dialog> it also stays correct inside the transformed smooth-scroll content.
 */
function SelectField({
  name,
  label,
  options,
  value,
  error,
  onChange,
}: {
  name: FieldName;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  function open() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    setIsOpen(true);
    dialog.querySelector<HTMLElement>('[aria-selected="true"], [role="option"]')?.focus();
  }

  function choose(nextValue: string) {
    onChange(nextValue);
    dialogRef.current?.close();
  }

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    const step = event.key === "ArrowDown" ? 1 : -1;
    const current = items.indexOf(document.activeElement as HTMLElement);
    items[(current + step + items.length) % items.length]?.focus();
  }

  return (
    <Field id={name} label={label} error={error}>
      <button
        type="button"
        id={name}
        name={name}
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="field-line mt-1 flex min-h-11 cursor-pointer items-center justify-between gap-3 text-left"
      >
        <span className={selected ? "" : "text-white/55"}>
          {selected?.label ?? info.form.choose}
        </span>
        <svg
          viewBox="0 0 12 8"
          aria-hidden
          className="w-3 shrink-0 fill-none stroke-current stroke-[1.5]"
        >
          <path d="m1 1.5 5 5 5-5" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={label}
        className="picker"
        onClose={() => setIsOpen(false)}
        // The dialog's own box is only reachable by clicking its backdrop.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-white/25 py-2 pr-2 pl-6">
          <p className="eyebrow">{label}</p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="min-h-11 cursor-pointer px-4 text-sm underline-offset-4 hover:underline"
          >
            {info.form.close}
          </button>
        </div>
        <div role="listbox" aria-label={label} onKeyDown={moveFocus}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => choose(option.value)}
              className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 border-b border-white/15 px-6 text-left text-[17px] transition-colors last:border-b-0 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none aria-selected:text-gold"
            >
              {option.label}
              {option.value === value && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      </dialog>
    </Field>
  );
}

const CITY_OPTIONS = KOS_CITIES.map((city) => ({ label: city, value: city }));
const TYPE_OPTIONS = KOS_TYPES.map((type) => ({
  label: type[0].toUpperCase() + type.slice(1),
  value: type,
}));

export function SubscribeForm() {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const pendingFocus = useRef<FieldName | null>(null);

  // A field can only take focus once its step has rendered.
  useEffect(() => {
    if (!pendingFocus.current) return;
    const field = formRef.current?.elements.namedItem(pendingFocus.current);
    if (field instanceof HTMLElement) field.focus();
    pendingFocus.current = null;
  });

  function goToStep(nextStep: number) {
    pendingFocus.current = FIELD_STEPS[nextStep][0];
    setFormError(null);
    setStep(nextStep);
  }

  function updateField(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function choiceProps(name: FieldName) {
    return {
      name,
      value: values[name],
      error: errors[name],
      onChange: (value: string) => updateField(name, value),
    };
  }

  function fieldProps(name: FieldName) {
    return {
      id: name,
      name,
      value: values[name],
      onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        updateField(name, event.target.value);
      },
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
      className: "field-line mt-1",
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    if (step < LAST_STEP) {
      goToStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    const result = await postSubscribe(values);
    setIsSubmitting(false);

    if (result.kind === "success") {
      setSuccessMessage(result.message);
      return;
    }

    if (result.kind === "failed") {
      setHasFailed(true);
      setFormError(result.message);
      return;
    }

    // Send the user back to the earliest step that needs fixing.
    setHasFailed(false);
    setErrors(result.fields);
    setFormError(result.message);
    const field = firstErrorField(result.fields);
    if (field) {
      pendingFocus.current = field;
      setStep(stepOfField(field));
    }
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setFormError(null);
    setHasFailed(false);
    setSuccessMessage(null);
    pendingFocus.current = "name";
    setStep(0);
  }

  const card = "bg-night/90 p-8 text-snow [color-scheme:dark]";

  if (successMessage) {
    return (
      <div role="status" className={card}>
        <p className="eyebrow border-b border-white/25 pb-3">{info.form.title}</p>
        <p className="display mt-8 text-5xl">{info.form.successTitle}</p>
        <p className="mt-4 text-sm leading-relaxed">{successMessage}</p>
        <button
          type="button"
          onClick={reset}
          className="eyebrow mt-8 h-12 w-full cursor-pointer rounded-full border border-white/50 transition-colors hover:border-gold hover:text-gold"
        >
          {info.form.again}
        </button>
        <p className="mt-6 text-[11px] leading-relaxed text-white/70">{disclaimer}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className={card}>
      <p className="eyebrow border-b border-white/25 pb-3">{info.form.title}</p>

      <ol className="mt-5 flex gap-2">
        {/* Shows position only. Validation errors belong to the fields themselves. */}
        {info.form.steps.map((label, index) => (
          <li
            key={label}
            aria-current={index === step ? "step" : undefined}
            className={`flex-1 border-t-2 pt-2 text-[9px] uppercase tracking-[0.14em] ${
              index === step
                ? "border-gold font-semibold text-snow"
                : index < step
                  ? "border-gold/50 text-white/80"
                  : "border-white/25 text-white/60"
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-7 space-y-6">
        {step === 0 && (
          <>
            <Field id="name" label={info.form.labels.name} error={errors.name}>
              <input type="text" autoComplete="name" {...fieldProps("name")} />
            </Field>
            <Field id="email" label={info.form.labels.email} error={errors.email}>
              <input type="email" autoComplete="email" {...fieldProps("email")} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field id="phone" label={info.form.labels.phone} error={errors.phone}>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="081234567890"
                {...fieldProps("phone")}
              />
            </Field>
            <SelectField
              {...choiceProps("contactMethod")}
              label={info.form.labels.contactMethod}
              options={info.form.contactMethods}
            />
          </>
        )}

        {step === 2 && (
          <>
            <SelectField
              {...choiceProps("city")}
              label={info.form.labels.city}
              options={CITY_OPTIONS}
            />
            <SelectField
              {...choiceProps("type")}
              label={info.form.labels.type}
              options={TYPE_OPTIONS}
            />
            <Field id="message" label={info.form.labels.message} error={errors.message}>
              <textarea rows={2} {...fieldProps("message")} />
            </Field>
          </>
        )}
      </div>

      {formError && (
        <p role="alert" className="mt-6 text-sm leading-relaxed text-alert">
          {formError}
        </p>
      )}

      <div className="mt-7 flex gap-2.5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goToStep(step - 1)}
            disabled={isSubmitting}
            className="eyebrow h-12 cursor-pointer rounded-full border border-white/50 px-6 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {info.form.back}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="eyebrow h-12 flex-1 cursor-pointer rounded-full bg-snow text-night transition-colors hover:bg-gold disabled:cursor-wait disabled:opacity-70"
        >
          {step < LAST_STEP
            ? info.form.next
            : isSubmitting
              ? info.form.submitting
              : hasFailed
                ? info.form.retry
                : info.form.submit}
        </button>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-white/70">{disclaimer}</p>
    </form>
  );
}
