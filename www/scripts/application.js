angular.module('SteroidsApplication', [
  'supersonic'
])
.controller('IndexController', function($scope, supersonic) {
    
});

$(document).ready(function(){
    
    checkLogin();
    
    if(getSession() === true){
        getTotalCoupon();
    }
    
    $(".ion-loop").click(function(){
       //$(this).removeClass('ion-loop');
       //$(this).addClass('ion-looping');
       //setTimeout(function() { window.location.reload(); }, 1000);
       getOffers(0);
       
    });
    
    setInterval(function(){ setTimeout(function() { getTotalCoupon(); }, 0); }, 30000);
    //bindClick();
   
});

var geocoder;
var map;
var marker;

function bindClick(){
    $("a.changePage").click(function(){
        $('body').append("<img src='/img/loading.gif' width='100' height='100' style='margin: auto 25%; top: 50%; margin-top: -100px; position: relative; z-index: 9989;' >");
    });
}

function getPath(){
    return "http://54.207.83.196/prc/prc.php?ctl=mobile&acao=";
    //return "http://54.207.83.196:8080/Servidor_SmartPromos/rest/service/";
    //return "http://www.smartpromos.com.br/Servidor_SmartPromos/rest/service/";
    //return "http://192.168.1.245:8080/Servidor_SmartPromos/rest/service/";
}

function getRestApi(metodo, param){
    var url = getPath();
    url+= metodo;
    url+= param;
    return url;
}

function getSession(){
    
    if(localStorage.getItem("cpf") !== null && localStorage.getItem("cpf") !== "null"){        
        return true;
    }else{
       return false;      
    }
}

function logout(){
    localStorage.clear(); 
    
    window.location.href='http://localhost/index.html';
}

function checkLogin(){
    if( parseInt( localStorage.getItem("stay_logged_in") ) === 0){
       
        var LogadoEm = parseInt(localStorage.getItem("LogadoEm"));
        
        if( (LogadoEm+24) > parseInt( localStorage.getItem("ExpiraEm") ) ){
            localStorage.clear();
            location.reload();
        }
    }
}

function login() {

    //steroids.view.displayLoading();
    
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha").value;

    var msg = validarCamposLogin(email, senha);
    if (msg === "ERRO") {
        
        var options = {
            message: "Preencha seu login e senha.",
            buttonLabel: "Fechar"
        };
        supersonic.ui.dialog.alert("SmartPromos", options);

    } else {
         
        if (validarEmail(document.getElementById("email")) == "OK") {
            localStorage.clear();
            
            $.ajax({
                dataType: "json",
                type: "GET",
                url: getRestApi("loginCustmerUser", "&email=" + email.trim() + "&senha=" + senha.trim()),
                //url: getRestApi("loginCustmerUser", "?email=" + email.trim() + "&senha=" + senha.trim()),
                success: function (data) {
                    
                    if (data === "") {
                        
                        var options = {
                            message: "Por favor, verifique seu usuário e senha",
                            buttonLabel: "Fechar"
                        };
                        supersonic.ui.dialog.alert("SmartPromos", options);
                        $("#email").focus();
                    } else {
                        localStorage.clear();
                        
                        if(parseInt(data.manterLogado) !== 1){
                            
                            var time = new Date();
                            LogadoEm = time.getHours();
                            ExpiraEm = time.getHours() + 24;
                            
                            window.localStorage.setItem("ExpiraEm", ExpiraEm);
                            window.localStorage.setItem("LogadoEm", LogadoEm);
                            
                        }
                        
                        window.localStorage.setItem("email", data.email);
                        window.localStorage.setItem("cpf", data.cpf);
                        window.localStorage.setItem("telefone", ((data.telefone === null) ? "" : data.telefone));
                        window.localStorage.setItem("nome", data.nome);
                        window.localStorage.setItem("sobrenome", data.sobrenome);
                        window.localStorage.setItem("sexo", data.sexo);
                        
                        window.localStorage.setItem("stay_logged_in", data.sexo);
                        window.localStorage.setItem("sale_radius", data.raioOferta);
                        window.localStorage.setItem("get_offers", data.manterLogado);
                        
                        mes = parseInt(data.mesAniversario);
                        if( mes < 10 ){
                                mes = "0"+data.mesAniversario;
                        }
                        dia = parseInt(data.diaAniversario);
                        if( dia < 10 ){
                                dia = "0"+data.diaAniversario;
                        }
                        window.localStorage.setItem("dataNascimento", data.anoAniversario+"-"+mes+"-"+dia);

                        getTotalCoupon();
                        
                        window.location.href="http://localhost/index.html";
                    }
                    

                },
                error: function (e) {
                    supersonic.logger.log(e);
                    var options = {
                        message: "Não foi possível efetuar o login.\nPor favor, tente mais tarde.",
                        buttonLabel: "Fechar"
                    };
                    supersonic.ui.dialog.alert("SmartPromos", options);

                    //steroids.view.removeLoading();
                } // END error

            });
        }

    }

}

