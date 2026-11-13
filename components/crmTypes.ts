/* CRM SEOKRAFT : types, étapes, relances et modèles de mails (partagé entre le serveur et la page /crm). */

export type Stage = 'a_contacter' | 'audit_demande' | 'audit_envoye' | 'relance' | 'rdv' | 'devis' | 'client' | 'perdu' | 'cote';
export type Source = 'audit' | 'outil' | 'contact' | 'questionnaire' | 'import' | 'manuel';

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'a_contacter', label: 'À contacter' },
  { id: 'audit_demande', label: 'Audit demandé' },
  { id: 'audit_envoye', label: 'Audit envoyé' },
  { id: 'relance', label: 'Relancé' },
  { id: 'perdu', label: 'Refusé' },        // pas de réponse après les relances, ou « non »
  { id: 'rdv', label: 'Rendez-vous' },
  { id: 'devis', label: 'Devis' },
  { id: 'client', label: 'Client' },
  { id: 'cote', label: 'Mis de côté' },
];
/* « Mis de côté » : prospects peu importants ou réfractaires, sortis du démarchage (pas de relances, hors « Tous »). */
export const ACTIVE = (p: { stage: Stage }) => p.stage !== 'cote';
export const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label])) as Record<Stage, string>;
export const SOURCE_LABEL: Record<Source, string> = { audit: 'Audit gratuit', outil: 'Outil d’audit', contact: 'Contact', questionnaire: 'Questionnaire', import: 'Import', manuel: 'Ajout manuel' };

export type Doc = { name: string; url: string; at: string; size: number };
export type Event = { at: string; text: string; kind: 'auto' | 'note' | 'relance' | 'etape' };
export type Prospect = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  address?: string;         // adresse postale
  siret?: string;
  google?: string;          // note et nombre d'avis Google (ex. « 4,8/5 (19 avis) »)
  distance?: string;        // distance depuis Fegersheim (import)
  trade: string;            // métier
  priority: string;         // Haute / Moyenne / Basse (import)
  source: Source;
  stage: Stage;
  score: number | null;     // note de l'audit sur 20
  bulletinId: string;
  followFrom: string;       // date d'envoi de l'audit ou du devis : point de départ des relances
  followCycle: 'audit' | 'devis' | '';
  relances: number;         // relances faites dans le cycle en cours
  manualAction: { label: string; due: string } | null;
  docs: Doc[];
  questionnaire: { text: string; at: string } | null;
  client?: ClientInfo;      // fiche client, une fois le site signé
  history: Event[];
  createdAt: string;
  updatedAt: string;
};

export const emptyProspect = (id: string, now = new Date().toISOString()): Prospect => ({
  id, company: '', contactName: '', email: '', phone: '', website: '', city: '', address: '', siret: '', google: '', distance: '', trade: '', priority: '', source: 'manuel', stage: 'a_contacter',
  score: null, bulletinId: '', followFrom: '', followCycle: '', relances: 0, manualAction: null, docs: [], questionnaire: null, history: [], createdAt: now, updatedAt: now,
});

