import { NextResponse } from 'next/server';
export async function POST(request:Request){
 try{
  const data=await request.json();
  if(data.website)return NextResponse.json({ok:true});
  const {email,name,subject,message,phone}=data;
  if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||typeof name!=='string'||!name.trim()||typeof subject!=='string'||typeof message!=='string'||message.trim().length<15)return NextResponse.json({error:'Données invalides'},{status:400});
  const key=process.env.RESEND_API_KEY;const to=process.env.CONTACT_TO_EMAIL;const from=process.env.CONTACT_FROM_EMAIL;
  if(!key||!to||!from)return NextResponse.json({error:'Service de contact non configuré'},{status:503});
  const content=`Nom : ${name}\nEmail : ${email}\nTéléphone : ${typeof phone==='string'?phone:''}\nObjet : ${subject}\n\n${message}`;
  const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`SEOKRAFT — ${subject}`,text:content})});
  if(!res.ok)return NextResponse.json({error:'Envoi indisponible'},{status:502});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'Requête invalide'},{status:400})}
}
