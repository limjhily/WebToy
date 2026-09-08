// 공통: 숫자 포맷, 콤마 입력, 공유 링크, 결과 복사
const fmt = n => Math.round(n).toLocaleString('ko-KR');
const won = n => fmt(n) + '원';
const num = el => Number(String(el.value).replace(/[^\d.]/g, '')) || 0;
function commaInputs(){
  document.querySelectorAll('input[data-comma]').forEach(el=>{
    el.setAttribute('inputmode','numeric');
    el.addEventListener('input',()=>{const v=el.value.replace(/[^\d]/g,'');el.value=v?Number(v).toLocaleString('ko-KR'):'';});
  });
}
function toast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1600);}
function copyText(txt){navigator.clipboard?.writeText(txt).then(()=>toast('복사했습니다'));}
// 입력값을 URL 해시에 저장 → 링크 공유 시 같은 결과가 열림
function saveState(form){const p=new URLSearchParams();[...form.elements].forEach(e=>{if(e.name)p.set(e.name,e.type==='checkbox'?(e.checked?1:0):e.value);});history.replaceState(null,'','#'+p.toString());}
function loadState(form){if(!location.hash)return false;const p=new URLSearchParams(location.hash.slice(1));let any=false;[...form.elements].forEach(e=>{if(e.name&&p.has(e.name)){any=true;if(e.type==='checkbox')e.checked=p.get(e.name)==='1';else e.value=p.get(e.name);}});return any;}
function shareLink(){copyText(location.href);}
document.addEventListener('DOMContentLoaded',commaInputs);