function validarCamposLogin(email, senha) {
    if (email === "") {
        return "ERRO";
    }

    if (senha === "") {
        return "ERRO";
    }

}

function goToCupom(Elem){
    //alert("Ta indo"+Elem.getAttribute("id"));
    getCupom(Elem.getAttribute("id"), Elem.getAttribute("alt"));
    
}

function refresh(){
    //alert("ok");
    getOffers(0);
    getTotalCoupon();
}

function getRequests() {

    var value = localStorage.getItem("email");
    
    var d = document.getElementById("listNewCoupons");
    d.innerHTML = "<img src='/img/loading.gif' width='100' height='100' id='loading' >";
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("getListaPlacesBySolicitadosClientes", "&email=" + value),
        //url: getRestApi("getListaPlacesBySolicitadosClientes", "?email=" + value),
        success: function (data) {
            //alert("ok");
            //alert(JSON.stringify(data));
            
            var len = data.length;
            
            HTML= "";
            if(len === 0){
                strHTML = "<li class='item'>Nenhuma oferta solicitada.</li>";
                HTML+=strHTML;
            }
            
            for (var i = 0; i < len; i++) {
                var nome = data[i].nome;
                
                strHTML = "<li class='item'>" + nome + "</li>";
                HTML+=strHTML;
                
            }
            
            d2 = document.getElementById("listNewCoupons");
            d2.innerHTML = HTML;
            
        },
        error: function (e) {

            //steroids.view.removeLoading();
        } // END error

    });
    
}

function getOffers(status) {
    var value = localStorage.getItem("email");
    
    d = document.getElementById("listNewCoupons");
    d.innerHTML = "<img src='/img/loading.gif' width='100' height='100' id='loading' >";
    
    if(value !== "undefined"){
        
        $("#ico_sinc").removeClass('ion-loop');
        $("#ico_sinc").addClass('ion-looping');
        
        $.ajax({
            dataType: "json",
            type: "GET",
            url: getRestApi("getCouponsByEmail", "&email=" + value+"&status="+status),
            //url: getRestApi("getCouponsByEmail", "?email=" + value+"&status="+status),
            success: function (data) {
                //alert("ok");
                //alert(JSON.stringify(data));
                
                var novoArr = new Array();
                var a =0;
                for (var i = 0; i < data.length; i++) {

                    if(novoArr.length == 0){
                        novoArr[a] = data[i];
                        a++;
                    }else{

                        if(array_search(data[i].id, novoArr) == 0){

                            novoArr[a] = data[i];
                            a++;						
                        }
                    }

                }

                for (var i = 0; i < novoArr.length; i++) {
                    //console.log(array_search(novoArr[i].id, novoArr));
                    novoArr[i].quantidade = array_search(novoArr[i].id, data);
                }
                
                if(data.length === undefined){
                    var len = 0;
                }else{
                    var len = (data.length > 0) ? novoArr.length : 0;
                }
                
                HTML= "";

                if(len === 0){
                    strHTML = '<div class="card">';                
                        strHTML+= '<div class="item item-body">';                    
                            strHTML+='<p class="descricao">Não encontramos nenhuma nova oferta.</p>';                        
                        strHTML+= '</div>';                    
                    strHTML+= '</div>';

                    HTML+=strHTML;
                }
                
                var t = 0;
                
                for (var i = 0; i < len; i++) {
                    var nome = novoArr[i].nome;
                    var id = novoArr[i].id;
                    var mensagem = novoArr[i].cabecalho;
                    var imagem = novoArr[i].pathImg;
                    var dataInicio = novoArr[i].sale.dataInicio;
                    var dataFim = novoArr[i].sale.dataFim;
                    var nomeEmpresa = novoArr[i].sale.establishment.nomeFantasia;
                    var quantidade = novoArr[i].quantidade;
                    
                    strHTML = '<div class="card">';
                
                        strHTML+= '<div class="item item-divider clickAcc" alt="aprovar" id="' + id + '" onClick="goToCupom(this);">';
                            strHTML+=nomeEmpresa;
                            strHTML+='<span class="badge badge-assertive" id="tCupons">'+quantidade+'</span>';
                        strHTML+= '</div>';

                        strHTML+= '<div class="item item-image clickAcc" alt="aprovar" id="' + id + '" onClick="goToCupom(this);">';
                            strHTML+='<img src="'+imagem+'">';
                        strHTML+= '</div>';

                        strHTML+= '<div class="item item-body">';

                            strHTML+='<p><strong style="font-size: 18px; display: block; text-align: center;">'+nome+'</strong></p>';

                            strHTML+='<p class="descricao">'+mensagem+'</p>';

                            strHTML+='<p><span>inicia em '+dataInicio+' | Finaliza '+dataFim+'</span></p>';

                            strHTML+= '<i class="icon ion-checkmark-circled btn button-positive" data-status="1" data-id="'+id+'" onClick="setCupomStatus(this);"></i>';
                            strHTML+= '<i class="icon ion-close-circled btn button-assertive" data-status="2" data-id="'+id+'" onClick="setCupomStatus(this);"></i>';

                        strHTML+= '</div>';

                    strHTML+= '</div>';
                   
                    HTML+=strHTML;
                    t++;
                }
                
                d2 = document.getElementById("listNewCoupons");
                d2.innerHTML = HTML;
                
                $("#ico_sinc").removeClass('ion-looping');
                $("#ico_sinc").addClass('ion-loop');                
                getTotalCoupon();
            },
            error: function (e) {
                
            } // END error

        });
    }else{
        var options = {
            message: "Sua sessão expirou! Por favor, efetue o login novamente.",
            buttonLabel: "Fechar"
        };
        supersonic.ui.dialog.alert("SmartPromos", options);
    }
    
}

