import { decrypt } from './src/shared/encryption';
import { env } from './src/config/env';

async function main() {
  const encToken = "cdaedc2ec3dd86afb2f9571e5d8a7a3a:005725c67d1ed8fa6e0ea230f2126c3d:6c73517c54cadea71da8195444e77f68e9b2d3e799d58de7e1b73f7cd2ff11ea704fcb249aea6a41c7c6adbb7586e0acec798cf62e3b28738169d60c5a9dc37d99e5d3b1abde5a2e8d9719a622009b2903bb800a4c0c7584d78bac8553de6ae5b9180871805c889d3ef6cdd3aa75b5bbf4665884e049c441613af68e132a720c0ae0f11b7c9f11dd4e3b4387066bf5bb344b6014a1cee7720ed7de0e808ed88f06bc";
  const token = decrypt(encToken);
  
  const res = await fetch('https://graph.instagram.com/v21.0/me/subscribed_apps', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log(await res.text());
}

main().catch(console.error);
