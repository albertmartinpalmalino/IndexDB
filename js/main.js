/*
* IndexedDB
* */
createDatabase();
function createDatabase() {
    if (!('indexedDB' in window)){
        console.log('Web Browser tidak mendukung Indexed DB');
        return;
    }
    var request = window.indexedDB.open('latihan-pwa',1);
    request.onerror = errordbHandle;
    request.onupgradeneeded = (e)=>{
        var db = e.target.result;
        db.onerror = errordbHandle;
        var objectStore = db.createObjectStore('mahasiswa',
            {keyPath: 'nim'});
        console.log('Object store mahasiswa berhasil dibuat');
    }
    request.onsuccess = (e) => {
        db = e.target.result;
        db.error = errordbHandle;
        console.log('Berhasil melakukan koneksi ke database lokal');
        
        bacaDariDB();
        // lakukan sesuatu ...
    }
}

function errordbHandle(e) {
    console.log('Error DB : '+e.target.errorCode);
}

var tabel = document.getElementById('tabel-mahasiswa'),
    nim = document.getElementById('nim'),
    nama = document.getElementById('nama'),
    gender = document.getElementById('gender'),
    form = document.getElementById('form-tambah');

    
tabel.addEventListener('click',hapusBaris);
form.addEventListener('submit',tambahBaris);

function tambahBaris(e){
    //cek nim apakah sudah ada
    if(tabel.rows.namedItem(nim.value)){
        alert('Error: NIM sudah terdaftar');
        e.preventDefault();
        return;
    }
    //masukkan data ke database
    tambahkeDB({
        nim : nim.value,
        nama : nama.value,
        gender  :gender.value
    });

    //append baris baru dari data form
    var baris = tabel.insertRow();
    baris.id = nim.value;
    baris.insertCell().appendChild(document.createTextNode(nim.value));
    baris.insertCell().appendChild(document.createTextNode(nama.value));
    baris.insertCell().appendChild(document.createTextNode(gender.value));

    //tambah bagian di button delete
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = nim.value;
    btn.className = 'btn btn-sm btn-danger';
    baris.insertCell().appendChild(btn);
    e.preventDefault();
}

function tambahkeDB(mahasiswa){
    var objectStore = buatTransaksi().objectStore('mahasiswa');
    var request = objectStore.add(mahasiswa);
    request.onerror = errordbHandle;
    request.onsuccess = console.log('Mahasiswa ['+mahasiswa.nim+'] '+'berhasil di tambahkan')
}

function buatTransaksi(){
    var transaction = db.transaction(['mahasiswa'],'readwrite');
    transaction.error = errordbHandle;
    transaction.complete = console.log('Transaksi selesai');

    return transaction;
}

function bacaDariDB(){
    var objectStore = buatTransaksi().objectStore('mahasiswa');
    objectStore.openCursor().onsuccess = (e) => {
        var result = e.target.result;
        if(result){
            console.log('Membaca ['+ result.value.nim+'] dari BD');
            //apend baris dari database
            var baris = tabel.insertRow();
            baris.id = nim.value;
            baris.insertCell().appendChild(document.createTextNode(result.value.nim));
            baris.insertCell().appendChild(document.createTextNode(result.value.nama));
            baris.insertCell().appendChild(document.createTextNode(result.value.gender));

            //apend tombol hapus
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = result.value.nim;
            btn.className = 'btn btn-sm btn-danger';
            baris.insertCell().appendChild(btn);
            result.continue();

        }
    }
}

function hapusBaris(e){
    if(e.target.type==='button'){
        var hapus = confirm('Apakah Anda yakin Menghapus Data ?');
        if(hapus){
            tabel.deleteRow(tabel.rows.namedItem(e.target.id).sectionRowIndex);
            hapusDariDB(e.target.id);
        }
    }
}

function hapusDariDB(nim){
    var objectStore = buatTransaksi().objectStore('mahasiswa');
    var request = objectStore.delete(nim);
    request.onerror = errordbHandle;
    request.onsuccess = console.log('Mahasiswa ['+nim+'] terhapus');
}