function getMeusCupons(st)  {
    
    var value = localStorage.getItem("email");
    
    d = document.getElementById("listNewCoupons");
    d.innerHTML = "<img src='/img/loading.gif' width='100' height='100' id='loading' >";
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("getCouponsByEmail", "&email=" + value+"&status="+st),
        //url: getRestApi("getCouponsByEmail", "?email=" + value+"&status="+st),
        success: function (data) {
            //alert("ok");
            
            var novoArr = new Array();
            var a =0;
            for (var i = 0; i < data.length; i++) {

                if(novoArr.length == 0){
                    novoArr[a] = data[i];
                    a++;
                }else{

                    if(array_search(data[i].id, novoArr) == 0){

                        novoArr[a] = data[i];
                        a++;						
                    }
                }

            }

            for (var i = 0; i < novoArr.length; i++) {
                //console.log(array_search(novoArr[i].id, novoArr));
                novoArr[i].quantidade = array_search(novoArr[i].id, data);
            }

            HTML= "";
            
            
            if(data.length === undefined){
                var len = 0;
            }else{
                var len = (data.length > 0) ? novoArr.length : 0;
            }
            
            if(len === 0){
                
                strHTML = '<div class="card">';                
                    strHTML+= '<div class="item item-body">';                    
                        strHTML+='<p class="descricao">Não encontramos nenhum cupom com essa opção.</p>';                        
                    strHTML+= '</div>';                    
                strHTML+= '</div>';
                
                HTML+=strHTML;
            }
            
            for (var i = 0; i < len; i++) {
                var nome = novoArr[i].nome;
                var id = novoArr[i].id;
                var mensagem = novoArr[i].cabecalho;
                var imagem = novoArr[i].pathImg;
                var dataInicio = novoArr[i].sale.dataInicio;
                var dataFim = novoArr[i].sale.dataFim;
                var nomeEmpresa = novoArr[i].sale.establishment.nomeFantasia;
                var quantidade = novoArr[i].quantidade;
                
                strHTML = '<div class="card">';
                
                    strHTML+= '<div class="item item-divider clickAcc" alt="cupom" id="' + id + '" onClick="goToCupom(this);">';
                        strHTML+=nomeEmpresa;
                        strHTML+='<span class="badge badge-assertive" id="tCupons">'+quantidade+'</span>';
                    strHTML+= '</div>';

                    strHTML+= '<div class="item item-image clickAcc" alt="cupom" id="' + id + '" onClick="goToCupom(this);">';
                        strHTML+='<img src="'+imagem+'">';
                    strHTML+= '</div>';
                    
                    strHTML+= '<div class="item item-body">';
                    
                        strHTML+='<p><strong style="font-size: 18px; display: block; text-align: center;">'+nome+'</strong></p>';
                        
                        strHTML+='<p class="descricao">'+mensagem+'</p>';
                        
                        strHTML+='<p><span>inicia em '+dataInicio+' | Finaliza '+dataFim+'</span></p>';
                        
                        strHTML+= '<i class="icon ion-plus-circled btn button-positive clickAcc" alt="cupom" id="' + id + '" onClick="goToCupom(this);"></i>';
                        
                    strHTML+= '</div>';
                    
                strHTML+= '</div>';
                
                HTML+=strHTML;
                
            }
            d = document.getElementById("listNewCoupons");
            d.innerHTML = HTML;
        },
        error: function (e) {
            
            //steroids.view.removeLoading();
        } // END error

    });
    
}

