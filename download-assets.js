import fs from 'fs';
import https from 'https';

async function run() {
  try {
    const infoRes = await fetch('https://api.streamable.com/videos/hpvnxl');
    const info = await infoRes.json();
    
    let vidUrl = (info.files['mp4-mobile'] || info.files['mp4']).url;
    if (vidUrl.startsWith('//')) vidUrl = 'https:' + vidUrl;
    
    let thumbUrl = info.thumbnail_url;
    if (thumbUrl.startsWith('//')) thumbUrl = 'https:' + thumbUrl;

    const vBuf = await fetch(vidUrl).then(r => r.arrayBuffer());
    fs.writeFileSync('public/hero-video.mp4', Buffer.from(vBuf));
    
    const tBuf = await fetch(thumbUrl).then(r => r.arrayBuffer());
    fs.writeFileSync('public/hero-poster.jpg', Buffer.from(tBuf));
    
    console.log('Downloaded video and poster', vBuf.byteLength, tBuf.byteLength);
  } catch(e) {
    console.error('Failed to download assets:', e);
  }
}

run();
