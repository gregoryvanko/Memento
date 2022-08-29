class UploadImage{
    constructor(ImageHTMLId, Api, ApiData, Callback){
        this._ImageHTMLId = ImageHTMLId
        this._Api = Api
        this._Data = ApiData
        this._Callback = Callback
    }
    Start(){
        const ListOfPopupButton =[
            {Titre: "Close", Action: this.ClosePopup.bind(this, null, null), Id: null},
            {Titre: "Select image", Action: this.OpenFileSelector.bind(this), Id: null}
    ]

        NanoXBuild.PopupCreate(this.BuildContent(), ListOfPopupButton)
        this.OpenFileSelector()
    }
    OpenFileSelector(){
        var fileCmd = "FileSelecteur.click()"
        eval(fileCmd)
    }
    BuildContent(){
        // Creation du div de contenu de la fenetre
        let DivContent = NanoXBuild.DivFlexColumn("DivContentUploadImage")
        // Ajout d'un texte
        DivContent.appendChild(NanoXBuild.DivText("Select a picture", "WindowTxt", "Text","margin-bottom: 1rem;"))
        // Ajout de la progress bar
        let progressring = NanoXBuild.ProgressRing({Id:"ProgressRingLoadImg",FillColor:"WhiteSmoke", ProgressColor: "var(--NanoX-appcolor)", TextColor:"black", Radius:40})
        progressring.style.display = "none"
        DivContent.appendChild(progressring)
        // Ajout de l'element input
        var Input = document.createElement("input")
        Input.setAttribute("type","file")
        Input.setAttribute("name","FileSelecteur")
        Input.setAttribute("id","FileSelecteur")
        Input.setAttribute("accept", 'image/*')
        Input.setAttribute("style","display: none;")
        Input.addEventListener("change", this.SendData.bind(this), false)
        DivContent.appendChild(Input)
        // on construit le texte du message de'erreur
        let DivErrorTexte = NanoXBuild.DivText("","ErrorUploadImage","Text","color:red;")
        DivContent.appendChild(DivErrorTexte)
        return DivContent
    }
    SendData(){
        let me = this
        document.getElementById('ProgressRingLoadImg').style.display = "block"
        var fichierSelectionne = document.getElementById('FileSelecteur').files[0]
        document.getElementById('WindowTxt').innerText = "Picture conversion in progress..."
        this.ToBase64(fichierSelectionne).then((reponse)=>{
            document.getElementById('WindowTxt').innerText = "Upload picture in progress..."
            this._Data.Data = reponse
            //On appel l'API
            NanoXApiPost(this._Api, this._Data,null, this.UploadProg.bind(this)).then((reponse)=>{
                // Timeout de 100 milisec entre la fin de la progressbar et le close window
                setTimeout(function() {
                    me.ClosePopup(me._Data.Data, me._ImageHTMLId)
                }, 100)
            },(erreur)=>{
                document.getElementById('WindowTxt').style.display = "none"
                document.getElementById('ProgressRingLoadImg').style.display = "none"
                document.getElementById('ErrorUploadImage').innerHTML = erreur
            })
        },(erreur)=>{
            document.getElementById('WindowTxt').style.display = "none"
            document.getElementById('progressBar').style.display = "none"
            document.getElementById('ErrorUploadImage').innerText = "Error Base64 convertion: " + erreur
        })
    }
    ToBase64(file){
        var me = this
        return new Promise((resolve, reject)=>{
            var img = new Image()
            var reader = new FileReader()
            reader.onerror = error => reject(error)
            reader.readAsDataURL(file)
            img.onload = function () {
                var width = img.width
                var height = img.height
                if (img.width >= 2000){
                    width = img.width/4
                    height = img.height/4
                }
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                // set proper canvas dimensions before transform & export
                me.getOrientation(file, function (srcOrientation) {
                    if (srcOrientation > 4 && srcOrientation < 9) {
                        canvas.width = height;
                        canvas.height = width;
                    }
                    else {
                        canvas.width = width;
                        canvas.height = height;
                    }
                    // transform context before drawing image
                    switch (srcOrientation) {
                        case 2:
                            ctx && ctx.transform(-1, 0, 0, 1, width, 0);
                            break;
                        case 3:
                            ctx && ctx.transform(-1, 0, 0, -1, width, height);
                            break;
                        case 4:
                            ctx && ctx.transform(1, 0, 0, -1, 0, height);
                            break;
                        case 5:
                            ctx && ctx.transform(0, 1, 1, 0, 0, 0);
                            break;
                        case 6:
                            ctx && ctx.transform(0, 1, -1, 0, height, 0);
                            break;
                        case 7:
                            ctx && ctx.transform(0, -1, -1, 0, height, width);
                            break;
                        case 8:
                            ctx && ctx.transform(0, -1, 1, 0, 0, width);
                            break;
                        default: break;
                    }
                    // draw image
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                    }
                    // export base64
                    resolve(canvas.toDataURL())
                });
            }
            reader.onloadend = function () {
                img.src = reader.result
            }
        })
    }
    UploadProg(Pourcent){
        document.getElementById('WindowTxt').innerText = "Upload picture in progress..."
        document.getElementById("ProgressRingLoadImg").setAttribute('progress', Pourcent);
    }
    getOrientation(file, cb){
        var reader = new FileReader();
        reader.onload = function () {
            var view = new DataView(reader.result);
            if (view.getUint16(0, false) !== 0xFFD8) {
                return cb(-2);
            }
            var length = view.byteLength;
            var offset = 2;
            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;
                if (marker === 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) {
                        return cb(-1);
                    }
                    var little = view.getUint16(offset += 6, false) === 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;
                    for (var i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                            return cb(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                }
                else if ((marker & 0xFF00) !== 0xFF00) {
                    break;
                }
                else {
                    offset += view.getUint16(offset, false);
                }
            }
            return cb(-1);
        }
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
    }

    ClosePopup(Img, Id){
        NanoXBuild.PopupDelete()
        this._Callback(Img, Id)
    }
}