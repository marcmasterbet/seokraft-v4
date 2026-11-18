import { NextResponse } from 'next/server';

/* Ancien fonctionnement (projet Claude) retiré en novembre 2026 : l'audit se fait maintenant en un clic depuis l'outil.
   Ce fichier peut être supprimé de GitHub. */
export async function POST() {
  return NextResponse.json({ error: 'Fonction retirée : utilisez « Lancer l’audit » dans l’outil.' }, { status: 410 });
}