function getMyCouponsDiscards(status) {
    var value = localStorage.getItem("email");
    
    d = document.getElementById("listNewCoupons");
    d.innerHTML = "<img src='/img/loading.gif' width='100' height='100' id='loading' >";
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("getCouponsByEmail", "&email=" + value+"&status="+status),
        //url: getRestApi("getCouponsByEmail", "?email=" + value+"&status="+status),
        success: function (data) {
            //alert("ok");
            
            var novoArr = new Array();
            var a =0;
            for (var i = 0; i < data.length; i++) {

                if(novoArr.length == 0){
                    novoArr[a] = data[i];
                    a++;
                }else{

                    if(array_search(data[i].id, novoArr) == 0){

                        novoArr[a] = data[i];
                        a++;						
                    }
                }

            }

            for (var i = 0; i < novoArr.length; i++) {
                //console.log(array_search(novoArr[i].id, novoArr));
                novoArr[i].quantidade = array_search(novoArr[i].id, data);
            }

            
            if(data.length === undefined){
                var len = 0;
            }else{
                var len = (data.length > 0) ? novoArr.length : 0;
            }
            
            HTML= "";
            
            if(len === 0){
                
                strHTML = '<div class="card">';                
                    strHTML+= '<div class="item item-body">';                    
                        strHTML+='<p class="descricao">Não encontramos nenhum cupom com essa opção.</p>';                        
                    strHTML+= '</div>';                    
                strHTML+= '</div>';
                
                HTML+=strHTML;
            }
            
            for (var i = 0; i < len; i++) {
                var nome = novoArr[i].nome;
                var id = novoArr[i].id;
                var mensagem = novoArr[i].cabecalho;
                var imagem = novoArr[i].pathImg;
                var dataInicio = novoArr[i].sale.dataInicio;
                var dataFim = novoArr[i].sale.dataFim;
                var nomeEmpresa = novoArr[i].sale.establishment.nomeFantasia;
                var quantidade = novoArr[i].quantidade;
                
                strHTML = '<div class="card">';
                
                    strHTML+= '<div class="item item-divider clickAcc" alt="cupon-descartado" id="' + id + '" onClick="goToCupom(this);">';
                        strHTML+=nomeEmpresa;
                        strHTML+='<span class="badge badge-assertive" id="tCupons">'+quantidade+'</span>';
                    strHTML+= '</div>';

                    strHTML+= '<div class="item item-image clickAcc" alt="cupon-descartado" id="' + id + '" onClick="goToCupom(this);">';
                        strHTML+='<img src="'+imagem+'">';
                    strHTML+= '</div>';
                    
                    strHTML+= '<div class="item item-body">';
                    
                        strHTML+='<p><strong style="font-size: 18px; display: block; text-align: center;">'+nome+'</strong></p>';
                        
                        strHTML+='<p class="descricao">'+mensagem+'</p>';
                        
                        strHTML+='<p><span>inicia em '+dataInicio+' | Finaliza '+dataFim+'</span></p>';
                        
                        strHTML+= '<i class="icon ion-plus-circled btn button-positive clickAcc" alt="cupon-descartado" id="' + id + '" onClick="goToCupom(this);"></i>';
                        
                    strHTML+= '</div>';
                    
                strHTML+= '</div>';
                
                HTML+=strHTML;
                
            }
            d = document.getElementById("listNewCoupons");
            d.innerHTML = HTML;
        },
        error: function (e) {

            //steroids.view.removeLoading();
        } // END error

    });
    
}

function getOffersCount(status) {
    var value = localStorage.getItem("email");
    var total = 0;
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("getCouponsByEmail", "&email=" + value+"&status="+status),
        //url: getRestApi("getCouponsByEmail", "?email=" + value+"&status="+status),
        success: function (data) {
            var novoArr = new Array();
            var a =0;
            
            for (var i = 0; i < data.length; i++) {

                if(novoArr.length == 0){
                    novoArr[a] = data[i];
                    a++;
                }else{

                    if(array_search(data[i].id, novoArr) == 0){

                        novoArr[a] = data[i];
                        a++;						
                    }
                }

            }

            for (var i = 0; i < novoArr.length; i++) {
                //console.log(array_search(novoArr[i].id, novoArr));
                novoArr[i].quantidade = array_search(novoArr[i].id, data);
            }


            
            if(data.length === undefined){
                var len = 0;
            }else{
                var len = (data.length > 0) ? novoArr.length : 0;
            }
            //Armazeno o total de cupons recebidos e exidor no drawer
            if(len === null || len === "null" || len === undefined){
                len = 0;
            }
            
            window.localStorage.setItem("numPromo", len);
            
            $("#totalOfertas").text(len);
            $("#totalOfertas2").text(len);
            if(len > 0){
                $("#totalOfertas2").show();
            }else{
                $("#totalOfertas2").hide();
            }
        },
        error: function (e) {

            //steroids.view.removeLoading();
        } // END error

    });
    
    return localStorage.getItem('numPromo');
}

