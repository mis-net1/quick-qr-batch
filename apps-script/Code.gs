/**
 * QUICK QR BATCH — Google Sheets -> GitHub Pages
 * v1.0 (10 November 2026)
 * Satu spreadsheet pengelola banyak proyek; satu file data/links.json di GitHub.
 *
 * Pasang sebagai bound Apps Script pada spreadsheet MASTER milik admin:
 * Extensions -> Apps Script. Simpan GitHub PAT hanya di Script Properties:
 * GITHUB_TOKEN (Contents: Read and write, repo mis-net1/quick-qr-batch saja).
 * Jalankan pasangSistem() sekali. Setelah itu:
 *  - Edit URL Tujuan -> otomatis dijadwalkan untuk disinkronkan (batch).
 *  - Centang Kirim -> memproses segera semua perubahan tertunda.
 *  - Menu Quick QR Batch -> Sinkronkan sekarang, Daftarkan QR permanen.
 *
 * PENTING: URL Permanen di kolom E adalah NILAI STATIS, bukan formula.
 */
const QQ = Object.freeze({
  repo: 'mis-net1/quick-qr-batch',
  branch: 'main',
  sheetName: 'Links',
  logName: 'Riwayat',
  registerName: 'Register',
  dataPath: 'data/links.json',
  base: 'https://mis-net1.github.io/quick-qr-batch/',
  headers: ['Project','Kode','Judul','URL Tujuan','URL Permanen',
    'Kirim','Status','Update WIB','Commit','Keterangan'],
  logHeaders: ['Waktu WIB','Project','Kode','Judul','URL sebelumnya',
    'URL baru','Hasil','Commit','Keterangan'],
  registerHeaders: ['Project','Kode','URL Permanen','Terdaftar WIB'],
  timezone: 'Asia/Jakarta'
});

function master_() {
  const id = PropertiesService.getScriptProperties().getProperty('QQ_SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Quick QR Batch')
    .addItem('1. Buat/daftarkan URL QR permanen', 'daftarkanQR')
    .addItem('2. Sinkronkan semua perubahan sekarang', 'sinkronSemua')
    .addItem('3. Cek koneksi GitHub', 'ujiKoneksi')
    .addSeparator()
    .addItem('Pasang/perbarui trigger', 'pasangSistem')
    .addToUi();
}

/** Aman dijalankan sebelum token dibuat; tidak mengubah data yang sudah ada. */
function buatTemplate() {
  const ss = master_();
  let sh = ss.getSheetByName(QQ.sheetName);
  if (!sh) sh = ss.insertSheet(QQ.sheetName);
  const row = sh.getRange(1, 1, 1, QQ.headers.length).getDisplayValues()[0];
  if (row.every(v => !v)) {
    sh.getRange(1, 1, 1, QQ.headers.length).setValues([QQ.headers]);
  } else if (row.some((v, i) => v !== QQ.headers[i])) {
    throw new Error('Header Links!A1:J1 berbeda. Jangan menimpa tabel lain. Gunakan template Quick QR Batch.');
  }
  sh.getRange(1,1,1,QQ.headers.length)
    .setBackground('#1C5143').setFontColor('white').setFontWeight('bold').setWrap(true);
  sh.setFrozenRows(1);
  [135,100,235,390,490,85,155,175,320,390]
    .forEach((width, i) => sh.setColumnWidth(i+1, width));
  const total = sh.getMaxRows();
  if (total > 1) sh.getRange(2,6,total-1,1).insertCheckboxes();
  sh.getRange(2,8,Math.max(1,total-1),1).setNumberFormat('dd mmm yyyy HH:mm:ss');

  let log = ss.getSheetByName(QQ.logName);
  if (!log) log = ss.insertSheet(QQ.logName);
  setHead_(log, QQ.logHeaders);
  let reg = ss.getSheetByName(QQ.registerName);
  if (!reg) reg = ss.insertSheet(QQ.registerName);
  setHead_(reg, QQ.registerHeaders);
  reg.setFrozenRows(1);
  SpreadsheetApp.flush();
  Logger.log('Template siap: Links, Riwayat, Register. QR cetak lama tidak pernah diubah.');
}

