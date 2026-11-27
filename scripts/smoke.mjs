const B=process.env.BASE_URL||'http://localhost:8080';const r=Math.random().toString(36).slice(2,8);
const log=(n,ok,x='')=>console.log(`${ok?'PASS':'FAIL'} ${n} ${x}`);
async function j(m,p,t,b,cookie){const res=await fetch(B+p,{method:m,headers:{'content-type':'application/json',...(t?{authorization:'Bearer '+t}:{}),...(cookie?{cookie}:{})},body:b?JSON.stringify(b):undefined});let d=null;try{d=await res.json()}catch{};return{s:res.status,d,h:res.headers};}
for(const p of ['/','/login','/boards','/invite/abc']){const res=await fetch(B+p);const t=await res.text();log('SPA '+p,res.ok&&t.includes('<div id="root"'),res.status)}
const pw='Qa-'+r+'-pass1';const a=await j('POST','/api/auth/register',null,{email:`qa-owner-${r}@example.test`,password:pw,fullName:'QA Owner'});log('register',a.s<300,a.s);
const ck=(a.h.get('set-cookie')||'').split(';')[0];log('refresh cookie set (httpOnly)',/httponly/i.test(a.h.get('set-cookie')||''));
const l=await j('POST','/api/auth/login',null,{email:`qa-owner-${r}@example.test`,password:pw});const T=l.d?.accessToken;log('login',!!T,l.s);
const rf=await j('POST','/api/auth/refresh',null,null,ck);log('refresh via cookie',rf.s===200,rf.s);
const bd=await j('POST','/api/boards',T,{name:'QA board'});const bid=bd.d?.board?.id;log('create board',!!bid,bd.s);
const c1=await j('POST',`/api/boards/${bid}/columns`,T,{name:'Todo'});const c2=await j('POST',`/api/boards/${bid}/columns`,T,{name:'Done'});
const col1=c1.d?.column?.id,col2=c2.d?.column?.id;log('create 2 columns',!!(col1&&col2),c1.s+'/'+c2.s);
const k=await j('POST',`/api/boards/${bid}/columns/${col1}/cards`,T,{title:'QA card',description:'<p>hi</p><script>alert(1)</script>'});const cid=k.d?.card?.id;log('create card',!!cid,k.s);
log('description sanitized',!JSON.stringify(k.d).includes('<script'));
const mv=await j('PUT',`/api/boards/${bid}/cards/order`,T,{cardId:cid,toColumnId:col2,toIndex:0});log('move card (drag and drop)',mv.s<300&&JSON.stringify(mv.d).includes(col2),mv.s+' '+JSON.stringify(mv.d?.error||''));
const ro=await j('PUT',`/api/boards/${bid}/columns/order`,T,{columnIds:[col2,col1]});log('reorder columns',ro.s<300,ro.s+' '+JSON.stringify(ro.d?.error||''));
const ed=await j('PATCH',`/api/boards/${bid}/cards/${cid}`,T,{label:{type:'bug',bg:'red.500'}});log('edit card (modal)',ed.s<300,ed.s+' '+JSON.stringify(ed.d?.error||''));
const inv=await j('POST',`/api/boards/${bid}/invitations`,T,{email:`qa-guest-${r}@example.test`});log('send invite',inv.s<300,inv.s+' '+JSON.stringify(inv.d?.error||''));
const md=await j('GET','/api/media/backgrounds?query=nature',T);log('unsplash/media backgrounds',md.s===200&&(md.d?.images?.length>0),md.s+' n='+(md.d?.images?.length));
const g=await j('POST','/api/auth/register',null,{email:`qa-guest-${r}@example.test`,password:pw,fullName:'QA Guest'});const GT=g.d?.accessToken;
const gb=await j('GET',`/api/boards/${bid}`,GT);log('non-member blocked',gb.s===404||gb.s===403,gb.s);
const full=await j('GET',`/api/boards/${bid}`,T);log('board reload shows state',full.s===200,full.s);
