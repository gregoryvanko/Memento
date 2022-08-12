class UploadImage{
    constructor(ImageHTMLId, Api, ApiData, Callback){
        this._ImageHTMLId = ImageHTMLId
        this._Api = Api
        this._Data = ApiData
        this._Callback = Callback
    }
    Start(){
        CoreXWindow.BuildWindow(this.BuildContent())
        this.OpenFileSelector()
    }
    OpenFileSelector(){
        var fileCmd = "FileSelecteur.click()"
        eval(fileCmd)
    }
    BuildContent(){
        // Creation du div de contenu de la fenetre
        let DivContent = CoreXBuild.Div("DivContentUploadImage")
        // Ajout d'un texte
        DivContent.appendChild(CoreXBuild.DivTexte("Select a picture", "WindowTxt", "Text"))
        // Ajout de la progress bar
        DivContent.appendChild(CoreXBuild.ProgressBar("progressBar","","width: 100%; visibility:hidden;"))
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
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorUploadImage","Text","color:red;")
        DivContent.appendChild(DivErrorTexte)
        // Add button Select File
        let DivButton = CoreXBuild.DivFlexColumn("ListOfButton")
        let ButtonSelect = CoreXBuild.Button("Select image",this.OpenFileSelector.bind(this),"Button")
        DivButton.appendChild(ButtonSelect)
        DivContent.appendChild(DivButton)
        return DivContent
    }
    SendData(){
        let me = this
        document.getElementById('ListOfButton').style.visibility = "hidden"
        document.getElementById('progressBar').style.visibility = "visible"
        var fichierSelectionne = document.getElementById('FileSelecteur').files[0]
        document.getElementById('WindowTxt').innerText = "Picture conversion in progress..."
        this.ToBase64(fichierSelectionne).then((reponse)=>{
            document.getElementById('WindowTxt').innerText = "Upload picture in progress..."
            this._Data.Data = reponse
            //On appel l'API
            GlobalCallApiPromise(this._Api, this._Data,this.UploadProg.bind(this)).then((reponse)=>{
                document.getElementById(this._ImageHTMLId).src = this._Data.Data
                // Timeout de 100 milisec entre la fin de la progressbar et le close window
                setTimeout(function() {
                    me._Callback(me._Data.Data, me._ImageHTMLId)
                    CoreXWindow.DeleteWindow()
                }, 100)
            },(erreur)=>{
                document.getElementById('WindowTxt').style.display = "none"
                document.getElementById('progressBar').style.display = "none"
                document.getElementById('ErrorUploadImage').innerText = "Error Base64 convertion: " + erreur
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
    UploadProg(event){
        document.getElementById('WindowTxt').innerText = "Upload picture in progress..."
        let progression = Math.round(((event.loaded / event.total) * 100))
        document.getElementById("progressBar").value = progression
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
}

class GetImageSrc{
    constructor(){}
    Start(){
        return new Promise((resolve, reject)=>{
            CoreXWindow.BuildWindow(this.BuildContent(resolve, reject))
            this.OpenFileSelector()
        })
    }
    OpenFileSelector(){
        var fileCmd = "FileSelecteur.click()"
        eval(fileCmd)
    }
    BuildContent(resolve, reject){
        // Creation du div de contenu de la fenetre
        let DivContent = CoreXBuild.Div("DivContentImage")
        // Ajout d'un texte
        DivContent.appendChild(CoreXBuild.DivTexte("Select a picture", "WindowTxt", "Text"))
        // on construit le texte du message de'erreur
        let DivErrorTexte = CoreXBuild.DivTexte("","ErrorUploadImage","Text","color:red;")
        DivContent.appendChild(DivErrorTexte)
        // Add button Select File
        let DivButton = CoreXBuild.DivFlexColumn("ListOfButton")
        let ButtonSelect = CoreXBuild.Button("Select image",this.OpenFileSelector.bind(this),"Button")
        DivButton.appendChild(ButtonSelect)
        DivContent.appendChild(DivButton)
        // Ajout de l'element input
        var Input = document.createElement("input")
        Input.setAttribute("type","file")
        Input.setAttribute("name","FileSelecteur")
        Input.setAttribute("id","FileSelecteur")
        Input.setAttribute("accept", 'image/*')
        Input.setAttribute("style","display: none;")
        Input.addEventListener("change", ()=>{
            var fichierSelectionne = document.getElementById('FileSelecteur').files[0]
            document.getElementById('WindowTxt').innerText = "Picture conversion in progress..."
            this.ToBase64(fichierSelectionne).then((reponse)=>{
                CoreXWindow.DeleteWindow()
                resolve(reponse)
            },(erreur)=>{
                document.getElementById('WindowTxt').style.display = "none"
                document.getElementById('ErrorUploadImage').innerText = "Error Base64 convertion: " + erreur
            })
        }, false)
        DivContent.appendChild(Input)
        return DivContent
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
}