function getCupom(id, page){
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("getCupomByIdMobile", "&cupomId=" + id),
        //url: getRestApi("getCupomById", "?cupomId=" + id),
        success: function (data) {
            
            window.localStorage.setItem("dataid", data.id);
            window.localStorage.setItem("titleCupom", data.nome);
            window.localStorage.setItem("descCupom", data.descricao);
            window.localStorage.setItem("imgCupom", data.pathImg);
            window.localStorage.setItem("dataInicio", data.sale.dataInicio);
            window.localStorage.setItem("dataFim", data.sale.dataFim);
            window.localStorage.setItem("headerEmpresa", data.sale.establishment.nomeFantasia);
            var cnpjEmpresa = data.sale.establishment.cnpj;
            var codigoUtilizacao = cnpjEmpresa.substr(0, 4);
            window.localStorage.setItem("codigoUtilizacao", codigoUtilizacao);
            
            
                
            window.location.href='http://localhost/'+page+".html";
        },
        error: function (e) {

            //steroids.view.removeLoading();
        } // END error

    });
    
}

function setCupomStatus(Elem){
    //alert(Elem.getAttribute("data-id"));
    var cpf = localStorage.getItem("cpf");
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("setCupomStatus", "&myCupomId=" + Elem.getAttribute("data-id").trim()+"&cpf=" + cpf.trim()+"&status="+Elem.getAttribute("data-status").trim()),
        //url: getRestApi("setCupomStatus", "?myCupomId=" + Elem.getAttribute("data-id").trim()+"&cpf=" + cpf.trim()+"&status="+Elem.getAttribute("data-status").trim()),
        success: function (data) {
            //alert(data[0].msg);
                        
            if(data[0].msg === "ACEITO"){                
                var options = {
                    message: "Cupom aceito.\nObrigado!",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Cupom de Promoção", options);
                
                window.location.href="http://localhost/meus-cupons.html";
            }else if(data[0].msg === "RECUSADO"){
                var options = {
                    message: "Obrigado pela atenção!\nFique alerta para novas promoções.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Cupom de Promoção", options);
                
                window.location.href="http://localhost/descartados.html";
            }else if(data[0].msg === "ERRO"){
                var options = {
                    message: "Ocorreu um erro ao tentar atualizar seu cupom.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Cupom de Promoção", options);
            }
            getOffers(0);
            //getRequests();
            
        },
        error: function (e) {
            if(cpf === 0){
                var options = {
                    message: "Parece que sua sessão expirou.\nEfetue o login novamente.",
                    buttonLabel: "Fechar"
                };
                logout();
            }else{
                var options = {
                    message: "Ocorreu um erro ao tentar atualizar seu cupom.",
                    buttonLabel: "Fechar"
                };
            }
            
            supersonic.ui.dialog.alert("Cupom de Promoção", options);
            //steroids.view.removeLoading();
        } // END error

    });
   
}

function utilizarCupom(Elem){
    var options = {
        message: "Por favor, digite o código de confirmação.",
        buttonLabels: ["Confirmar", "Cancelar"],
        defaultText: "Insira o código"
      };

      supersonic.ui.dialog.prompt("Utilizar Cupom", options).then(function(result) {
        //supersonic.logger.log("User clicked button number " + result.buttonIndex + " with text " + result.input);
        if(result.buttonIndex === 0){
            if(result.input === "" && result.input ==="Insira o código"){
                utilizarCupom(Elem);
            }else{
                if(result.input === Elem.getAttribute("data-cod")){
                    $.ajax({
                        dataType: "json",
                        type: "GET",
                        url: getRestApi("utilizarCupon", "&codigo=" + result.input+"&cupom=" + Elem.getAttribute("data-id")+"&usuario="+localStorage.getItem('cpf')),
                        //url: getRestApi("utilizarCupon", "?codigo=" + result.input+"&cupom=" + Elem.getAttribute("data-id")+"&usuario="+localStorage.getItem('cpf')),
                        success: function (data) {
                            
                            if(data[0].msg === "ACEITO"){
                                var options = {
                                    message: "Cupom utilizado com sucesso",
                                    buttonLabel: "Fechar"
                                };
                                supersonic.ui.dialog.alert("Utilizar Cupom", options);
                                
                                window.location.href="http://localhost/usados.html";
                            }else if(data[0].msg === "ERRO_CUPOM"){
                                var options = {
                                    message: "Não conseguimos localizar o cupom. Por favor, tente novamente mais tarde.",
                                    buttonLabel: "Fechar"
                                };
                                supersonic.ui.dialog.alert("Utilizar Cupom", options);
                            }else if(data[0].msg === "ERRO_ESTAB"){
                                var options = {
                                    message: "Não localizamos a empresa responsável pelo cupom. Por favor, tente novamente mais tarde.",
                                    buttonLabel: "Fechar"
                                };
                                supersonic.ui.dialog.alert("Utilizar Cupom", options);
                            }else if(data[0].msg === "ERRO_CODE"){
                                var options = {
                                    message: "Código inválido. Por favor, tente novamente.",
                                    buttonLabel: "Fechar"
                                };
                                supersonic.ui.dialog.alert("Utilizar Cupom", options);
                            }else if(data[0].msg === "ERRO_LISTA"){
                                var options = {
                                    message: "Não conseguimos utilizar seu cupom. Por favor, tente novamente mais tarde.",
                                    buttonLabel: "Fechar"
                                };
                                supersonic.ui.dialog.alert("Utilizar Cupom", options);
                            }
                            
                        },
                        error: function (e) {
                            var options = {
                                message: "Não conseguimos utilizar seu cupom. Por favor, tente novamente mais tarde.",
                                buttonLabel: "Fechar"
                            };
                            supersonic.ui.dialog.alert("Utilizar Cupom", options);
                        } // END error

                    });
                    
                }else{
                    var options = {
                        message: "Código inválido. Por favor, tente novamente.",
                        buttonLabel: "Fechar"
                    };
                    supersonic.ui.dialog.alert("Utilizar Cupom", options);
                }
                
            }
            
        }
        
      });
}

