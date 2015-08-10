/*
 Esse é um software privado, copiar parte ou todo o conteúdo é totalmente proibido. 
 Caso você tenha acesso a esse conteúdo, deve excluir imediatamente.
 
     Author     : Rodrigo Celebrone
     Created at : 04/03/2015, 19:17
     Updated at : 14/05/2015, 19:50
 */

(function () {
    "use strict";

    document.addEventListener('deviceready', function () {

        //executa quando a aplicação é pausada
        document.addEventListener('pause', function () {

        }.bind(this), false);

        //executa logo depois que a aplicação volta a executar
        document.addEventListener('resume', function () {

        }.bind(this), false);

        document.getElementById('page-criar-local-imagem-fotografar').onclick = function () {
            navigator.camera.getPicture(
                function (data) {
                    document.getElementById('page-criar-local-imagem-canvas').src = 'data:image/jpeg;base64,' + data;
                    document.getElementById('page-criar-local-imagem-base64').value = data;
                },
                function (msg) {
                    console.log(msg);
                },
                { quality: 50, destinationType: Camera.DestinationType.DATA_URL, targetWidth: 256, targetHeight: 256, correctOrientation: true }
            );
        }

        document.getElementById('page-criar-local-imagem-biblioteca').onclick = function () {
            navigator.camera.getPicture(
                function (data) {
                    document.getElementById('page-criar-local-imagem-canvas').src = 'data:image/jpeg;base64,' + data;
                    document.getElementById('page-criar-local-imagem-base64').value = data;
                },
                function (msg) {
                    console.log(msg);
                },
                { sourceType: Camera.PictureSourceType.PHOTOLIBRARY, quality: 50, destinationType: Camera.DestinationType.DATA_URL, targetWidth: 256, targetHeight: 256, correctOrientation: true }
            );
        }

        var dateTimeControl = function (me, title) {
            try{
                clearInterval(window.timer10segundos);
            } catch (e) {
                console.log(e);
            }

            try{
                datePicker.show({
                    date: new Date(), mode: 'date', windowTitle: title
                }, function (pdate) {
                    datePicker.show({
                        date: pdate, mode: 'time'
                    }, function (pdatetime) {
                        var dt = new Date(pdate.getFullYear(), pdate.getMonth(), pdate.getDate(), pdatetime.getHours(), pdatetime.getMinutes());
                        me.setAttribute('data-datetime', dt.toJSON());
                        me.textContent = (dt.getDate().toString().length == 1 ? '0' : '') + dt.getDate() + '/' +
                            (((dt.getMonth() + 1).toString().length == 1 ? '0' : '') + (dt.getMonth() + 1)) + '/' +
                            (dt.getFullYear().toString().length == 1 ? '0' : '') + dt.getFullYear() + ' ' +
                            (dt.getHours().toString().length == 1 ? '0' : '') + dt.getHours() + ':' +
                            (dt.getMinutes().toString().length == 1 ? '0' : '') + dt.getMinutes();
                    });
                });
            } catch(e) {
                return false;
            }
        }

        document.getElementById('page-local-agendar-de').onclick = function () {
            dateTimeControl(document.getElementById('page-local-agendar-de'), 'Definir data de:');
        }

        document.getElementById('page-local-agendar-ate').onclick = function () {
            dateTimeControl(document.getElementById('page-local-agendar-ate'), 'Definir data até:');
        }

        if (AdMob) AdMob.createBanner({
            adId: 'ca-app-pub-9278274121196072/6119658024',
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            autoShow: true
        });

    }.bind(this), false);



    //jquery mobile
    $(document).on('mobileinit', function () {

        //default config
        $.mobile.phonegapNavigationEnabled = true;
        $.mobile.defaultPageTransition = 'none';
        $.mobile.defaultDialogTransition = 'none';
        $.mobile.changePage.defaults.transition = 'none';
        $.mobile.buttonMarkup.hoverDelay = true;

        //variaveis globais
        var page = {
            login: { id: '#page-home', title: 'Acesso' },
            listaLocais: { id: '#page-lista-local', title: 'Meus locais' },
            criarLocal: { id: '#page-criar-local', title: 'Criar local' },
            local: { id: '#page-local', title: 'Status do local' },
            convidar: { id: '#page-convidar', title: 'Convidar usuário' }
        },
        storage = { email: 'emaildata', senha: 'senhadata', nome: 'nomedata', id: 'iddata', local: 'localid' },
        api = {
            url: 'http://temgente.rcelebrone.com/', //...temgente. aponta para /temgente no dominio rcelebrone.com (configuração no projeto rcelebrone dessa solution)
            token: '_9fu8du9s3mjbnj34j2b4x45rs0ds9xidk7l88k_',
            error: 'Não foi recuperar os dados, verifique sua conexão com a internet.',
            retornos: {
                falso: 'falso',
                verdadeiro: 'verdadeiro',
                ocupado_agendavel: 'ocupado_agendavel',
                livre_agendavel: 'livre_agendavel',
                ocupado_simples: 'ocupado_simples',
                livre_simples: 'livre_simples'
            }
        };

        //*********************************************************//
        //                     [page.login.id]
        //*********************************************************//
        $(page.login.id).page({
            create: function () {
                var id = page.login.id;
                var fields = {
                    email: $(id + ' input#page-home-email'),
                    senha: $(id + ' input#page-home-senha'),
                    mensagem: $(id + ' h4#page-home-mensagem'),
                    nome: $(id + ' input#page-home-nome'),
                    cadastrar: $(id + ' input#page-home-cadastrar'),
                    enviar: $(id + ' button#page-home-enviar')
                };

                //seta o titulo da pagina
                $(id + ' h1').text(page.login.title);

                //faz o switch entre o form de cadastro e o de login
                fields.cadastrar.off('click');
                fields.cadastrar.on('click', function () {
                    if (this.checked) {
                        fields.nome.parent().removeClass('hide');
                        fields.enviar.text('Cadastrar');
                    }
                    else {
                        fields.nome.parent().addClass('hide');
                        fields.enviar.text('Logar');
                    }
                });

                //click no botão enviar
                fields.enviar.off('click');
                fields.enviar.on('click', function (e) {
                    localStorage.setItem(storage.nome, fields.nome.val());
                    localStorage.setItem(storage.email, fields.email.val());
                    localStorage.setItem(storage.senha, fields.senha.val());

                    loader(true);

                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/' + (fields.cadastrar.prop('checked') ? 'CriarUsuario' : 'Autenticar'),
                        accept: 'application/json',
                        data: {
                            Nome: localStorage.getItem(storage.nome),
                            Email: localStorage.getItem(storage.email),
                            Senha: localStorage.getItem(storage.senha),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            if (data.Retorno == api.retornos.verdadeiro) {
                                localStorage.setItem(storage.id, data.Id);
                                $.mobile.navigate(page.listaLocais.id);
                            }
                            fields.mensagem.text(data.Mensagem);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //executa sempre que abrirmos essa pagina
                $(id).on('pageshow', function (e, ui) {
                    //verifica se existe o nome no localStorage
                    if (localStorage.getItem(storage.nome) !== '')
                        fields.nome.val(localStorage.getItem(storage.nome));

                    //verifica se existe o email no localStorage
                    if (localStorage.getItem(storage.email) !== '')
                        fields.email.val(localStorage.getItem(storage.email));

                    //verifica se existe a senha no localStorage
                    if (localStorage.getItem(storage.senha) !== '')
                        fields.senha.val(localStorage.getItem(storage.senha));

                    //caso o email e a senha já estejam no form, clicar no enviar
                    if (fields.email.val() !== '' && fields.senha.val() !== '')
                        fields.enviar.click();
                });

                //executa sempre que fecharmos essa paginas
                $(id).on('pagehide', function (e, ui) {

                });
            }
        });


        //*********************************************************//
        //                   [page.listaLocais.id]
        //*********************************************************//
        $(page.listaLocais.id).page({
            create: function () {
                var id = page.listaLocais.id;
                var fields = {
                    mensagem: $(id + ' h4#page-lista-local-mensagem')
                };

                //seta o titulo da pagina
                $(id + ' h1').text(page.listaLocais.title);

                //executa sempre que abrirmos essa pagina
                $(id).on('pageshow', function (e, ui) {
                    //efeito de load
                    loader(true);

                    var loadlist = function () {

                        //pega o recipiente da lista
                        var ul = $(id + ' ul');

                        //limpa o recipiente 
                        ul.empty();

                        //carrega os locais do usuario com os dados da api
                        $.ajax({
                            type: 'GET',
                            url: api.url + 'api/ListaLocais',
                            accept: 'application/json',
                            data: {
                                IdUsuario: localStorage.getItem(storage.id),
                                'X-TemGente-Mobile-App-Request': api.token
                            },
                            success: function (data) {
                                if (data.Retorno == api.retornos.verdadeiro) {
                                    var items = data.Lista;
                                    if (items !== null) {
                                        for (var x = 0; x < items.length; x++) {
                                            ul.append($(document.createElement('li'))
                                                    .append($(document.createElement('a')).attr({ 'data-id': items[x].Id })
                                                            .click(function (ev) {
                                                                ev.preventDefault();
                                                                localStorage.setItem(storage.local, $(this).data('id'));
                                                                $.mobile.navigate(page.local.id);
                                                            }).append($(document.createElement('img')).attr({ src: 'data:image/*;base64,' + items[x].Imagem, width: 80, height: 80 })).append(items[x].Nome))
                                                    );
                                        }

                                        // verifico se precisa atualizar ou criar o listview pela primeira vez 
                                        if (!ul.hasClass('ui-listview'))
                                            ul.listview();
                                        else
                                            ul.listview('refresh');

                                        ul.children('li').children('a').addClass('ui-icon-location').removeClass('ui-icon-carat-r');
                                    }
                                }
                                fields.mensagem.text(data.Mensagem);
                            },
                            error: function (msg) {
                                fields.mensagem.text(msg.statusText + '. ' + api.error);
                            },
                            complete: function () {
                                loader(false);
                            }
                        });
                    };

                    //executa
                    loadlist();

                    //reload na lista para manter atualizada (caso alguem tenha te convidado pra um local)
                    window.timer180segundos = setInterval(function () {
                        loadlist();
                    }, 180000);

                });

                //executa sempre que fecharmos essa paginas
                $(id).on('pagehide', function (e, ui) {
                    clearInterval(window.timer180segundos);
                });
            }
        });

        //*********************************************************//
        //                   [page.criarLocal.id]
        //*********************************************************//
        $(page.criarLocal.id).page({
            create: function () {
                var id = page.criarLocal.id;
                var fields = {
                    nome: $(id + ' input#page-criar-local-nome'),
                    mensagem: $(id + ' h4#page-criar-local-mensagem'),
                    camera: $(id + ' button#page-criar-local-imagem-fotografar'),
                    arquivos: $(id + ' button#page-criar-local-imagem-biblioteca'),
                    agendavel: $(id + ' select#page-criar-local-agendavel'),
                    base64: $(id + ' input#page-criar-local-imagem-base64'),
                    canvas: $(id + ' img#page-criar-local-imagem-canvas'),
                    enviar: $(id + ' button#page-criar-local-cadastrar')
                };

                //seta o titulo da pagina
                $(id + ' h1').text(page.criarLocal.title);

                //click no botão enviar
                fields.enviar.off('click');
                fields.enviar.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/CriarLocal',
                        accept: 'application/json',
                        data: {
                            Nome: fields.nome.val(),
                            Imagem: fields.base64.val(),
                            Agendavel: fields.agendavel.val(),
                            IdUsuario: localStorage.getItem(storage.id),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            fields.mensagem.text(data.Mensagem);
                            if (data.Retorno == api.retornos.verdadeiro) {
                                $.mobile.navigate(page.listaLocais.id);
                            }
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //executa sempre que abrirmos essa pagina
                $(id).on('pageshow', function (e, ui) {
                    //seta o titulo da pagina (qnd volta da camera)
                    $(id + ' h1').text(page.criarLocal.title);
                    //reseta img e canvas 
                    fields.canvas.prop('src', '');
                    fields.base64.val('');
                });

                //executa sempre que fecharmos essa paginas
                $(id).on('pagehide', function (e, ui) {
                    fields.nome.val('');
                    fields.mensagem.text('');
                });
            }
        });

        //*********************************************************//
        //                     [page.local.id]
        //*********************************************************//
        $(page.local.id).page({
            create: function () {
                var id = page.local.id;
                var fields = {
                    situacao: $(id + ' div#page-local-situacao'),
                    mensagem: $(id + ' h4#page-local-mensagem'),
                    ocupar: $(id + ' button#page-local-ocupar'),
                    de: $(id + ' button#page-local-agendar-de'),
                    ate: $(id + ' button#page-local-agendar-ate'),
                    reservar: $(id + ' button#page-local-agendar'),
                    remover: $(id + ' a#page-local-agendamentos-remover'),
                    desocupar: $(id + ' button#page-local-desocupar'),
                    sair: $(id + ' a#page-local-sair')
                };

                //seta o titulo da pagina
                $(id + ' h1').text(page.local.title);

                //click no botão ocupar
                fields.ocupar.off('click');
                fields.ocupar.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/OcuparLocal',
                        accept: 'application/json',
                        data: {
                            Id: localStorage.getItem(storage.local),
                            IdUsuarioOcupar: localStorage.getItem(storage.id),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            if (data.Retorno == api.retornos.verdadeiro) {
                                fields.situacao.addClass('ocupado').removeClass('livre');
                                fields.ocupar.removeClass('show').addClass('hide');
                                fields.desocupar.removeClass('hide').addClass('show');
                            }
                            fields.mensagem.text(data.Mensagem);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //click no botão desocupar
                fields.desocupar.off('click');
                fields.desocupar.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/DesocuparLocal',
                        accept: 'application/json',
                        data: {
                            Id: localStorage.getItem(storage.local),
                            IdUsuario: localStorage.getItem(storage.id),
                            IdUsuarioDesocupar: localStorage.getItem(storage.id),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            if (data.Retorno == api.retornos.verdadeiro) {
                                fields.situacao.addClass('livre').removeClass('ocupado');
                                fields.ocupar.removeClass('hide').addClass('show');
                                fields.desocupar.removeClass('show').addClass('hide');
                            }
                            fields.mensagem.text(data.Mensagem);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //click no botão sair (para remover o local da lista)
                fields.sair.off('click');
                fields.sair.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/SairDoLocal',
                        accept: 'application/json',
                        data: {
                            IdLocal: localStorage.getItem(storage.local),
                            IdUsuario: localStorage.getItem(storage.id),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            if (data.Retorno == api.retornos.verdadeiro) {
                                $.mobile.navigate(page.listaLocais.id);
                            }
                            fields.mensagem.text(data.Mensagem);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //click no botão reservar
                fields.reservar.off('click');
                fields.reservar.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/OcuparLocal',
                        accept: 'application/json',
                        data: {
                            Id: localStorage.getItem(storage.local),
                            IdUsuarioOcupar: localStorage.getItem(storage.id),
                            dataDe: fields.de.attr('data-datetime'),
                            dataAte: fields.ate.attr('data-datetime'),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            fields.mensagem.html(data.Mensagem.replace(/;/g,'<br />'));
                            //cria um reload com delay de 10 segundos
                            window.setTimeout(function () {
                                $(id).pageshow();
                            }, 10000);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            fields.de.data('datetime', '');
                            fields.ate.data('datetime', '');
                            fields.de.text(fields.de.data('text'));
                            fields.ate.text(fields.ate.data('text'));
                            loader(false);
                        }
                    });
                });

                //click no botão remover
                fields.remover.off('click');
                fields.remover.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/RemoverAgendamentos',
                        accept: 'application/json',
                        data: {
                            IdUsuario: localStorage.getItem(storage.id),
                            IdLocal: localStorage.getItem(storage.local),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            fields.mensagem.text(data.Mensagem);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //executa sempre que abrirmos essa pagina
                $(id).on('pageshow', function (e, ui) {

                    //efeito de loader
                    loader(true);

                    var loadstatus = function () {
                        //carrega os locais do usuario com os dados da api
                        $.ajax({
                            type: 'GET',
                            url: api.url + 'api/VerificaSeLocalEstaOcupado',
                            accept: 'application/json',
                            data: {
                                IdLocal: localStorage.getItem(storage.local),
                                'X-TemGente-Mobile-App-Request': api.token
                            },
                            success: function (data) {
                                if (data.Mensagem.search('>') > 0) {
                                    fields.mensagem.html(data.Mensagem);

                                    //transforma o html em listview
                                    fields.mensagem.children('ul').listview();

                                    //clica nos periodos e mostra o nome de quem agendou
                                    $('li[data-nome]').addClass('ui-icon-eye ui-btn-icon-right ui-alt-icon').on('click', function () {
                                        navigator.notification.alert($(this).data('nome'),null,"Agendado por:","ok")
                                    });

                                } else
                                    fields.mensagem.html(data.Mensagem);

                                if (data.Retorno == api.retornos.ocupado_agendavel) {
                                    fields.situacao.removeClass('livre').addClass('ocupado metade');
                                    //agendavel
                                    fields.de.removeClass('hide').addClass('show');
                                    fields.ate.removeClass('hide').addClass('show');
                                    fields.reservar.removeClass('hide').addClass('show');
                                    fields.remover.removeClass('hide').addClass('show');
                                    //simples
                                    fields.ocupar.removeClass('show').addClass('hide');
                                    fields.desocupar.removeClass('show').addClass('hide');
                                }
                                else if (data.Retorno == api.retornos.livre_agendavel) {
                                    fields.situacao.removeClass('ocupado').addClass('livre metade');
                                    //agendavel
                                    fields.de.removeClass('hide').addClass('show');
                                    fields.ate.removeClass('hide').addClass('show');
                                    fields.reservar.removeClass('hide').addClass('show');
                                    fields.remover.removeClass('hide').addClass('show');
                                    //simples
                                    fields.ocupar.removeClass('show').addClass('hide');
                                    fields.desocupar.removeClass('show').addClass('hide');
                                }
                                else if (data.Retorno == api.retornos.ocupado_simples) {
                                    fields.situacao.removeClass('livre metade').addClass('ocupado');
                                    //agendavel
                                    fields.de.removeClass('show').addClass('hide');
                                    fields.ate.removeClass('show').addClass('hide');
                                    fields.reservar.removeClass('show').addClass('hide');
                                    fields.remover.removeClass('show').addClass('hide');
                                    //simples
                                    fields.ocupar.removeClass('show').addClass('hide');
                                    fields.desocupar.removeClass('hide').addClass('show');
                                }
                                else if (data.Retorno == api.retornos.livre_simples) {
                                    fields.situacao.removeClass('ocupado metade').addClass('livre');
                                    //agendavel
                                    fields.de.removeClass('show').addClass('hide');
                                    fields.ate.removeClass('show').addClass('hide');
                                    fields.reservar.removeClass('show').addClass('hide');
                                    fields.remover.removeClass('show').addClass('hide');
                                    //simples
                                    fields.ocupar.removeClass('hide').addClass('show');
                                    fields.desocupar.removeClass('show').addClass('hide');
                                }
                            },
                            error: function (msg) {
                                fields.mensagem.text(msg.statusText + '. ' + api.error);
                            },
                            complete: function () {
                                loader(false);
                            }
                        });
                    };

                    //executa
                    loadstatus();

                    //cria um reload com delay de 10 segundos
                    window.timer10segundos = setInterval(function () {
                        loadstatus();
                    }, 10000);

                });

                //executa sempre que fecharmos essa paginas
                $(id).on('pagehide', function (e, ui) {
                    clearInterval(window.timer10segundos);
                    fields.de.data('datetime', '');
                    fields.ate.data('datetime', '');
                    fields.de.text(fields.de.data('text'));
                    fields.ate.text(fields.ate.data('text'));
                });
            }
        });

        //*********************************************************//
        //                     [page.convidar.id]
        //*********************************************************//
        $(page.convidar.id).page({
            create: function () {
                var id = page.convidar.id;
                var fields = {
                    email: $(id + ' input#page-convidar-email'),
                    mensagem: $(id + ' h4#page-convidar-mensagem'),
                    adicionar: $(id + ' button#page-convidar-adicionar')
                };

                //seta o titulo da pagina
                $(id + ' h1').text(page.convidar.title);

                //click no botão adicionar
                fields.adicionar.off('click');
                fields.adicionar.on('click', function (e) {
                    loader(true);
                    $.ajax({
                        type: 'POST',
                        url: api.url + 'api/AdicionarNoLocal',
                        accept: 'application/json',
                        data: {
                            IdLocal: localStorage.getItem(storage.local),
                            EmailUsuario: fields.email.val(),
                            'X-TemGente-Mobile-App-Request': api.token
                        },
                        success: function (data) {
                            fields.mensagem.text(data.Mensagem);
                        },
                        error: function (msg) {
                            fields.mensagem.text(msg.statusText + '. ' + api.error);
                        },
                        complete: function () {
                            loader(false);
                        }
                    });
                });

                //executa sempre que abrirmos essa pagina
                $(id).on('pageshow', function (e, ui) {

                });

                //executa sempre que fecharmos essa paginas
                $(id).on('pagehide', function (e, ui) {

                });
            }
        });

        var loader = function (show) {
            if (show) {
                $.mobile.activePage.children('div[role="main"]').addClass('invisible');
                $.mobile.loading('show');
            } else {
                $.mobile.activePage.children('div[role="main"]').removeClass('invisible');
                $.mobile.loading('hide');
            }
        };

    });

})();
