import type { CredentialField } from "./model";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CredentialInputProps {
  field: CredentialField;
  value: string;
  onChange(value: string): void;
  /** Overrides the field placeholder, for example to say a saved secret is kept when left blank. */
  placeholder?: string;
  /** Overrides the field requirement, for example when a saved secret already satisfies it. */
  required?: boolean;
  /** Shows a secret single-line value as plain text after the user asks to reveal it. */
  revealed?: boolean;
  /** Controls shown under the input, such as reveal or clear buttons for a saved secret. */
  actions?: ReactNode;
}

export function CredentialInput(props: CredentialInputProps): ReactNode {
  const placeholder = props.placeholder ?? props.field.placeholder;
  const required = props.required ?? props.field.required;
  return (
    <Label className="field">
      <span>{props.field.label}</span>
      {props.field.inputType === "textarea" || props.field.inputType === "json" ? (
        <Textarea
          className={cn(
            "min-h-24 resize-y font-mono text-xs leading-relaxed",
            // A textarea has no password type, so mask a hidden secret the way browsers mask password inputs.
            props.field.secret && props.revealed === false && "[-webkit-text-security:disc]",
          )}
          value={props.value}
          placeholder={placeholder}
          onChange={(event) => props.onChange(event.target.value)}
          required={required}
          spellCheck={false}
        />
      ) : (
        <Input
          type={props.field.secret && !props.revealed ? "password" : "text"}
          placeholder={placeholder}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          required={required}
        />
      )}
      {props.actions ? <div className="flex flex-wrap gap-2">{props.actions}</div> : null}
      {props.field.description ? <small>{props.field.description}</small> : null}
    </Label>
  );
}
