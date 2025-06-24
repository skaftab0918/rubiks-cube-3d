const faceColors = { front:'green', back:'blue', right:'red', left:'orange', top:'white', bottom:'yellow' };
const faces = {};
let state, scrambleMoves, moveCount, timerInterval, elapsedTime;

const defaultState = () => ({ U:Array(9).fill('white'), D:Array(9).fill('yellow'), F:Array(9).fill('green'), B:Array(9).fill('blue'), L:Array(9).fill('orange'), R:Array(9).fill('red') });

function initCube() {
  state = defaultState(); scrambleMoves = []; moveCount = 0; elapsedTime = 0;
  clearInterval(timerInterval);
  document.getElementById('moveCounter').textContent = moveCount;
  document.getElementById('timer').textContent = elapsedTime;
  document.getElementById('manualSteps').textContent = '(Scramble first to see steps)';
  updateVisuals();
}

for (let face in faceColors) {
  const faceDiv = document.getElementById(face);
  faces[face] = [];
  for (let i = 0; i < 9; i++) {
    const sq = document.createElement('div');
    sq.className = 'square';
    sq.style.background = faceColors[face];
    faceDiv.appendChild(sq);
    faces[face].push(sq);
  }
}

let rotateX = -30, rotateY = 45;
const cubeEl = document.getElementById('cube');
let isDragging = false, startX, startY;

cubeEl.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; startY = e.clientY; });
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  rotateY += dx * 0.5; rotateX -= dy * 0.5;
  cubeEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  startX = e.clientX; startY = e.clientY;
});
document.addEventListener('mouseup', () => isDragging = false);

function updateVisuals() {
  const map = { U:'top', D:'bottom', F:'front', B:'back', L:'left', R:'right' };
  for (let face in state) state[face].forEach((color,i)=> faces[map[face]][i].style.background=color);
}

function rotateFace(face, clockwise, record=true) {
  const s = state;
  const rotate3 = arr => clockwise ? [arr[6],arr[3],arr[0],arr[7],arr[4],arr[1],arr[8],arr[5],arr[2]] : [arr[2],arr[5],arr[8],arr[1],arr[4],arr[7],arr[0],arr[3],arr[6]];
  s[face] = rotate3(s[face]);
  const adj = { U:['B','R','F','L'], D:['F','R','B','L'], F:['U','R','D','L'], B:['U','L','D','R'], L:['U','F','D','B'], R:['U','B','D','F'] };
  const idx = { U:[[0,1,2],[0,1,2],[0,1,2],[0,1,2]], D:[[6,7,8],[6,7,8],[6,7,8],[6,7,8]], F:[[6,7,8],[0,3,6],[2,1,0],[8,5,2]], B:[[2,1,0],[0,3,6],[6,7,8],[8,5,2]], L:[[0,3,6],[0,3,6],[0,3,6],[8,5,2]], R:[[2,5,8],[0,3,6],[2,5,8],[8,5,2]] };
  const temp = idx[face].map((id,i)=>id.map(j=>s[adj[face][i]][j]));
  for (let i=0;i<4;i++) {
    const src = clockwise ? (i+3)%4 : (i+1)%4;
    idx[face][i].forEach((j,k)=> s[adj[face][i]][j]=temp[src][k]);
  }
  if (record) scrambleMoves.push({face, clockwise});
  moveCount++;
  document.getElementById('moveCounter').textContent = moveCount;
  updateVisuals();
}

function scrambleCube() {
  scrambleMoves.length=0; moveCount=0; elapsedTime=0;
  document.getElementById('moveCounter').textContent=moveCount;
  document.getElementById('timer').textContent=elapsedTime;
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    elapsedTime++;
    document.getElementById('timer').textContent=elapsedTime;
  },1000);
  const faces=['U','D','F','B','L','R'];
  for(let i=0;i<20;i++){
    const face=faces[Math.floor(Math.random()*6)];
    const clockwise=Math.random()>0.5;
    rotateFace(face,clockwise);
  }
  const steps = scrambleMoves.slice().reverse().map(m=>`${m.face} ${m.clockwise?'Counter':'Clockwise'}`).join('\n');
  document.getElementById('manualSteps').textContent = steps;
}

function solveCubeStepByStep(){
  let i=scrambleMoves.length-1;
  function step(){
    if(i<0){
      clearInterval(timerInterval);
      return;
    }
    const move=scrambleMoves[i];
    rotateFace(move.face,!move.clockwise,false);
    i--;
    setTimeout(step,400);
  }
  step();
}

function manualRotate(face,clockwise){ rotateFace(face,clockwise); }
function resetCube(){ initCube(); }
initCube();