function getTotalCoupon(){
    getOffersCount(0);    
}

function cadastrar() {

    var msg = validarCamposCadastro(nome, sobrenome, email, cpf, data, senha);
    // if(msg === "ERRO"){
    //    alert("CAMPOS OBRIGATÓRIOS NÃO PREENCHIDOS")   
    // }else{
    //    if(validarEmail(email) == "OK"){
    showMap();
    //     }

    // }

}

function validarCamposCadastro(nome, sobrenome, email, cpf, data, senha) {


    if (nome.value === "") {

        return "ERRO"
    }

    if (sobrenome.value === "") {

        return "ERRO"
    }

    if (email.value === "") {

        return "ERRO"
    }

    if (cpf.value === "") {

        return "ERRO"
    }

    if (data.value === "") {

        return "ERRO"
    }

    if (senha.value === "") {

        return "ERRO"
    }

    return "OK"
}

function validarEmail(field) {
    var filed2 = field.value.trim();
    usuario = filed2.substring(0, filed2.indexOf("@"));
    dominio = filed2.substring(filed2.indexOf("@") + 1, filed2.length);


    if ((usuario.length >= 1) &&
            (dominio.length >= 3) &&
            (usuario.search("@") == -1) &&
            (dominio.search("@") == -1) &&
            (usuario.search(" ") == -1) &&
            (dominio.search(" ") == -1) &&
            (dominio.search(".") != -1) &&
            (dominio.indexOf(".") >= 1) &&
            (dominio.lastIndexOf(".") < dominio.length - 1)) {

        return "OK"
    }
    else {
        
        var options = {
            message: "Digite um e-mail válido!",
            buttonLabel: "Fechar"
        };
        supersonic.ui.dialog.alert("SmartPromos", options);

    }
}

function checkLocation(){
    
    var options = {
        message: "Olá, ative o serviço de localização do celular para realizar o cadastro.",
        buttonLabel: "Ok, entendi!"
    };
    supersonic.ui.dialog.alert("SmartPromos", options);
       
}

function showMap() {

    navigator.geolocation.getCurrentPosition(showPosition, showError);
    //supersonic.device.geolocation.getPosition(showPosition,showError);
}

function showPosition(position)
{

    var latlon = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    getAddress(latlon);

    map = new google.maps.Map(document.getElementById('mapa'), {
        center: {lat: position.coords.latitude, lng: position.coords.longitude},
        zoom: 15
    });

    marker = new google.maps.Marker({
        position: {lat: position.coords.latitude, lng: position.coords.longitude},
        map: map,
        title: 'Eu'
    });

    //convert location into longitude and latitude
}

function getAddress(coords) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': coords}, function (results, status) {
        if (status = google.maps.GeocoderStatus.OK) {

            var html = "";

            html += '<input type="hidden" name="endereco" id="endereco" value="' + results[0].address_components[1].long_name + ", " + results[0].address_components[0].long_name + '" />';

            html += '<input type="hidden" name="bairro" id="bairro" value="' + results[0].address_components[2].long_name + '" />';

            html += '<input type="hidden" name="cidade" id="cidade" value="' + results[0].address_components[3].long_name + '" />';

            html += '<input type="hidden" name="estado" id="estado" value="' + results[0].address_components[4].long_name + '" />';

            html += '<input type="hidden" name="pais" id="pais" value="' + results[0].address_components[5].long_name + '" />';

            html += '<input type="hidden" name="cep" id="cep" value="' + results[0].address_components[7].long_name + '" />';

            html += '<input type="hidden" name="tipo" id="tipo" value="1" />';

            window.localStorage.setItem("locale", html);

            //d = document.getElementById("locationDate");
            //d.innerHTML = html;
        }
    });

    return false;
}

function cancelChandeLocation() {
    document.getElementById("hiddenNEnd").style.display = "none";
}

function openNewLocation() {
    document.getElementById("hiddenNEnd").style.display = "block";
}

