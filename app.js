const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const crypto = require('crypto');
const iv = crypto.randomBytes(16);
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);



function cifrar(text){
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let cifrado = cipher.update(text);
    //cifrado += cipher.final('hex');
    cifrado = Buffer.concat([cifrado, cipher.final()]);
    return  {
        iv: iv.toString('hex'),
        infoCifrada: cifrado.toString('hex'),
        key: key.toString('base64'),
        algorithm: algorithm.toString()
    }

}

function descifrar(text) { 
  
    let iv = Buffer.from(text.iv, 'hex'); 
    let encryptedText = 
       Buffer.from(text.infoCifrada, 'hex'); 
     
    // Creating Decipher 
    let decipher = crypto.createDecipheriv( 
           'aes-256-cbc', Buffer.from(key), iv); 
     
    // Updating encrypted text 
    let decrypted = decipher.update(encryptedText); 
    decrypted = Buffer.concat([decrypted, decipher.final()]); 
     
    // returns data after decryption 
    return decrypted.toString(); 
}     
module.exports = {cifrar, descifrar}

  // Encrypts output 
  //var output = cifrar("test"); 
  //console.log(output); 
    
  // Decrypts output 
 // console.log("info descifrada: "+ descifrar(output)); 

app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});

http.listen(3000, function(){
    console.log('sv en puerto 3000');
})

io.on('connection', function(socket){
    console.log('se conecto un usuario');
    let user;
    socket.on('crearUsuario', function(data){
        user = data;
    })


    socket.on('mensajeNuevo', function(data){
        socket.broadcast.emit('mensaje', {
            usuario: user,
            mensaje: data
        })
    })
    socket.on('mensajeNuevo', function(data){
        socket.emit('mensaje', {
            usuario: user,
            mensaje: data,
        })
    })
})

