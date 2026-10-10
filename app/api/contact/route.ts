import { NextResponse } from 'next/server';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function safe(v:unknown,max:number){return typeof v==='string'?v.trim().slice(0,max):''}
export async function POST(request:Request){
 try {
  const data = await request.json();
  if(data.website) return NextResponse.json({ok:true}); // honeypot
  const email=safe(data.email,200), subject=safe(data.subject,140), activity=safe(data.activity,200), kind=safe(data.kind,100), message=safe(data.message,5000), phone=safe(data.phone,60);
  if(!emailPattern.test(email)||message.length<15||!subject) return NextResponse.json({error:'Vérifiez votre adresse e-mail, votre objet et votre message (15 caractères minimum).'}, {status:400});
  const apiKey=process.env.RESEND_API_KEY, to=process.env.CONTACT_TO_EMAIL, from=process.env.CONTACT_FROM_EMAIL;
  if(!apiKey||!to||!from) return NextResponse.json({error:'Le formulaire n’est pas encore configuré. Merci de contacter SEOKRAFT par e-mail.'},{status:503});
  const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`[SEOKRAFT] ${subject}`,text:`De : ${email}\nTéléphone : ${phone||'Non communiqué'}\nType : ${kind||'Non précisé'}\nActivité : ${activity||'Non précisée'}\n\n${message}`})});
  if(!res.ok) return NextResponse.json({error:'L’envoi a échoué. Réessayez ou contactez-nous par e-mail.'},{status:502});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Impossible de traiter votre demande.'},{status:400})}
}
