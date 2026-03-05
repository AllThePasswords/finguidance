"use client";

import { useState, useCallback } from "react";
import { GuidanceRule, GuidanceCategory } from "./types";
import { SEED_RULES } from "./seed-data";

let nextId = 100;

export function useGuidanceStore() {
  const [rules, setRules] = useState<GuidanceRule[]>(SEED_RULES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [creatingCategory, setCreatingCategory] = useState<GuidanceCategory | null>(null);

  const rulesByCategory = useCallback(
    (cat: GuidanceCategory) => rules.filter((r) => r.category === cat),
    [rules]
  );

  const totalCount = rules.length;

  const startCreate = useCallback((category: GuidanceCategory) => {
    setCreatingCategory(category);
    setDraftContent("");
    setDraftTitle("");
    setEditingId(null);
  }, []);

  const startEdit = useCallback(
    (id: string) => {
      const rule = rules.find((r) => r.id === id);
      if (rule) {
        setEditingId(id);
        setDraftContent(rule.content);
        setDraftTitle(rule.title);
        setCreatingCategory(null);
      }
    },
    [rules]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setCreatingCategory(null);
    setDraftContent("");
    setDraftTitle("");
  }, []);

  const saveRule = useCallback(() => {
    if (editingId) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, title: draftTitle || r.title, content: draftContent, updatedAt: new Date().toISOString() }
            : r
        )
      );
      setEditingId(null);
    } else if (creatingCategory) {
      const newRule: GuidanceRule = {
        id: String(nextId++),
        category: creatingCategory,
        title: draftTitle || `Guidance #${nextId}`,
        content: draftContent,
        enabled: false,
        stats: { used: 0, resolvedPct: 0, routedPct: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRules((prev) => [...prev, newRule]);
      setCreatingCategory(null);
    }
    setDraftContent("");
    setDraftTitle("");
  }, [editingId, creatingCategory, draftContent, draftTitle]);

  const deleteRule = useCallback(
    (id: string) => {
      setRules((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraftContent("");
        setDraftTitle("");
      }
    },
    [editingId]
  );

  const toggleEnabled = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() } : r
      )
    );
  }, []);

  const setEnabled = useCallback((id: string, enabled: boolean) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, enabled, updatedAt: new Date().toISOString() } : r
      )
    );
  }, []);

  return {
    rules,
    totalCount,
    rulesByCategory,
    editingId,
    creatingCategory,
    draftContent,
    draftTitle,
    setDraftContent,
    setDraftTitle,
    startCreate,
    startEdit,
    cancelEdit,
    saveRule,
    deleteRule,
    toggleEnabled,
    setEnabled,
  };
}
