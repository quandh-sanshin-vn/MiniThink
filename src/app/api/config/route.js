import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = await prisma.integrationConfig.findFirst({
      where: { platform: 'BACKLOG' }
    });
    
    let currentUserName = null;
    if (config && config.domain && config.apiKey) {
       try {
         const userRes = await fetch(`https://${config.domain}/api/v2/users/myself?apiKey=${config.apiKey}`);
         if (userRes.ok) {
            const user = await userRes.json();
            currentUserName = user.name;
         }
       } catch (e) {}
    }

    return NextResponse.json({ ...(config || {}), currentUserName });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { domain, apiKey } = await req.json();
    
    if (!domain || !apiKey) {
      return NextResponse.json({ error: 'Missing domain or apiKey' }, { status: 400 });
    }

    let config = await prisma.integrationConfig.findFirst({
      where: { platform: 'BACKLOG', domain }
    });

    if (config) {
      config = await prisma.integrationConfig.update({
        where: { id: config.id },
        data: { apiKey, isActive: true }
      });
    } else {
      config = await prisma.integrationConfig.create({
        data: { platform: 'BACKLOG', domain, apiKey }
      });
    }

    return NextResponse.json({ message: 'Config saved successfully', config });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
