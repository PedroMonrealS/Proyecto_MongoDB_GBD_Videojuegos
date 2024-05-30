// Azure storage account
var account = "stasix1";
var fileShare = "images";
var sas ="?sv=2022-11-02&ss=f&srt=co&sp=rwdlc&se=2025-05-17T01:34:28Z&st=2024-05-16T17:34:28Z&spr=https&sig=QxA%2FJQrF9XhHeiGoftAvvdkcu4sfyfs8nUPQOgdcO9s%3D";

var currentPath = '';
var fileUri = '';
var currentPath = [];

//Aquí podemos cambiar de base de datos
const database = "sample_sjo_music"; //sample_sjo_music
const collection = "albums";    //albums

function checkParameters() {

    if (account == null || account.length < 1) {
        alert('Please enter a valid storage account name!');
        return false;
    }
    if (sas == null || sas.length < 1) {
        alert('Please enter a valid SAS Token!');
        return false;
    }

    return true;
}

function getFileService() {
    if (!checkParameters())
        return null;

    fileUri = 'https://' + account + '.file.core.windows.net';
    var fileService = AzureStorage.File.createFileServiceWithSas(fileUri, sas).withFilter(new AzureStorage.File.ExponentialRetryPolicyFilter());
    return fileService;
}

function viewFileShare(selectedFileShare) {
    fileShare = selectedFileShare;
    alert('Selected ' + fileShare + ' !');
    currentPath = [];
    refreshDirectoryFileList();
}

function refreshDirectoryFileList(directory) {
    var fileService = getFileService();
    if (!fileService)
        return;

    if (fileShare.length < 1) {
        alert('Please select one file share!');
        return;
    }

    if (typeof directory === 'undefined')
        var directory = '';
    if (directory.length > 0)
        currentPath.push(directory);
    directory = currentPath.join('\\\\');

    document.getElementById('directoryFiles').innerHTML = 'Loading...';
}

function displayProcess(process) {
    document.getElementById('progress').style.width = process + '%';
    document.getElementById('progress').innerHTML = process + '%';
}

function createFileFromStream(checkMD5) {
    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }
    var success = 0;

    for (j = 0; j < files.length; j++) {
        var file = files[j];

        var fileService = getFileService();
        if (!fileService)
            return;

        var btn = document.getElementById("upload-button");
        btn.disabled = true;
        btn.innerHTML = "Uploading";
        var finishedOrError = false;
        var options = {
            contentSettings: {
                contentType: file.type
            },
            storeFileContentMD5: checkMD5
        };

        var speedSummary = fileService.createFileFromBrowserFile(fileShare, currentPath.join('\\\\'), file.name, file, options, function (error, result, response) {
            finishedOrError = true;
            btn.disabled = false;
            btn.innerHTML = "Upload";
            if (error) {
                alert("Upload failed, open browser console for more detailed info.");
                console.log(error);
                displayProcess(0);
            } else {
                // Upload Success !!
                displayProcess(100);
                setTimeout(function () {
                    alert('Upload successfully!');
                }, 1000);
                success++;
                if (success == files.length) {
                    // Insert document in a collection of MongoDB data base
                    insertAlbum(
                        document.getElementById('nombre').value,
                        document.getElementById('desarrollador').value,
                        document.getElementById('fechaEstreno').value,
                        document.getElementById('app').value,
                        document.getElementById('PC').checked,
                        document.getElementById('PS').checked,
                        document.getElementById('XBOX').checked,
                        document.getElementById('Switch').checked,
                        document.getElementById('files').files)
                }
                // Refresh directory file list
                refreshDirectoryFileList();
            }
        });
    }

    speedSummary.on('progress', function () {
        var process = speedSummary.getCompletePercent();
        displayProcess(process);
    });
}






