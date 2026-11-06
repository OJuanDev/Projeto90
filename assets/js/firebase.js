
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, sendPasswordResetEmail, signOut, setPersistence, browserLocalPersistence} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const firebaseConfig={apiKey:'AIzaSyDkBJMgCnSwgB6tczher5-2rSJGsj-hVGk',authDomain:'projeto90-356ea.firebaseapp.com',projectId:'projeto90-356ea',storageBucket:'projeto90-356ea.firebasestorage.app',messagingSenderId:'1057133569444',appId:'1:1057133569444:web:7e8d21738af1990c0b4d31'};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const screen=document.getElementById('authScreen'),error=document.getElementById('authError'),form=document.getElementById('authForm'),status=document.getElementById('syncStatus');
const provider=new GoogleAuthProvider();
let createMode=false,writeTimer=null,unsub=null,latestInput=null,pending=false,lastSerialized='',activeUID=null,epoch=0;
function message(str){error.textContent=str||'';}
function statusSet(s){status.textContent=s;status.title=s;}
function readable(err){const code=err?.code||'';return ({'auth/invalid-credential':'E-mail ou senha inválidos.','auth/email-already-in-use':'Este e-mail já está cadastrado.','auth/weak-password':'Crie uma senha com pelo menos 6 caracteres.','auth/invalid-email':'Informe um e-mail válido.','auth/popup-blocked':'O navegador bloqueou a janela de login.','auth/unauthorized-domain':'Adicione este domínio em Firebase Authentication → Domínios autorizados.','permission-denied':'Permissão negada no Firestore. Confira as regras de segurança.','auth/network-request-failed':'Falha de conexão com a internet.'})[code]||err?.message||'Não foi possível concluir. Tente novamente.'}
const key=uid=>'projeto90.user.'+uid;
const cloudRef=uid=>doc(db,'users',uid,'app','state');
function cache(uid,payload){try{localStorage.setItem(key(uid),JSON.stringify(payload));}catch(e){console.warn('Cache local não disponível',e)}}
function restoreLocal(uid){try{return JSON.parse(localStorage.getItem(key(uid)))}catch{return null}}
function resetAfterLogout(){window.projectFirebaseUID=null;window.projectFirebaseEmail=null;window.projectCloudSave=null;activeUID=null;latestInput=null;pending=false;lastSerialized='';window.projectApplyCloudState(window.projectNewAccountDefaults());document.body.classList.add('auth-locked');screen.hidden=false;statusSet('Desconectado')}
window.projectSignOut=async()=>{if(writeTimer){clearTimeout(writeTimer);writeTimer=null;if(latestInput&&activeUID){try{await setDoc(cloudRef(activeUID),{payload:latestInput,updatedAt:serverTimestamp()})}catch(e){console.error(e)}}}await signOut(auth)};
function queueSave(snapshot){if(!activeUID)return;latestInput=snapshot;pending=true;statusSet('Sincronizando...');clearTimeout(writeTimer);const thisEpoch=epoch,uid=activeUID;writeTimer=setTimeout(async()=>{writeTimer=null;const candidate=latestInput;const serialized=JSON.stringify(candidate);try{await setDoc(cloudRef(uid),{payload:candidate,updatedAt:serverTimestamp()});if(thisEpoch!==epoch)return;lastSerialized=serialized;pending=false;statusSet('✓ Sincronizado')}catch(e){if(thisEpoch!==epoch)return;pending=false;statusSet('⚠ Sem sincronização');console.error(e);window.toast?.('Não foi possível salvar na nuvem. Verifique sua conexão e as regras do Firestore.')}},750)}
window.projectCloudSave=queueSave;
async function startSession(user){
  const myEpoch=++epoch; activeUID=user.uid;window.projectFirebaseUID=user.uid;window.projectFirebaseEmail=user.email||'';statusSet('Carregando dados...');
  if(unsub){unsub();unsub=null}
  // Espera a leitura da nuvem antes de permitir edições, evitando sobrescrita acidental.
  try{
    const snap=await getDoc(cloudRef(user.uid));if(myEpoch!==epoch)return;
    let remote=snap.exists()?snap.data()?.payload:null;
    if(!remote){const own=restoreLocal(user.uid);if(own)remote=own;else{
      let legacy=null;try{legacy=JSON.parse(localStorage.getItem('projeto90.v1'))}catch{}
      const hasLegacy=legacy&&(legacy.measurements?.length||Object.keys(legacy.habits||{}).length||Object.keys(legacy.workoutChecks||{}).length||Object.keys(legacy.shoppingChecks||{}).length||legacy.settings?.name);
      if(hasLegacy&&confirm('Encontramos dados da versão anterior neste navegador. Deseja associá-los a esta conta Firebase?'))remote=legacy;
      else remote=window.projectNewAccountDefaults();
    }}
    window.projectApplyCloudState(remote);cache(user.uid,remote);lastSerialized=JSON.stringify(remote);
    document.body.classList.remove('auth-locked');screen.hidden=true;message('');statusSet('✓ Sincronizado');
    if(!snap.exists())queueSave(remote);
    unsub=onSnapshot(cloudRef(user.uid),docSnap=>{
      if(myEpoch!==epoch||!docSnap.exists()||pending)return;
      const incoming=docSnap.data()?.payload;if(!incoming)return;
      const serial=JSON.stringify(incoming);
      if(serial!==lastSerialized){lastSerialized=serial;cache(user.uid,incoming);window.projectApplyCloudState(incoming);statusSet('✓ Sincronizado')}
    },e=>{if(myEpoch===epoch){console.error('Erro realtime:',e);statusSet('⚠ Verifique regras')}});
  }catch(e){if(myEpoch!==epoch)return;console.error(e);message(readable(e));statusSet('⚠ Erro de leitura');screen.hidden=false;document.body.classList.add('auth-locked');}
}
form.addEventListener('submit',async e=>{e.preventDefault();const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value;message('');const btn=document.getElementById('authSubmit');btn.disabled=true;btn.textContent='Conectando...';try{await(createMode?createUserWithEmailAndPassword(auth,email,password):signInWithEmailAndPassword(auth,email,password))}catch(err){message(readable(err))}finally{btn.disabled=false;btn.textContent=createMode?'Criar minha conta':'Entrar na conta'}});
document.getElementById('authMode').addEventListener('click',()=>{createMode=!createMode;document.getElementById('authSubmit').textContent=createMode?'Criar minha conta':'Entrar na conta';document.getElementById('authMode').textContent=createMode?'Já tenho uma conta':'Criar conta';message('')});
document.getElementById('passwordReset').addEventListener('click',async()=>{const email=document.getElementById('authEmail').value.trim();if(!email){message('Informe seu e-mail acima para receber o link de recuperação.');return}try{await sendPasswordResetEmail(auth,email);message('Se o e-mail estiver cadastrado, você receberá instruções de recuperação.')}catch(e){message(readable(e))}});
document.getElementById('googleLogin').addEventListener('click',async()=>{message('');try{await signInWithPopup(auth,provider)}catch(e){if(e.code==='auth/popup-blocked'||e.code==='auth/cancelled-popup-request'){try{await signInWithRedirect(auth,provider)}catch(ex){message(readable(ex))}}else message(readable(e))}});
try{await setPersistence(auth,browserLocalPersistence);await getRedirectResult(auth);onAuthStateChanged(auth,user=>{if(user){if(activeUID!==user.uid)startSession(user)}else{epoch++;if(unsub){unsub();unsub=null}clearTimeout(writeTimer);resetAfterLogout()}})}catch(e){message('Não foi possível iniciar o Firebase. Abra o site por HTTPS com conexão e confira a configuração. '+readable(e));console.error(e)}
