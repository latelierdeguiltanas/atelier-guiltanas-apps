/* Display selected portraits from the supplied board without altering its pixels. */
(()=>{
const frames={aga:[70,35,280,440],blepp:[350,95,300,370],frub:[635,45,290,445],kilnip:[950,65,275,405],laylee:[1230,60,300,385],mumpo:[12,540,340,350],myla:[370,520,385,385],rix:[790,530,270,440],zark:[1100,530,420,435]};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.BastidePortrait=(url,name,css='portrait')=>{const [source,hash='']=String(url||'').split('#'),id=new URLSearchParams(hash).get('portrait'),frame=frames[id];
 if(frame&&source.endsWith('/portraits/kobolds-repos.jpg'))return `<svg class="${esc(css)}" viewBox="${frame.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Portrait de ${esc(name)}" style="overflow:hidden;background:#e8d0a0"><defs><clipPath id="kobold-frame-${id}"><rect x="${frame[0]}" y="${frame[1]}" width="${frame[2]}" height="${frame[3]}"/></clipPath></defs><image href="${esc(source)}" width="1536" height="1024" clip-path="url(#kobold-frame-${id})"/></svg>`;
 return `<img class="${esc(css)}" src="${esc(url)}" alt="Portrait de ${esc(name)}" loading="lazy"${source.endsWith('/portraits/kobolds-repos.jpg')?' style="object-fit:contain;background:#e8d0a0"':/\/(varnoth|tarak)\.jpg$/.test(source)?' style="object-position:center top"':''}>`;
};
})();
