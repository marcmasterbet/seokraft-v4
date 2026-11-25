'use client';
import {usePathname} from 'next/navigation';

/** Décoration de fêtes : visible jusqu'au 6 janvier 2027 inclus, puis masquée toute seule. */
export const NOEL_FIN = '2027-01-07T00:00:00+01:00';
const PRIVE = ['/crm', '/outil-audit', '/bulletin', '/carte', '/questionnaire'];

export function noelActif(): boolean {
  return Date.now() < new Date(NOEL_FIN).getTime();
}

export default function NoelBand() {
  const path = usePathname() || '/';
  if (!noelActif() || PRIVE.some((p) => path.startsWith(p))) return null;
  return (
    <>
      <div className="noel-band" role="note">
        <span aria-hidden="true">✦</span> Je vous souhaite de joyeuses fêtes <span aria-hidden="true">✦</span>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `if(Date.now()>=${new Date(NOEL_FIN).getTime()})document.documentElement.classList.add('noel-off')`,
        }}
      />
    </>
  );
}

/** Brin de gui accroché au logo. */
export function Gui() {
  if (!noelActif()) return null;
  return (
    <svg className="noel-gui" viewBox="0 0 40 34" width="30" height="26" aria-hidden="true">
      <path d="M20 4 C20 10 19 14 18 18" stroke="#4a5338" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M19 12 C13 9 6 10 3 14 C9 17 15 16 19 12Z" fill="#596247" />
      <path d="M19.5 12 C25 8 32 8 36 11 C31 15 24 15 19.5 12Z" fill="#6d7757" />
      <path d="M18.5 17 C13 17 8 20 6 25 C12 26 17 23 18.5 17Z" fill="#6d7757" />
      <path d="M18.5 17 C23 18 28 22 29 27 C23 27 19.5 23 18.5 17Z" fill="#596247" />
      <circle cx="16" cy="20" r="2.6" fill="#f4f0e8" stroke="#8d9677" strokeWidth=".8" />
      <circle cx="20.5" cy="21.5" r="2.6" fill="#f4f0e8" stroke="#8d9677" strokeWidth=".8" />
      <circle cx="18.2" cy="24.6" r="2.4" fill="#f4f0e8" stroke="#8d9677" strokeWidth=".8" />
      <path d="M20 4 C22 1 26 1 27 3 C25 5 22 5 20 4Z" fill="#a8322d" />
      <path d="M20 4 C18 1 14 1 13 3 C15 5 18 5 20 4Z" fill="#a8322d" />
    </svg>
  );
}
