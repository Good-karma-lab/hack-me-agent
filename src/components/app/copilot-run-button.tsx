"use client";

import { useFormStatus } from "react-dom";

type CopilotRunButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

function SubmitButton({ idleLabel, pendingLabel }: CopilotRunButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      data-testid="run-copilot-submit"
      disabled={pending}
      className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function CopilotRunButton(props: CopilotRunButtonProps) {
  return <SubmitButton {...props} />;
}