function setHead_(sh, headers) {
  const exists = sh.getRange(1,1,1,headers.length).getDisplayValues()[0];
  if (exists.some((v,i) => v && v !== headers[i])) {
    throw new Error('Header tab ' + sh.getName() + ' sudah berbeda. Hentikan setup.');
  }
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.getRange(1,1,1,headers.length)
    .setBackground('#1C5143').setFontColor('white').setFontWeight('bold').setWrap(true);
  sh.setFrozenRows(1);
}

function pasangSistem() {
  buatTemplate();
  ujiKoneksi();
  const ss = master_();
  PropertiesService.getScriptProperties().setProperty('QQ_SPREADSHEET_ID', ss.getId());
  ScriptApp.getProjectTriggers()
    .filter(t => ['qqSaatEdit','qqSinkronTerjadwal'].includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('qqSaatEdit').forSpreadsheet(ss).onEdit().create();
  onOpen();
  Logger.log('SETUP BERHASIL. Trigger edit aktif, tujuan URL tersimpan di ' + QQ.repo);
}

function ujiKoneksi() {
  const reply = github_('get', fileEndpoint_() + '?ref=' + QQ.branch);
  if (!reply.sha || !reply.content) {
    throw new Error('GitHub tidak mengembalikan data/links.json. Upload isi repo dahulu.');
  }
  Logger.log('KONEKSI BACA OK. Owner/repo ' + QQ.repo + ', SHA: ' + reply.sha);
  Logger.log('Izin menulis baru benar-benar teruji saat commit pertama.');
}

function qqSaatEdit(e) {
  if (!e || !e.range || e.range.getSheet().getName() !== QQ.sheetName) return;
  const rg = e.range;
  if (rg.getRow() === 1) return;
  if (rg.getColumn() <= 4 && rg.getLastColumn() >= 4) {
    // Jika ditempel banyak URL sekaligus, commit digabung dalam satu batch.
    const sh = rg.getSheet();
    const start = Math.max(2,rg.getRow());
    const count = Math.min(rg.getLastRow(),sh.getLastRow())-start+1;
    if (count > 0) sh.getRange(start,7,count,1)
      .setValues(Array.from({length:count},()=>['MENUNGGU SINKRON']));
    jadwalkan_();
  } else if (rg.getColumn() === 6 && rg.getNumColumns() === 1 && e.value === 'TRUE') {
    rg.setValue(false);
    sinkronSemua();
  }
}

function jadwalkan_() {
  const props=PropertiesService.getScriptProperties();
  props.setProperty('QQ_PENDING_AT', String(Date.now()));
  if (!ScriptApp.getProjectTriggers()
       .some(t => t.getHandlerFunction() === 'qqSinkronTerjadwal')) {
    ScriptApp.newTrigger('qqSinkronTerjadwal').timeBased().after(60000).create();
  }
}

function qqSinkronTerjadwal() {
  // Hapus trigger sekali jalan; edit berikutnya boleh mengantre kembali.
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'qqSinkronTerjadwal')
    .forEach(t => ScriptApp.deleteTrigger(t));
  sinkronSemua();
}

function daftarkanQR() {
  const ss=master_();
  const sh=ss.getSheetByName(QQ.sheetName);
  if (!sh) throw new Error('Tab Links belum ada. Jalankan buatTemplate.');
  const rows=sh.getLastRow();
  if (rows < 2) return;
  const values=sh.getRange(2,1,rows-1,5).getDisplayValues();
  const reg=ss.getSheetByName(QQ.registerName);
  if (!reg) throw new Error('Tab Register belum dibuat. Jalankan buatTemplate.');
  const existing=registrasiMap_(reg);
  const seen=new Set(); const updates=[], newRegs=[];
  for(let i=0;i<values.length;i++) {
    const [project,code,title,url,permanent]=values[i].map(x=>String(x||'').trim());
    const row=i+2;
    if (![project,code,title,url,permanent].some(Boolean)) continue;
    const key=identitas_(project,code);
    if(seen.has(key)) throw new Error('Duplikat ID '+key+' pada row '+row);
    seen.add(key);
    const expected=permalink_(project,code);
    if(permanent && permanent!==expected) {
      throw new Error('URL Permanen baris '+row+' tidak sama dengan identitasnya. JANGAN diganti, cek Project/Kode.');
    }
    if(existing[key] && existing[key] !== expected) throw new Error('Register tidak cocok untuk '+key);
    if(!permanent)updates.push({row,url:expected});
    if(!existing[key])newRegs.push([project,code,expected,new Date()]);
  }
  // Semua validasi dilakukan SEBELUM ada penulisan.
  updates.forEach(z=>sh.getRange(z.row,5).setValue(z.url));
  if(newRegs.length) reg.getRange(reg.getLastRow()+1,1,newRegs.length,4).setValues(newRegs);
  SpreadsheetApp.flush();
  Logger.log('QR permanen terdaftar: '+newRegs.length+' baru, '+updates.length+' URL diisi.');
  ss.toast('Pendaftaran selesai; URL QR di kolom E adalah NILAI STATIS.','Quick QR Batch',8);
}

