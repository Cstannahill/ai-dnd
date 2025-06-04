import { Textarea } from "../ui/textarea";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptEditor({ value, onChange, disabled }: PromptEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground mb-1">
        Custom Prompt
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your campaign tone, important NPCs, etc..."
        className="min-h-[120px] bg-card border border-border text-primary"
        disabled={disabled}
      />
    </div>
  );
}
