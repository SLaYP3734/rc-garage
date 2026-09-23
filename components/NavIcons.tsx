// Alt menü için sade, tek stilde (outline) SVG ikon seti — emoji yerine
// daha "gerçekçi" ve tutarlı bir görünüm için.
type IconProps = { active?: boolean; className?: string };

const stroke = 1.8;

export function HomeIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11.5 12 4l8 7.5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v8.5a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V10"
        stroke="currentColor"
        strokeWidth={stroke}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.15 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WrenchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 4.9L4 16.5V20h3.5l5.3-5.3a4 4 0 0 0 4.9-5.4l-2.7 2.7-2.2-2.2 2.9-2.5Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6Z"
        stroke="currentColor"
        strokeWidth={stroke}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.15 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 4h2l1.6 10.4a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L19.5 8H6"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.3" fill="currentColor" />
      <circle cx="17" cy="20" r="1.3" fill="currentColor" />
      {active && <path d="M6 8h13.5l-1.5 6.4a2 2 0 0 1-2 1.6H8.6" fill="currentColor" fillOpacity={0.15} />}
    </svg>
  );
}

export function UserIcon({ active, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="8"
        r="3.4"
        stroke="currentColor"
        strokeWidth={stroke}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M5 20c1-3.5 4-5.3 7-5.3s6 1.8 7 5.3"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
