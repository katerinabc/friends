import { sdk } from '@farcaster/miniapp-sdk'

export async function initializeFrame() {
  const context = await sdk.context

  if (!context || !context.user) {
    console.log('not in mini app context')
    return
  }

  const user = context.user

  window.userFid = user.fid;

  // You can now use the window.userFid in any of your React code, e.g. using a useEffect that listens for it to be set
  // or trigger a custom event or anything you want

  // Call the ready function to remove your splash screen when in a mini app
  await sdk.actions.ready();
}