function sinkronSemua() {
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(25000)) throw new Error('Sinkronisasi lain sedang berjalan.');
  const ss=master_();
  const sh=ss.getSheetByName(QQ.sheetName);
  let incoming=[], repo=null, changes=[], errors=[], changesToShow=[];
  try {
    daftarkanQR();
    const n=sh.getLastRow();
    if(n < 2){ Logger.log('Belum ada data.');return; }
    const vals=sh.getRange(2,1,n-1,10).getDisplayValues();
    const seen = new Set();
    for(let i=0;i<vals.length;i++) {
      const [project,code,title,target,permalink]=vals[i].map(v=>String(v||'').trim());
      const row=i+2;
      if(!project && !code) continue;
      let key;
      try {
        key=identitas_(project,code);
        if(seen.has(key)) throw Error('Duplikat ID '+key);
        seen.add(key);
        if(permalink!==permalink_(project,code)) throw Error('URL QR tidak sesuai identitas; diblokir');
        if(!target){sh.getRange(row,7).setValue('MENUNGGU URL');continue;}
        validasiTarget_(target);
      } catch(e) {
        errors.push([row,ringkas_(e)]);
        continue;
      }
      incoming.push({row,key,project,code,title,target});
    }
    errors.forEach(([row,msg])=>{sh.getRange(row,7).setValue('ERROR');sh.getRange(row,10).setValue(msg);});
    if(!incoming.length){Logger.log('Tidak ada URL valid untuk dikirim.');return;}

    repo=ambilDataGithub_();
    for(const item of incoming) {
      const old=repo.data.items[item.key];
      if(old && old.url === item.target && old.title === item.title && !old.disabled) {
        if(sh.getRange(item.row,7).getDisplayValue()==='MENUNGGU SINKRON')
          sh.getRange(item.row,7).setValue('TIDAK BERUBAH');
        continue;
      }
      changes.push({item,old:old?.url||''});
      repo.data.items[item.key]={
        url:item.target,title:item.title,disabled:false,
        updatedAt:new Date().toISOString()
      };
    }
    if(!changes.length) {Logger.log('Tidak ada perubahan.');return;}
    repo.data.schema=1;
    repo.data.updatedAt=new Date().toISOString();
    let put;
    try { put=kirimDataGithub_(repo); }
    catch(err) {
      // Jika dua sinkronisasi GitHub bentrok, ambil SHA terbaru dan merge ulang SEKALI.
      if(!String(err).includes('409')) throw err;
      repo=ambilDataGithub_();
      for (const c of changes) repo.data.items[c.item.key]={
        url:c.item.target,title:c.item.title,disabled:false,
        updatedAt:new Date().toISOString()
      };
      repo.data.updatedAt=new Date().toISOString();
      put=kirimDataGithub_(repo);
    }
    const commit=put.commit && put.commit.sha;
    if(!commit) throw Error('GitHub tidak mengirim commit SHA. Cek repository.');
    const commitURL='https://github.com/'+QQ.repo+'/commit/'+commit;
    const now=new Date();
    for(const c of changes) {
      sh.getRange(c.item.row,7,1,4)
        .setValues([['SUKSES DI GITHUB', now, commitURL, 'Menunggu terbit GitHub Pages; uji QR setelah deploy.']]);
      changesToShow.push([now,c.item.project,c.item.code,c.item.title,
        c.old,c.item.target,'SUKSES DI GITHUB',commitURL,'Data JSON tersimpan; publikasi Pages belum diverifikasi.']);
    }
    try {
      const log=ss.getSheetByName(QQ.logName);
      log.getRange(log.getLastRow()+1,1,changesToShow.length,QQ.logHeaders.length)
        .setValues(changesToShow);
    } catch(err) {
      Logger.log('Commit berhasil, tetapi catatan Riwayat gagal: '+ringkas_(err));
    }
    Logger.log('SUKSES: '+changes.length+' link dari '+QQ.repo+' disinkronkan satu commit: '+commitURL);
  } catch(err) {
    const message=ringkas_(err);
    if(sh && incoming.length){
      incoming.forEach(x=>{
        sh.getRange(x.row,7).setValue('GAGAL');
        sh.getRange(x.row,10).setValue(message);
      });
    }
    Logger.log('GAGAL SINKRON: '+message);
    throw err;
  } finally {
    lock.releaseLock();
    SpreadsheetApp.flush();
  }
}

