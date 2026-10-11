'use client';
export default function CookieSettingsButton(){return <button type="button" className="sk-cookie-settings" onClick={()=>window.dispatchEvent(new Event('seokraft-open-cookie-settings'))}>Modifier mon choix de cookies</button>}
