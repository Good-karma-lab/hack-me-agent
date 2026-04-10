"use client";

import { useEffect, useMemo, useState } from "react";

type ChatMessageProps = {
  body: string;
  animate?: boolean;
};

export function ChatMessage({ body, animate = false }: ChatMessageProps) {
  const [visibleBody, setVisibleBody] = useState(animate ? "" : body);

  useEffect(() => {
    if (!animate) {
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index += 6;
      setVisibleBody(body.slice(0, index));

      if (index >= body.length) {
        window.clearInterval(interval);
      }
    }, 18);

    return () => window.clearInterval(interval);
  }, [animate, body]);

  const renderedBody = animate ? visibleBody : body;
  const renderedParagraphs = useMemo(() => renderedBody.split("\n\n"), [renderedBody]);

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-100">
      {renderedParagraphs.map((paragraph, index) => (
        <p key={`${paragraph}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}