function registrasiMap_(sh) {
  const n=sh.getLastRow();
  const result={};
  if(n>1){
    sh.getRange(2,1,n-1,3).getDisplayValues().forEach(row=>{
      if(row[0]&&row[1])result[row[0]+'/'+row[1]]=row[2];
    });
  }
  return result;
}

function identitas_(project, code) {
  if(!/^[a-z0-9][a-z0-9_-]{0,39}$/.test(project))
    throw Error('Project harus slug huruf kecil/angka/-/_ (maks. 40 karakter).');
  if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,59}$/.test(code))
    throw Error('Kode hanya boleh huruf/angka/titik/-/_ (maks. 60 karakter).');
  return project + '/' + code;
}

function permalink_(project,code) {
  identitas_(project,code);
  return QQ.base+'?p='+encodeURIComponent(project)+'&c='+encodeURIComponent(code);
}

function validasiTarget_(url) {
  if(!/^https:\/\/[a-z0-9.-]+(?::443)?(?:[/?#][^\s<>"']*)?$/i.test(url))
    throw Error('URL tujuan wajib HTTPS publik, misalnya https://www.tiktok.com/effect/...');
  const host=url.slice(8).split(/[/:?#]/)[0].toLowerCase();
  if(['localhost','127.0.0.1','0.0.0.0'].includes(host) ||
    /^(?:10|127|192\.168|169\.254)\./.test(host) ||
    /\.local$/.test(host)) throw Error('URL menuju alamat internal tidak diperbolehkan.');
}

function fileEndpoint_(){return 'https://api.github.com/repos/'+QQ.repo+'/contents/'+QQ.dataPath;}
function token_(){
  const t=PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if(!t || t.length<20)throw Error('GITHUB_TOKEN belum ada di Project Settings > Script Properties.');
  return t.trim();
}
function github_(method,url,body) {
  const options={
    method:method,muteHttpExceptions:true,
    headers:{Authorization:'Bearer '+token_(),Accept:'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28','User-Agent':'Quick-QR-Batch'}
  };
  if(body!==undefined){options.contentType='application/json';options.payload=JSON.stringify(body);}
  const res=UrlFetchApp.fetch(url,options);
  let data;
  try{data=JSON.parse(res.getContentText());}catch(_){data={message:res.getContentText().slice(0,140)};}
  if(res.getResponseCode()<200 || res.getResponseCode()>299)
    throw Error('GitHub HTTP '+res.getResponseCode()+': '+ringkas_(data.message||'Gagal'));
  return data;
}
function ambilDataGithub_() {
  const file=github_('get',fileEndpoint_()+'?ref='+QQ.branch);
  if(file.encoding!=='base64'||!file.sha||!file.content)throw Error('File JSON GitHub invalid.');
  const text=Utilities.newBlob(Utilities.base64Decode(file.content.replace(/\s/g,'')))
    .getDataAsString('UTF-8');
  const data=JSON.parse(text);
  if(!data || typeof data.items!=='object' || Array.isArray(data.items))
    throw Error('Struktur data/links.json tidak sesuai.');
  return {sha:file.sha,data};
}
function kirimDataGithub_(repo) {
  const encoded=Utilities.base64Encode(JSON.stringify(repo.data,null,2)+'\n',Utilities.Charset.UTF_8);
  return github_('put',fileEndpoint_(),{
    message:'Update QR targets from Google Sheets',
    branch:QQ.branch,sha:repo.sha,content:encoded
  });
}
function ringkas_(err){return String(err?.message||err).slice(0,290);}