function changeLocation() {

    var endereco = document.getElementById("nEnd").value;
    if (endereco != "") {
        document.getElementById("hiddenNEnd").style.display = "none";
        geocoder.geocode({'address': endereco + ', Brasil', 'region': 'BR'}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {

                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();

                    var location = new google.maps.LatLng(latitude, longitude);
                    marker.setPosition(location);
                    map.setCenter(location);
                    map.setZoom(17);
                    coords = {
                        lat: latitude,
                        lng: longitude
                    };
                    getAddress(coords);
                }
            }
        });

    } else {
        document.getElementById("hiddenNEnd").style.display = "block";
        
        var options = {
            message: "Por favor, digite a sua nova localização para continuar seu cadastro.",
            buttonLabel: "Fechar"
        };
        supersonic.ui.dialog.alert("SmartPromos", options);

    }

}

function showError(error)
{

    document.getElementById("searching").style.display = 'none';
    switch (error.code)
    {
        case error.PERMISSION_DENIED:
            map.innerHTML = "User denied the request for Geolocation."
            var options = {
                message: "Precisamos ter acesso a sua localização.\nPor favor, lative o seu GPS.",
                buttonLabel: "Fechar"
            };
            supersonic.ui.dialog.alert("SmartPromos", options);
            break;
        case error.POSITION_UNAVAILABLE:
            map.innerHTML = "Location information is unavailable."
            var options = {
                message: "Sua localização esta indisponível, verifique se seu GPS esta ativo ou clique no botão voltar do topo e tente novamente.",
                buttonLabel: "Fechar"
            };
            supersonic.ui.dialog.alert("SmartPromos", options);
            break;
        case error.TIMEOUT:
            map.innerHTML = "The request to get user location timed out."
            var options = {
                message: "A requisição estourou o tempo limite. Clique no botão voltar no topo e tente novamente.",
                buttonLabel: "Fechar"
            };
            supersonic.ui.dialog.alert("SmartPromos", options);
            break;
        case error.UNKNOWN_ERROR:
            map.innerHTML = "An unknown error occurred."
            var options = {
                message: "Ocorreu um erro desconhecido, isso pode ter relação com a sua rede ou se sua localização e GPS estiverem inativas. x(",
                buttonLabel: "Fechar"
            };
            supersonic.ui.dialog.alert("SmartPromos", options);
            break;
    }


}

function RetiraAcentos(Campo) {
    var Acentos = "-./,";
    var Traducao = "";
    var Posic, Carac;
    var TempLog = "";

    for (var i = 0; i < Campo.length; i++)
    {
        Carac = Campo.charAt(i);
        Posic = Acentos.indexOf(Carac);

        if (Posic > -1)
            TempLog += Traducao.charAt(Posic);
        else
            TempLog += Campo.charAt(i);
    }
    return (TempLog);
}

function showCadastro(){
    window.location.href="http://localhost/cadastro.html";
}

function loadInfoCoupon(){

    $("#titleHeader").text(localStorage.getItem("headerEmpresa"));
    //$("#headerCoupon").text(localStorage.getItem("headerEmpresa"));
    $("#titleCoupon").text(localStorage.getItem("titleCupom"));
    $("#descCupom").text(localStorage.getItem("descCupom"));

    $("#imgCupom").attr("src", localStorage.getItem("imgCupom"));
    $("#dataInicio").text(localStorage.getItem("dataInicio"));
    $("#dataFim").text(localStorage.getItem("dataFim"));
    $(".accButton").attr("data-id", localStorage.getItem("dataid"));
    $(".accButton").attr("data-cod", localStorage.getItem("codigoUtilizacao"));
}

function sincronizar() {


    alert("Aguarde alguns minutos até o fim do processo!")



    // var form = document.getElementById('formulario');
    var cpf = document.getElementById('cpf');
    var senha = document.getElementById('senha');

    //var googleView = new steroids.views.WebView("http://www.google.com");

    //navigator.notification.beep(2);

    //steroids.view.displayLoading();
    $.ajax({
        type: "get",        
        url: getRestApi("sincronizar/", cpf.value + "," + senha.value),
        success: function (data) {

            var googleView = new steroids.views.WebView("C:/Users/Roque/Smart/app/example/views/user_relat.html");


        },
        error: function () {

            //steroids.view.removeLoading();
            // alert('failure');
        }

    });

}


function array_search(needle, haystack) {

        var a = 0;

        for (var i = 0; i < haystack.length; i++) {

                if(haystack[i].id == needle){
                        a = a + 1;
                }

        }

        return a;
}

function getLastStabRequest(){
    var place_id = localStorage.getItem("placeEstab");
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("getPlaceByPlaceId", "&place="+place_id),
        //url: getRestApi("getPlaceByPlaceId", "?place="+place_id),
        success: function (data) {
            $("#estabName").text(data.nome);
            window.localStorage.setItem("placeEstab", null);
        },
        error: function (e) {
            var options = {
                message: "Não conseguimos localizar a sua requisição. x(",
                buttonLabel: "Fechar"
            };
            supersonic.ui.dialog.alert("SmartPromos", options);                            
        } // END error

    });
    
}