// JS del cliente
const client = stitch.Stitch.initializeDefaultAppClient("samplesjomusic-emkbpax");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
    stitch.RemoteMongoClient.factory,
    "mongodb-atlas"
);
// Get a reference to the music database
const db = mongodb.db(database);
// Function display albums
function displayalbums() {
    db.collection(collection)
        .find()
        .toArray()
        .then(docs => {
            console.log(docs);
            for (j = 0; j < docs.length; j++) {

                var datosJuego = document.createElement("div");
                datosJuego.classList.add("datosJuego");
                var nombreJuego = document.createElement("h1");
                nombreJuego.textContent = "Nombre: " + docs[j].nombre;
                var desarrollador = document.createElement("h1");
                desarrollador.textContent = "Desarrollador: " + docs[j].desarrollador;
                var fechaEstreno = document.createElement("h1");
                
                fechaEstreno.textContent = "Fecha estreno: " + formatoFecha(docs[j].fechaEstreno);
                var app = document.createElement("h1");
                app.textContent = "APP: " + docs[j].app;


/*                 <a href='/album-by-id.html?id=${albumId}'>Ver detalles</a> - 
                <a href='#' onclick='deleteAlbum("${albumId}");'>Eliminar álbum</a> */


                var DIVOpciones = document.createElement("div");
                DIVOpciones.classList.add("DIVOpciones");
                var VerDetalles = document.createElement("a");
                VerDetalles.textContent = "Ver detalles";
                VerDetalles.href = '../detalles/detalles.html?id=' + docs[j]._id;
                var Eliminar = document.createElement("a");
                Eliminar.textContent = "Eliminar";
                var albumId = docs[j]._id
                Eliminar.onclick = function() {
                    deleteAlbum(albumId);
                };
                DIVOpciones.appendChild(VerDetalles);
                DIVOpciones.appendChild(Eliminar);


                var plataformasCompatiblesLista = document.createElement("div");
                var plataformas = " ";
                var plataformas = '';
                

                for (var plataforma in docs[j].formatos) {
                    if (docs[j].formatos[plataforma] === true) {
                        if (plataformas !== '') {
                            plataformas += ', ';
                        }
                        plataformas += plataforma;
                    }
                }
                
                var plataformaCompatible = document.createElement("h1");
                plataformaCompatible.textContent = "Plataformas: " + plataformas;
                plataformasCompatiblesLista.appendChild(plataformaCompatible);
                
                
                datosJuego.appendChild(nombreJuego);
                datosJuego.appendChild(desarrollador);
                datosJuego.appendChild(fechaEstreno);
                datosJuego.appendChild(plataformasCompatiblesLista);
                datosJuego.appendChild(app);
                datosJuego.appendChild(DIVOpciones);



                for (i = 0; i < docs[j].images.length; i++) {
                    var foto = document.createElement("img");
                    var src = "https://stasix1.file.core.windows.net/images/" + docs[j].images[i].name + "?sv=2022-11-02&ss=f&srt=co&sp=rwdlc&se=2025-05-17T01:34:28Z&st=2024-05-16T17:34:28Z&spr=https&sig=QxA%2FJQrF9XhHeiGoftAvvdkcu4sfyfs8nUPQOgdcO9s%3D";
                    foto.src = src;
                    foto.classList.add("fotoAlbum");
                    var divGrande = document.createElement("div");
                    divGrande.classList.add("divGrande");


                    divGrande.appendChild(foto);
                    divGrande.appendChild(datosJuego);
                    document.getElementById("albums").appendChild(divGrande);



                }
             }
        });
}
// Function execute on load
function displayAlbumsOnLoad() {
    client.auth
        .loginWithCredential(new stitch.AnonymousCredential())
        .then(displayalbums)
        .catch(console.error);
}
function insertAlbum(parnombre, pardesarrollador, parfechaEstreno, parapp, parPC, parPS, parXBOX, parSwitch, parImages) {
    var varPC = Boolean(parPC);
    var varPS = Boolean(parPS);
    var varXBOX = Boolean(parXBOX);
    var varSwitch = Boolean(parSwitch);

    // InsertOne
    db.collection(collection)
        .insertOne({
            owner_id: client.auth.user.id,
            nombre: parnombre,
            desarrollador: pardesarrollador,
            fechaEstreno: new Date(parfechaEstreno),
            app: parapp,

            formatos: {
                PC: parPC,
                PS: parPS,
                XBOX: parXBOX,
                Switch: parSwitch

            },
            images: parImages
        })
        .then();

        setTimeout(function() {
            window.location.reload();
          }, 1000);
}
function deleteAlbum(parId) {
    const query = { "_id": new stitch.BSON.ObjectId(parId) };
    db.collection(collection).deleteOne(query).then();
    setTimeout(function() {
        window.location.reload();
      }, 1000);
}


function formatoFecha(fecha){
var dia = fecha.getDate();
var mes = fecha.getMonth() + 1;
var anio = fecha.getFullYear();

var fechaFormateada = dia + '/' + mes + '/' + anio;

}