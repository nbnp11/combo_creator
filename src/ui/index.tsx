import { useState } from "react";

/** Палитра цветов (8) — единый набор для всех цветовых полей. Контрастны на зелёном поле. */
export const COLORS = [
  "#1e88e5",
  "#e53935",
  "#ffffff",
  "#1a1a1a",
  "#fdd835",
  "#fb8c00",
  "#8e24aa",
  "#00acc1",
] as const;

export type ButtonVariant = "default" | "danger" | "active";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

/** Плоская текстовая кнопка тулбара. */
export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
  const v = variant === "default" ? "" : `pb-btn--${variant}`;
  return <button type="button" className={`pb-btn ${v} ${className}`.trim()} {...props} />;
}

/** Акцентная CTA-кнопка (Экспорт GIF). */
export function Cta({ className = "", ...props }: ButtonProps) {
  return <button type="button" className={`pb-cta ${className}`.trim()} {...props} />;
}

/** Группа тулбара с микро-подписью; разделители — border-left у группы. */
export function ButtonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-group">
      <span className="pb-glabel">{label}</span>
      {children}
    </div>
  );
}

/** Поле с подписью. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-field">
      <span className="pb-flabel">{label}</span>
      {children}
    </div>
  );
}

/** Ряд из двух полей. */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="pb-row">{children}</div>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="pb-ctrl" {...props} />;
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" className="pb-ctrl" {...props} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="pb-ctrl" {...props}>
      {children}
    </select>
  );
}

/** Заголовок сайдбара. */
export function SideHead({ children }: { children: React.ReactNode }) {
  return <div className="pb-side-head">{children}</div>;
}

/** Мелкая кнопка действия в строке слоя (↑/↓/×). */
export function ActionButton({
  variant = "default",
  className = "",
  ...props
}: Omit<ButtonProps, "variant"> & { variant?: "default" | "del" }) {
  const v = variant === "del" ? "pb-act--del" : "";
  return <button type="button" className={`pb-act ${v}`.trim()} {...props} />;
}

/** Палитра из 8 цветов; выбранный свотч — по совпадению hex (без учёта регистра). */
export function Palette({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const current = value.toLowerCase();
  return (
    <div className="pb-palette">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className="pb-sw"
          data-on={current === c.toLowerCase()}
          style={{ background: c }}
          onClick={() => onChange(c)}
          title={c}
          aria-label={`Цвет ${c}`}
        />
      ))}
    </div>
  );
}

export function Caret() {
  return <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 1 }}>▾</span>;
}

/** Кнопка с выпадающим меню (Файл → Сохранить/Открыть JSON|YAML). */
export function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pb-dd">
      <Button onClick={() => setOpen((o) => !o)}>
        {label} <Caret />
      </Button>
      {open && (
        <>
          <div className="pb-dd-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <div className="pb-dd-menu" role="menu">
            {items.map((it) => (
              <button
                key={it.label}
                type="button"
                className="pb-dd-item"
                onClick={() => {
                  setOpen(false);
                  it.onClick();
                }}
              >
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
