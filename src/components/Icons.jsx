// Небольшой набор строчных SVG-иконок без внешних зависимостей.
const base = (children, props = {}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const IconCursor = (p) =>
  base(
    <path d="M4 3l7 17 2.5-7.5L21 10 4 3z" fill="currentColor" stroke="none" />,
    p
  );

export const IconHLine = (p) => base(<path d="M3 12h18M8 12v0M16 12v0" />, p);

export const IconRay = (p) =>
  base(
    <>
      <path d="M4 16l7-7" />
      <circle cx="4" cy="16" r="1.6" fill="currentColor" stroke="none" />
      <path d="M13 9h8" />
    </>,
    p
  );

export const IconTrend = (p) =>
  base(
    <>
      <circle cx="5" cy="18" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="19" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <path d="M6.4 16.6L17.6 7.4" />
    </>,
    p
  );

export const IconLong = (p) =>
  base(
    <>
      <path d="M4 20l6-6 4 4 6-10" />
      <path d="M14 8h6v6" />
    </>,
    p
  );

export const IconShort = (p) =>
  base(
    <>
      <path d="M4 4l6 6 4-4 6 10" />
      <path d="M14 16h6v-6" />
    </>,
    p
  );

export const IconTrash = (p) =>
  base(
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </>,
    p
  );

export const IconChevronDown = (p) => base(<path d="M6 9l6 6 6-6" />, p);
export const IconChevronRight = (p) => base(<path d="M9 6l6 6-6 6" />, p);
export const IconLayers = (p) =>
  base(
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>,
    p
  );
export const IconSearch = (p) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>,
    p
  );
export const IconClose = (p) => base(<path d="M5 5l14 14M19 5L5 19" />, p);
export const IconCandles = (p) =>
  base(
    <>
      <path d="M6 4v4M6 14v6M6 8h0v6h0z" />
      <rect x="4" y="8" width="4" height="6" rx="1" fill="currentColor" stroke="none" />
      <path d="M14 2v3M14 11v9M14 5h0v6h0z" />
      <rect x="12" y="5" width="4" height="6" rx="1" fill="currentColor" stroke="none" />
      <path d="M19 9v3M19 16v3M19 12h0v4h0z" />
      <rect x="17" y="12" width="4" height="4" rx="1" fill="currentColor" stroke="none" />
    </>,
    p
  );
