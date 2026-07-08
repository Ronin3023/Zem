const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const toast = document.getElementById('toast');
const requestRows = document.getElementById('requestRows');

let currentDate = new Date(2024, 4, 1);
const eventMap = {
  '2024-05-02':'approved','2024-05-03':'approved','2024-05-06':'pending','2024-05-07':'approved',
  '2024-05-08':'approved','2024-05-09':'approved','2024-05-10':'pending','2024-05-11':'approved',
  '2024-05-13':'approved','2024-05-14':'approved','2024-05-15':'approved','2024-05-16':'pending',
  '2024-05-17':'approved','2024-05-18':'pending','2024-05-20':'pending','2024-05-21':'pending',
  '2024-05-22':'approved','2024-05-23':'approved','2024-05-24':'pending','2024-05-27':'pending',
  '2024-05-30':'approved','2024-05-31':'pending'
};

const requests = [
  {name:'Maria Santos', id:'EMP001', avatar:'assets/admin-avatar.png', type:'Vacation Leave', typeClass:'leave', range:'May 20 – May 24, 2024', duration:'5 days', status:'Pending'},
  {name:'Juan Dela Cruz', id:'EMP002', avatar:'https://i.pravatar.cc/80?img=12', type:'Sick Leave', typeClass:'leave', range:'May 15 – May 16, 2024', duration:'2 days', status:'Approved'},
  {name:'Ana Reyes', id:'EMP003', avatar:'https://i.pravatar.cc/80?img=47', type:'Personal Leave', typeClass:'personal', range:'May 10, 2024', duration:'1 day', status:'Approved'},
  {name:'Carlos Mendoza', id:'EMP004', avatar:'https://i.pravatar.cc/80?img=11', type:'Vacation Leave', typeClass:'leave', range:'May 28 – May 31, 2024', duration:'4 days', status:'Rejected'}
];

function pad(value){return String(value).padStart(2,'0')}
function keyFor(date){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1800)}

function renderCalendar(){
  const year=currentDate.getFullYear();
  const month=currentDate.getMonth();
  monthLabel.textContent=currentDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const previousMonthDays=new Date(year,month,0).getDate();
  const cells=[];
  for(let i=firstDay-1;i>=0;i--) cells.push({day:previousMonthDays-i,offset:-1});
  for(let day=1;day<=daysInMonth;day++) cells.push({day,offset:0});
  let next=1;while(cells.length<35) cells.push({day:next++,offset:1});
  if(cells.length>35) while(cells.length<42) cells.push({day:next++,offset:1});
  calendarGrid.innerHTML='';
  cells.forEach(cell=>{
    const date=new Date(year,month+cell.offset,cell.day);
    const event=eventMap[keyFor(date)];
    const day=document.createElement('button');
    day.type='button';
    day.className=`day${cell.offset!==0?' muted':''}${year===2024&&month===4&&cell.day===12&&cell.offset===0?' selected':''}`;
    day.innerHTML=`<span class="day-number">${cell.day}</span>${event?`<span class="day-event ${event}"></span>`:''}`;
    day.addEventListener('click',()=>showToast(`${date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}${event?` — ${event[0].toUpperCase()+event.slice(1)}`:''}`));
    calendarGrid.appendChild(day);
  });
}

function renderRequests(){
  requestRows.innerHTML=requests.map((r,index)=>`<tr>
    <td><div class="employee"><img src="${r.avatar}" alt="${r.name}" onerror="this.src='assets/admin-avatar.png'"><span class="employee-copy"><strong>${r.name}</strong><small>${r.id}</small></span></div></td>
    <td><span class="pill ${r.typeClass}">${r.type}</span></td>
    <td>${r.range}</td><td>${r.duration}</td>
    <td><span class="pill ${r.status.toLowerCase()}">${r.status}</span></td>
    <td><button class="action-btn" type="button" aria-label="Actions for ${r.name}" data-index="${index}">⋮</button></td>
  </tr>`).join('');
  document.querySelectorAll('.action-btn').forEach(btn=>btn.addEventListener('click',()=>showToast(`Actions opened for ${requests[Number(btn.dataset.index)].name}`)));
}

document.getElementById('prevMonth').addEventListener('click',()=>{currentDate.setMonth(currentDate.getMonth()-1);renderCalendar()});
document.getElementById('nextMonth').addEventListener('click',()=>{currentDate.setMonth(currentDate.getMonth()+1);renderCalendar()});
document.getElementById('monthSelect').addEventListener('click',()=>{currentDate=new Date(2024,4,1);renderCalendar();showToast('Returned to May 2024')});
document.getElementById('rangeButton').addEventListener('click',()=>showToast('Date range selector opened'));
document.getElementById('notificationBtn').addEventListener('click',()=>showToast('No new notifications'));
document.getElementById('viewAllBtn').addEventListener('click',()=>document.getElementById('requestsSection').scrollIntoView({behavior:'smooth'}));
document.getElementById('logoutBtn').addEventListener('click',()=>showToast('Logout button clicked'));

const profileBtn=document.getElementById('profileBtn');
const profileMenu=document.getElementById('profileMenu');
profileBtn.addEventListener('click',()=>{const open=profileMenu.hidden;profileMenu.hidden=!open;profileBtn.setAttribute('aria-expanded',String(open))});
document.addEventListener('click',e=>{if(!profileBtn.contains(e.target)&&!profileMenu.contains(e.target)){profileMenu.hidden=true;profileBtn.setAttribute('aria-expanded','false')}});

const sidebar=document.getElementById('sidebar');
document.getElementById('menuBtn').addEventListener('click',()=>sidebar.classList.toggle('open'));
document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));item.classList.add('active');
  const section=item.dataset.section;
  if(section==='calendar') document.getElementById('calendarSection').scrollIntoView({behavior:'smooth'});
  else if(section==='requests') document.getElementById('requestsSection').scrollIntoView({behavior:'smooth'});
  else showToast(`${item.textContent.trim()} selected`);
  sidebar.classList.remove('open');
}));

renderCalendar();
renderRequests();