function updateFinish(lista) {

    var json = JSON.stringify(lista);
    //steroids.logger.log(getRestApi("updateCustmer", "&cliente="+json));
    $(".bgLoading").show();
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("updateCustmer", "&cliente="+json),
        //url: getRestApi("updateCustmer", "?cliente="+json),
        success: function (data) {
            $(".bgLoading").hide();
            if(data == "E-mail já cadastrado no sistema"){
                var options = {
                    message: "Este e-mail já esta em uso!\nEscolha outro endereço de e-mail, por gentileza.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Alteração de cadastro", options);
                $("#email_cadastroNew").focus();
            }else if(data == "ERRO"){
                var options = {
                    message: "Ocorreu um erro ao tentar atualizar o seu cadastro, tente novamente.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Alteração de cadastro", options);
            }else{
                
                window.localStorage.setItem("email", data.email);
                window.localStorage.setItem("cpf", data.cpf);
                window.localStorage.setItem("telefone", data.telefone);
                window.localStorage.setItem("nome", data.nome);
                window.localStorage.setItem("sobrenome", data.sobrenome);
                window.localStorage.setItem("sexo", data.sexo);                
                		
                mes = parseInt(data.mesAniversario);
                if( mes < 10 ){
                        mes = "0"+data.mesAniversario;
                }
                dia = parseInt(data.diaAniversario);
                if( dia < 10 ){
                        dia = "0"+data.diaAniversario;
                }
                window.localStorage.setItem("dataNascimento", data.anoAniversario+"-"+mes+"-"+dia);


                var options = {
                    message: "Cadastro atualizado com sucesso!",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Alteração de cadastro", options);
            }
            

        },
        error: function (jqXHR, status, error) {
            var err = eval("(" + jqXHR.responseText + ")");
            $(".bgLoading").hide();
            alert(err.Message);
            
        }
        //error: function(e){
        //    alert("Não foi possível efetuar seu cadastro.");
        //steroids.view.removeLoading();
        //} // END error

    });

}

function updateSettingsFinish(lista) {

    var json = JSON.stringify(lista);
    //alert(json);
    $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("updateCustmerSettings", "&cliente="+json),
        //url: getRestApi("updateCustmerSettings", "?cliente="+json),
        success: function (data) {
           
            if( data[0].msg === "ERRO" ){
                var options = {
                    message: "Olá, "+localStorage.getItem('nome')+"!\nOcorreu um erro ao tentar atualizar as suas preferências.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Configurações", options);
            }else{
                var options = {
                    message: "Olá, "+localStorage.getItem('nome')+"! Suas preferências foram salvas com sucesso!",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Configurações", options);
            }
           

        },
        error: function (jqXHR, status, error) {
            var err = eval("(" + jqXHR.responseText + ")");
            alert(err.Message);
        }
        //error: function(e){
        //    alert("Não foi possível efetuar seu cadastro.");
        //steroids.view.removeLoading();
        //} // END error

    });

}

function resetPass(){
    
    var email = $("#email").val();
    
    if(email !== ""){
        
        $.ajax({
        dataType: "json",
        type: "GET",
        url: getRestApi("resetPass", "&email="+email.trim()),
        success: function (data) {
           
            if( data[0].msg === "OK" ){
                var options = {
                    message: "Olá!\nFoi enviando uma mensagem para a sua conta de e-mail com a sua senha temporária.\nNão esqueça de mudar sua senha assim que realizar o login.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Recuperar Senha", options);
            }else if( data[0].msg === "ERRO_AO_ATUALIZAR" ){
                var options = {
                    message: "Olá!\nOcorreu um erro ao tentar recuperar a sua senha.\nPor favor, tente novamente.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Recuperar Senha", options);
            }else if( data[0].msg === "NULL" ){
                var options = {
                    message: "Não conseguimos localizar seu cadastro!\nVerifique seu e-mail e tente novamente.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Recuperar Senha", options);
            }else{
                var options = {
                    message: "Desculpe! Ocorreu um erro interno em nosso servidor.\nEstamos trabalhando para resolver este problema.\nPor favor, tente novamente mais tarde.",
                    buttonLabel: "Fechar"
                };
                supersonic.ui.dialog.alert("Recuperar Senha", options);
            }
           

        },
        error: function (jqXHR, status, error) {
            var err = eval("(" + jqXHR.responseText + ")");
            alert(err.Message);
        }
    });
        
    }else{
        var options = {
            message: "Por favor, preencha seu e-mail para continuarmos!",
            buttonLabel: "Fechar"
        };
        supersonic.ui.dialog.alert("Recuperar Senha", options);
    }
    
}

function vaildaCpf(strCPF) { var Soma; var Resto; Soma = 0; if (strCPF == "00000000000") return false; for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i); Resto = (Soma * 10) % 11; if ((Resto == 10) || (Resto == 11)) Resto = 0; if (Resto != parseInt(strCPF.substring(9, 10)) ) return false; Soma = 0; for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i); Resto = (Soma * 10) % 11; if ((Resto == 10) || (Resto == 11)) Resto = 0; if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false; return true; }
