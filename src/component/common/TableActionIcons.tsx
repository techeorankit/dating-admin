"use client";

import React, { useState } from "react";

type TablerIconComponent = React.ElementType<{
  size?: number | string;
  stroke?: number | string;
  color?: string;
}>;

export type TableActionIconAction = {
  id: string;
  label: string;
  icon: TablerIconComponent;
  onClick: () => void;
  title?: string;
  color?: string;
  disabled?: boolean;
};

export type TableActionIconsProps = {
  actions: TableActionIconAction[];
  size?: number;
  gap?: number;
  justifyContent?: React.CSSProperties["justifyContent"];
};

export default function TableActionIcons({
  actions,
  size = 20,
  gap = 8,
  justifyContent = "center",
}: TableActionIconsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!actions?.length) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent,
        gap,
      }}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const isHovered = hoveredId === action.id;
        const isDisabled = Boolean(action.disabled);

        return (
          <button
            key={action.id}
            type="button"
            aria-label={action.label}
            title={action.title ?? action.label}
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              if (isDisabled) return;
              action.onClick();
            }}
            onMouseEnter={() => {
              if (isDisabled) return;
              setHoveredId(action.id);
            }}
            onMouseLeave={() => {
              setHoveredId((prev) => (prev === action.id ? null : prev));
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              lineHeight: 0,
              display: "flex",
              alignItems: "center",
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isHovered ? 0.75 : 1,
              transition: "opacity 120ms ease",
              color: action.color ?? "#6b7280",
            }}
          >
            <Icon
              size={size}
              stroke={1.5}
              color={action.color ?? "currentColor"}
            />
          </button>
        );
      })}
    </div>
  );
}

