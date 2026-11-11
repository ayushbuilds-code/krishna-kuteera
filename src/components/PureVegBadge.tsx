interface PureVegBadgeProps {
  compact?: boolean;
  label?: string;
  className?: string;
}

/**
 * Standard Indian FSSAI green dot-in-square Pure Veg symbol.
 * Rendered on every menu item card and restaurant header.
 */
export function PureVegBadge({
  compact = false,
  label = 'Pure Veg',
  className,
}: PureVegBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title="100% Pure Vegetarian"
      aria-label="100% Pure Vegetarian"
    >
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] border-[1.5px] border-banana bg-white shrink-0"
        aria-hidden="true"
      >
        <span className="w-2 h-2 rounded-full bg-banana" />
      </span>
      {!compact && (
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            className || 'text-banana-dark'
          }`}
        >
          {label}
        </span>
      )}
    </span>
  );
}

