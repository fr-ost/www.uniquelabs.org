"use client";

import { useEffect, useRef } from "react";
import { markMessageRead } from "@/server/actions/site";

/** Marks a message as read once it has actually been displayed to an admin. */
export function MarkMessageRead({ id }: { id: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void markMessageRead(id);
  }, [id]);
  return null;
}
