'use client'

import { sdk } from '@farcaster/miniapp-sdk'

export async function initializeFrame() {
  try {
    const context = await sdk.context;
    if (context?.user) {
      (window as any).userFid = context.user.fid;
    }
  } catch {
    console.log('Not in farcastermini app context');
  } 

  // always call ready even if context fails
  try {
    await sdk.actions.ready();
    console.log('sdk.ready called successfully');
  } catch (error) {
    console.error('Failed to call sdk.actions.ready():', error)
  }
}