import { BRAND } from '@/config/brand';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  showKannada?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Krishna Kuteera Brand Lockup.
 * Mirrors the restaurant's physical signboard: green & turmeric leaf/tree emblem
 * enclosing the red "KK" monogram, alongside Kannada ("ಕುಟೀರ") & serif wordmark.
 */
export function BrandLogo({
  variant = 'dark',
  showKannada = true,
  size = 'md',
}: BrandLogoProps) {
  const iconSize = size === 'sm' ? 34 : size === 'lg' ? 52 : 42;
  const titleClass =
    size === 'sm'
      ? 'text-lg sm:text-xl'
      : size === 'lg'
        ? 'text-2xl sm:text-3xl'
        : 'text-xl sm:text-2xl';
  const textColor = variant === 'light' ? 'text-white' : 'text-kumkum';
  const subColor = variant === 'light' ? 'text-turmeric-soft/90' : 'text-ink-muted';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {BRAND.logo.url ? (
        <img
          src={BRAND.logo.url}
          alt={BRAND.logo.alt}
          style={{ height: iconSize, width: 'auto' }}
          className="object-contain"
        />
      ) : (
        /* Custom SVG placeholder matched to the Krishna Kuteera signboard KK emblem */
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0 drop-shadow-sm"
        >
          {/* Outer turmeric gold arch / halo */}
          <path
            d="M36 6C50 6 58 16 58 29C58 43 45 52 33 58C38 49 41 42 41 34C41 21 31 15 21 15C25 9 30 6 36 6Z"
            fill={BRAND.colors.accent}
          />
          {/* Banana-leaf green tree crown */}
          <path
            d="M30 12C17 12 8 21 8 33C8 43 16 51 27 52C29 52 31 55 31 58C34 52 44 45 46 34C48 22 40 12 30 12Z"
            fill={BRAND.colors.secondary}
          />
          {/* Decorative leaf fingers */}
          <circle cx="15" cy="21" r="4" fill={BRAND.colors.accent} />
          <circle cx="22" cy="14" r="3.5" fill={BRAND.colors.accent} />
          {/* Kumkum red KK monogram inside */}
          <text
            x="28"
            y="38"
            textAnchor="middle"
            fill={variant === 'light' ? '#FFFFFF' : BRAND.colors.primary}
            stroke={variant === 'light' ? BRAND.colors.primary : '#FFFFFF'}
            strokeWidth="1.2"
            fontFamily="Georgia, serif"
            fontWeight="800"
            fontSize="19"
            letterSpacing="-1"
          >
            KK
          </text>
        </svg>
      )}

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-2">
          {showKannada && (
            <span
              className={`text-xs sm:text-sm font-bold tracking-wide ${
                variant === 'light' ? 'text-turmeric' : 'text-banana'
              }`}
              style={{ fontFamily: BRAND.fonts.kannada }}
            >
              ಕುಟೀರ
            </span>
          )}
          <span
            className={`font-serif font-bold tracking-tight ${titleClass} ${textColor}`}
          >
            {BRAND.name}
          </span>
        </div>
        <span className={`text-[11px] font-medium tracking-wide mt-0.5 ${subColor}`}>
          {BRAND.pureVegLabel} • Bengaluru
        </span>
      </div>
    </div>
  );
}