const DAY = 86400000;
const addDays = (iso: string, d: number) => new Date(new Date(iso).getTime() + d * DAY).toISOString();
export const hostOf = (v: string) => { try { return new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
export const firstName = (p: Prospect) => (p.contactName || '').trim().split(/\s+/)[0] || '';

export type NextAction = { label: string; due: string | null; kind: 'relance' | 'reponse' | 'manuel' | 'info'; relanceStep?: 3 | 7 };

/* Prochaine action d'un prospect : relances J+3 et J+7 après l'envoi de l'audit ou du devis, réponse sous 24 h aux demandes entrantes. */
export function nextAction(p: Prospect): NextAction | null {
  if (p.manualAction?.label) return { label: p.manualAction.label, due: p.manualAction.due || null, kind: 'manuel' };
  if (p.stage === 'client' || p.stage === 'perdu' || p.stage === 'cote') return null;
  if ((p.stage === 'audit_envoye' || p.stage === 'relance' || p.stage === 'devis') && p.followFrom) {
    const what = p.followCycle === 'devis' ? 'devis' : 'audit';
    if (p.relances === 0) return { label: `Relance J+3 (${what})`, due: addDays(p.followFrom, 3), kind: 'relance', relanceStep: 3 };
    if (p.relances === 1) return { label: `Relance J+7 (${what})`, due: addDays(p.followFrom, 7), kind: 'relance', relanceStep: 7 };
    return { label: 'Sans réponse après 2 relances : appeler ou passer en « Refusé »', due: null, kind: 'info' };
  }
  if (p.stage === 'audit_demande') return { label: p.bulletinId ? 'Relire l’audit et l’envoyer' : 'Lancer l’audit depuis l’outil', due: addDays(p.createdAt, 1), kind: 'reponse' };
  if (p.stage === 'a_contacter' && ['contact', 'questionnaire'].includes(p.source)) return { label: 'Répondre à la demande', due: addDays(p.createdAt, 1), kind: 'reponse' };
  if (p.stage === 'a_contacter') return { label: p.website ? 'Auditer le site et envoyer l’audit' : 'Appeler (pas de site)', due: null, kind: 'info' };
  return null;
}

export const isDue = (a: NextAction | null, now = Date.now()) => !!a?.due && new Date(a.due).getTime() <= now;
export const frDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' });

const SIGNATURE = 'Marc Bretzner\nFondateur, SEOKRAFT\nStrasbourg · 06 72 20 91 53\nhttps://www.seokraft.fr';
const STOP = '\n\nVous pouvez vous opposer à tout nouvel envoi en répondant « STOP » à ce message.';

/* Mail de relance prêt à copier (Marc l'envoie lui-même depuis Outlook). */
export function relanceMail(p: Prospect, step: 3 | 7): { subject: string; body: string } {
  const hello = firstName(p) ? `Bonjour ${firstName(p)},` : 'Bonjour,';
  const host = hostOf(p.website) || p.company;
  const cold = p.source === 'import' || p.source === 'outil';
  const sent = p.followFrom ? frDate(p.followFrom) : '';
  const link = p.bulletinId ? `https://www.seokraft.fr/bulletin/${p.bulletinId}` : '';
  if (p.followCycle === 'devis') {
    return step === 3
      ? { subject: `Votre devis SEOKRAFT${p.company ? ` — ${p.company}` : ''}`, body: `${hello}\n\nJe reviens vers vous au sujet du devis que je vous ai transmis${sent ? ` le ${sent}` : ''}. Avez-vous pu le consulter ?\n\nSi un point mérite d’être ajusté (contenu, délai, budget), dites-le-moi simplement : nous trouverons la bonne formule ensemble.\n\nBien cordialement,\n\n${SIGNATURE}` }
      : { subject: `Votre projet de site${p.company ? ` — ${p.company}` : ''}`, body: `${hello}\n\nUn dernier petit message au sujet de votre projet de site. Je vous propose un échange de 15 minutes pour répondre à vos questions sur le devis :\nhttps://www.seokraft.fr/rendez-vous\n\nEt si le moment n’est pas le bon, aucun souci : dites-le-moi, je ne vous relancerai plus.\n\nBien cordialement,\n\n${SIGNATURE}` };
  }
  return step === 3
    ? { subject: `L’audit de votre site ${host}`, body: `${hello}\n\nJe me permets de revenir vers vous au sujet de l’audit de votre site ${host}${sent ? `, que je vous ai envoyé le ${sent}` : ''}. Avez-vous pu le consulter ?${link ? `\n\n${link}` : ''}\n\nSi vous le souhaitez, je vous présente les points prioritaires en 20 minutes au téléphone :\nhttps://www.seokraft.fr/rendez-vous\n\nBien cordialement,\n\n${SIGNATURE}${cold ? STOP : ''}` }
    : { subject: `${host} : les points à corriger en priorité`, body: `${hello}\n\nDernier petit message de ma part au sujet de votre site ${host}. Les points relevés dans l’audit continuent probablement de vous faire perdre des demandes, et la plupart se corrigent rapidement.${link ? `\n\nL’audit reste consultable ici :\n${link}` : ''}\n\nJe reste disponible pour en parler 20 minutes, quand cela vous arrange :\nhttps://www.seokraft.fr/rendez-vous\n\nBien cordialement,\n\n${SIGNATURE}${cold ? STOP : ''}` };
}

/* Lien personnel du questionnaire de projet (relié automatiquement à la fiche). */
export function questionnaireLink(p: Prospect) {
  const q = new URLSearchParams({ client: p.id });
  if (p.company) q.set('entreprise', p.company);
  if (p.website) q.set('site', p.website);
  return `https://www.seokraft.fr/questionnaire?${q}`;
}
export function questionnaireMail(p: Prospect) {
  const hello = firstName(p) ? `Bonjour ${firstName(p)},` : 'Bonjour,';
  return { subject: 'Votre projet de site : quelques questions pour bien démarrer', body: `${hello}\n\nPour préparer une proposition adaptée à votre projet, je vous propose de répondre à ce questionnaire en ligne. Comptez 15 à 20 minutes ; vous pouvez l’interrompre et le reprendre plus tard.\n\n${questionnaireLink(p)}\n\nN’hésitez pas à répondre simplement « je ne sais pas » : nous en parlerons ensemble.\n\nBien cordialement,\n\n${SIGNATURE}` };
}

/* ===================== Espace Clients (sites réalisés) ===================== */
export type ClientInfo = {
  project: string;            // Création, Refonte, Autre
  price: string;              // prix du site (texte libre, ex. « 1 990 € TTC »)
  launchDate: string;         // date de mise en ligne (AAAA-MM-JJ)
  maintenance: boolean;
  maintenanceAmount: string;  // ex. « 49 € TTC/mois »
  maintenanceStart: string;   // AAAA-MM-JJ
  invoiceDay: number;         // jour du mois où refaire la facture (1 à 28)
  lastInvoiced: string;       // mois de la dernière facture faite (AAAA-MM)
  hostedBy: 'moi' | 'client' | '';
  host: string;               // Vercel, Hostinger, OVH…
  domainRenewal: string;      // AAAA-MM-JJ
  reviewAsked: boolean;
  commitmentSeen: boolean;
};
export const emptyClient = (): ClientInfo => ({ project: '', price: '', launchDate: '', maintenance: false, maintenanceAmount: '49 € TTC/mois', maintenanceStart: '', invoiceDay: 0, lastInvoiced: '', hostedBy: '', host: '', domainRenewal: '', reviewAsked: false, commitmentSeen: false });
export const isClient = (p: { stage: Stage }) => p.stage === 'client';

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const parseDay = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T08:00:00Z`) : null);
const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + n); return x; };
export type ClientAction = { what: 'facture' | 'avis' | 'engagement' | 'domaine'; label: string; due: string; done: string };

/* Rappels d'un client : facture de maintenance du mois, avis Google après la mise en ligne, fin d'engagement, renouvellement du domaine. */
export function clientActions(p: Prospect, now = new Date()): ClientAction[] {
  const c = p.client;
  if (!c || p.stage !== 'client') return [];
  const out: ClientAction[] = [];
  if (c.maintenance && c.invoiceDay >= 1) {
    const month = now.toISOString().slice(0, 7);
    const day = Math.min(28, c.invoiceDay);
    const thisDue = new Date(`${month}-${String(day).padStart(2, '0')}T08:00:00Z`);
    const start = parseDay(c.maintenanceStart);
    const done = c.lastInvoiced >= month;
    const due = done ? addMonths(thisDue, 1) : thisDue;
    if (!start || due >= start) out.push({ what: 'facture', label: `Facture de maintenance (${c.maintenanceAmount || 'mensuelle'}) : ${due.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })}`, due: due.toISOString(), done: 'Facture faite' });
  }
  const launch = parseDay(c.launchDate);
  if (launch && !c.reviewAsked) out.push({ what: 'avis', label: 'Demander une recommandation LinkedIn (15 jours après la mise en ligne)', due: new Date(launch.getTime() + 15 * DAY).toISOString(), done: 'Recommandation demandée' });
  const start = parseDay(c.maintenanceStart);
  if (c.maintenance && start && !c.commitmentSeen) { const end = addMonths(start, 12); out.push({ what: 'engagement', label: `Fin de l’engagement de 12 mois le ${end.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })} : proposer la suite`, due: new Date(end.getTime() - 30 * DAY).toISOString(), done: 'C’est vu' }); }
  const dom = parseDay(c.domainRenewal);
  if (dom) out.push({ what: 'domaine', label: `Renouvellement du domaine le ${dom.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`, due: new Date(dom.getTime() - 30 * DAY).toISOString(), done: 'Renouvelé (+1 an)' });
  return out.sort((a, b) => a.due.localeCompare(b.due));
}
export const nextDomain = (s: string) => { const d = parseDay(s); return d ? ymd(addMonths(d, 12)) : s; };

export function reviewMail(p: Prospect) {
  const hello = firstName(p) ? `Bonjour ${firstName(p)},` : 'Bonjour,';
  /* Recommandation LinkedIn en attendant la fiche Google Business (prévue à l'ouverture de la SASU). */
  return { subject: 'Une petite recommandation ?', body: `${hello}\n\nJ’espère que votre site vous donne satisfaction. Si vous êtes content de notre collaboration, accepteriez-vous de me laisser une recommandation sur LinkedIn ?\nhttps://www.linkedin.com/in/marc-bretzner-d%C3%A9veloppeur-web\n\nMerci beaucoup,\n\n${SIGNATURE}` };
}
