const toast = document.getElementById('toast');
const requestRows = document.getElementById('requestRows');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const typeFilter = document.getElementById('typeFilter');
const pageSize = 6;
let page = 1;

const defaultRequests = [
  {name:'Maria Santos',id:'EMP001',avatar:'assets/admin-avatar.png',type:'Vacation Leave',range:'May 20 – May 24, 2024',duration:'5 days',reason:'Family vacation',status:'Pending'},
  {name:'Juan Dela Cruz',id:'EMP002',avatar:'https://i.pravatar.cc/80?img=12',type:'Sick Leave',range:'May 15 – May 16, 2024',duration:'2 days',reason:'Medical recovery',status:'Approved'},
  {name:'Ana Reyes',id:'EMP003',avatar:'https://i.pravatar.cc/80?img=47',type:'Personal Leave',range:'May 10, 2024',duration:'1 day',reason:'Personal appointment',status:'Approved'},
  {name:'Carlos Mendoza',id:'EMP004',avatar:'https://i.pravatar.cc/80?img=11',type:'Vacation Leave',range:'May 28 – May 31, 2024',duration:'4 days',reason:'Out-of-town trip',status:'Rejected'},
  {name:'Bea Cruz',id:'EMP005',avatar:'https://i.pravatar.cc/80?img=45',type:'Sick Leave',range:'June 3 – June 4, 2024',duration:'2 days',reason:'Fever and rest',status:'Pending'},
  {name:'Mark Villanueva',id:'EMP006',avatar:'https://i.pravatar.cc/80?img=14',type:'Emergency Leave',range:'June 5, 2024',duration:'1 day',reason:'Family emergency',status:'Approved'},
  {name:'Liza Ramos',id:'EMP007',avatar:'https://i.pravatar.cc/80?img=32',type:'Vacation Leave',range:'June 10 – June 14, 2024',duration:'5 days',reason:'Annual leave',status:'Pending'},
  {name:'Paolo Garcia',id:'EMP008',avatar:'https://i.pravatar.cc/80?img=15',type:'Personal Leave',range:'June 18, 2024',duration:'1 day',reason:'Government appointment',status:'Rejected'}
];
let requests = JSON.parse(localStorage.getItem('zemLeaveRequests') || 'null') || defaultRequests;

function save(){ localStorage.setItem('zemLeaveRequests', JSON.stringify(requests)); }
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1800)}
function typeClass(type){return type==='Personal Leave'?'personal':'leave'}
function updateStats(){
  document.getElementById('totalCount').textContent=requests.length;
  ['Approved','Pending','Rejected'].forEach(s=>document.getElementById(`${s.toLowerCase()}Count`).textContent=requests.filter(r=>r.status===s).length);
}
function filtered(){
  const term=searchInput.value.trim().toLowerCase();
  return requests.filter(r=>(!term||`${r.name} ${r.id} ${r.type}`.toLowerCase().includes(term))&&(statusFilter.value==='all'||r.status===statusFilter.value)&&(typeFilter.value==='all'||r.type===typeFilter.value));
}
function render(){
  const data=filtered(); const pages=Math.max(1,Math.ceil(data.length/pageSize)); if(page>pages)page=pages;
  const visible=data.slice((page-1)*pageSize,page*pageSize);
  requestRows.innerHTML=visible.length?visible.map(r=>{const index=requests.indexOf(r);return `<tr>
    <td><div class="employee"><img src="${r.avatar}" alt="${r.name}" onerror="this.src='assets/admin-avatar.png'"><span class="employee-copy"><strong>${r.name}</strong><small>${r.id}</small></span></div></td>
    <td><span class="pill ${typeClass(r.type)}">${r.type}</span></td><td>${r.range}</td><td>${r.duration}</td><td class="reason-cell" title="${r.reason}">${r.reason}</td>
    <td><span class="pill ${r.status.toLowerCase()}">${r.status}</span></td>
    <td><div class="row-actions">${r.status==='Pending'?`<button class="mini-action approve" data-action="approve" data-index="${index}">Approve</button><button class="mini-action reject" data-action="reject" data-index="${index}">Reject</button>`:`<button class="action-btn" data-action="details" data-index="${index}" aria-label="View ${r.name}">⋮</button>`}</div></td></tr>`}).join(''):`<tr class="empty-row"><td colspan="7">No leave requests match the selected filters.</td></tr>`;
  document.getElementById('resultCount').textContent=`${data.length} request${data.length===1?'':'s'}`;
  document.getElementById('pageLabel').textContent=`Page ${page} of ${pages}`;
  document.getElementById('prevPage').disabled=page===1; document.getElementById('nextPage').disabled=page===pages;
  requestRows.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>handleAction(btn.dataset.action,Number(btn.dataset.index))));
  updateStats();
}
function handleAction(action,index){
  const request=requests[index];
  if(action==='approve'||action==='reject'){request.status=action==='approve'?'Approved':'Rejected';save();render();showToast(`${request.name}'s request was ${request.status.toLowerCase()}.`)}
  else showToast(`${request.name}: ${request.reason}`);
}

[searchInput,statusFilter,typeFilter].forEach(el=>el.addEventListener('input',()=>{page=1;render()}));
document.getElementById('prevPage').addEventListener('click',()=>{if(page>1){page--;render()}});
document.getElementById('nextPage').addEventListener('click',()=>{const pages=Math.ceil(filtered().length/pageSize);if(page<pages){page++;render()}});

const modal=document.getElementById('requestModal');
function openModal(){modal.hidden=false;document.body.style.overflow='hidden'}
function closeModal(){modal.hidden=true;document.body.style.overflow=''}
document.getElementById('newRequestBtn').addEventListener('click',openModal);
document.getElementById('closeModal').addEventListener('click',closeModal);
document.getElementById('cancelModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.getElementById('requestForm').addEventListener('submit',e=>{
  e.preventDefault(); const f=new FormData(e.currentTarget); const start=new Date(`${f.get('start')}T00:00:00`); const end=new Date(`${f.get('end')}T00:00:00`);
  if(end<start){showToast('End date must be after the start date.');return}
  const days=Math.round((end-start)/86400000)+1; const fmt=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  requests.unshift({name:f.get('name'),id:f.get('employeeId'),avatar:'assets/admin-avatar.png',type:f.get('type'),range:start.getTime()===end.getTime()?fmt(start):`${fmt(start)} – ${fmt(end)}`,duration:`${days} day${days===1?'':'s'}`,reason:f.get('reason'),status:f.get('status')});
  save();e.currentTarget.reset();closeModal();page=1;render();showToast('Leave request added.');
});

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.href)location.href=btn.dataset.href;else if(btn.dataset.label)showToast(`${btn.dataset.label} selected`)}));
const sidebar=document.getElementById('sidebar');document.getElementById('menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));
document.getElementById('logoutBtn').addEventListener('click',()=>showToast('Logout button clicked'));
document.getElementById('notificationBtn').addEventListener('click',()=>showToast('No new notifications'));
const profileBtn=document.getElementById('profileBtn'),profileMenu=document.getElementById('profileMenu');profileBtn.addEventListener('click',()=>{const open=profileMenu.hidden;profileMenu.hidden=!open;profileBtn.setAttribute('aria-expanded',String(open))});document.addEventListener('click',e=>{if(!profileBtn.contains(e.target)&&!profileMenu.contains(e.target)){profileMenu.hidden=true;profileBtn.setAttribute('aria-expanded','false')}});
render();
