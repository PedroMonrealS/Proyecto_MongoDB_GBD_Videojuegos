        // Get query string parameters value
        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }
        // Azure storage account
        var account = "stasix1";
        var fileShare = "images";
        var sas ="?sv=2022-11-02&ss=f&srt=co&sp=rwdlc&se=2025-05-17T01:34:28Z&st=2024-05-16T17:34:28Z&spr=https&sig=QxA%2FJQrF9XhHeiGoftAvvdkcu4sfyfs8nUPQOgdcO9s%3D";
        // Initialize the App Client
        const client = stitch.Stitch.initializeDefaultAppClient("samplesjomusic-emkbpax");
        // Get a MongoDB Service Client
        const mongodb = client.getServiceClient(
            stitch.RemoteMongoClient.factory,
            "mongodb-atlas"
        );
        // Get a reference to the music database
        const db = mongodb.db("sample_sjo_music");
        // Function display album
        function displayalbum() {
            var id = getParameterByName('id');
            db.collection("albums")
                .find({"_id": new stitch.BSON.ObjectId(id) })
                .toArray()
                .then(docs => {
                    var datosJuego = document.createElement("div");
                    datosJuego.classList.add("datosJuego");
                    var nombreJuego = document.createElement("h1");
                    nombreJuego.textContent = "Nombre: " + docs[0].nombre;
                    var desarrollador = document.createElement("h1");
                    desarrollador.textContent = "Desarrollador: " + docs[0].desarrollador;
                    var fechaEstreno = document.createElement("h1");
                    fechaEstreno.textContent = "Fecha estreno: " + formatoFecha(docs[0].fechaEstreno);
                    var app = document.createElement("h1");
                    app.textContent = "APP: " + docs[0].app;

                    var plataformasCompatiblesLista = document.createElement("div");
                    var plataformas = '';
                    for (var plataforma in docs[0].formatos) {
                        if (docs[0].formatos[plataforma] === true) {
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

                    for (var i = 0; i < docs[0].images.length; i++) {
                        var foto = document.createElement("img");
                        var src = "https://stasix1.file.core.windows.net/images/" + docs[0].images[i].name + sas;
                        foto.src = src;
                        foto.classList.add("fotoAlbum");
                        var divGrande = document.createElement("div");
                        divGrande.classList.add("divGrande");
                        divGrande.appendChild(foto);
                        divGrande.appendChild(datosJuego);
                        document.getElementById("album").appendChild(divGrande);
                    }
                })
                .catch(error => {
                    console.error("Error al obtener los detalles del álbum:", error);
                });
        }
        // Function execute on load
        function displayAlbumOnLoad() {
            client.auth
                .loginWithCredential(new stitch.AnonymousCredential())
                .then(displayalbum)
                .catch(console.error);
        }

function formatoFecha(fecha){
var dia = fecha.getDate();
var mes = fecha.getMonth() + 1;
var anio = fecha.getFullYear();

var fechaFormateada = dia + '/' + mes + '/' + anio;

}