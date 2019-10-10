var color = {rojo: 'red', verde: 'green', azul: 'blue', amarillo: 'yellow'};
$('#btnCancelar').on('click', ()=>{
    window.location.href="http://10.51.20.51:/"
});

$('#test').on('click', ()=>{
    // var str = '{"array":[{"LICENCIA":{"NOMBRES": "ROSMER JESUS","APELLIDOS": "CAMPOS PEROZA","GRADO": 4,"FECHA_ORIGINAL": "19/02/2014","FECHA_RENOVACION": "","CONDICION": "ACTIVA"},"MULTAS_DVTT_PNB": {"ESTATUS": "NO POSEE MULTAS PENDIENTES POR PAGAR ANTE LA DVTT-PNB"},"MULTAS_INTT": {"ESTATUS": "NO POSEE MULTAS PENDIENTES POR PAGAR ANTE EL INTT"}}]}'
    // var str = '{"mana": "mono"}'
    var str = `
    [
        {
                "LICENCIA":
                {
                    "NOMBRES": "ROSMER JESUS",
                    "APELLIDOS": "CAMPOS PEROZA",
                    "GRADO": 4,
                    "FECHA_ORIGINAL": "19/02/2014",
                    "FECHA_RENOVACION": "",
                    "CONDICION": "ACTIVA"
                },
                "MULTAS_DVTT_PNB": 
                {
                    "ESTATUS": "NO POSEE MULTAS PENDIENTES POR PAGAR ANTE LA DVTT-PNB"
                },
                "MULTAS_INTT": 
                {
                    "ESTATUS": "NO POSEE MULTAS PENDIENTES POR PAGAR ANTE EL INTT"
                }
        }
    ]`
    var s =JSON.parse(str);
    console.log(s)

})

$('#btnRegistrar').on('click', ()=>{
    var username = $('#username').val();
    var password = $('#password').val();
    var repassword = $('#repassword').val();
    var nombres = $('#nombres').val();
    var apellidos = $('#apellidos').val();
    var sexo = $('#sexo').val();
    var correo = $('#correo').val();

    if(!password || !username || !correo){
        new jBox('Notice', {
            content: 'Debes ingresar todos los campos marcados con *',
            color: color.amarillo,
            animation: {
                open: 'slide:top',
                close: 'slide:right'
            },
            delayOnHover: true,
            showCountdown: true
        });
        $('#password').focus();
        return;
    }
    
    if(password.length < 8){
        new jBox('Notice', {
            content: 'La contraseña tener por lo menos 8 caractéres!',
            color: color.amarillo,
            animation: {
                open: 'slide:top',
                close: 'slide:right'
            },
            delayOnHover: true,
            showCountdown: true
        });
        $('#password').focus();
        return;
    }

    if(password !== repassword){
        new jBox('Notice', {
            content: 'La contraseña no coincide!',
            color: color.amarillo,
            animation: {
                open: 'slide:top',
                close: 'slide:right'
            },
            delayOnHover: true,
            showCountdown: true
        });
        $('#password').focus();
        return;
    }

    var datos = {
        username: username,
        password: password,
        nombres: nombres,
        apellidos: apellidos,
        correo: correo,
        sexo: sexo
    }
    console.log(datos)
    $('#loader').fadeIn(500);
    fetch("/api/registrarse", {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(datos)})
    .then(res=> res.json())
    .catch(error=>{
        $('#loader').fadeOut(500);
        console.error("Error: ",  error)
    })
    .then(resp=>
        {
            if(!resp.error){
                new jBox('Notice', {
                    color: color.verde,
                    content: '¡Usuario Registrado!',
                    animation: {
                      open: 'slide:top',
                      close: 'slide:right'
                    },
                    delayOnHover: true,
                    showCountdown: true
                  });
                setTimeout(()=>{
                    window.location.href = "http://10.51.20.51/auth/iniciar_sesion"
                }, 2000)
            }else{
                new jBox('Notice', {
                    color: color.rojo,
                    content: 'Error: ' + resp.mensaje,
                    animation: {
                      open: 'slide:top',
                      close: 'slide:right'
                    },
                    delayOnHover: true,
                    showCountdown: true
                  });
                }
                $('#loader').fadeOut(500);
                return
        });
});

