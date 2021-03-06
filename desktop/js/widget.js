
/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */


 editor = null;

 $('.pluginContainer').packery();

 $("img.lazy").each(function () {
    var el = $(this);
    if (el.attr('data-original2') != undefined) {
        $("<img>", {
            src: el.attr('data-original'),
            error: function () {
                $("<img>", {
                    src: el.attr('data-original2'),
                    error: function () {
                        if (el.attr('data-original3') != undefined) {
                            $("<img>", {
                                src: el.attr('data-original3'),
                                error: function () {
                                    el.lazyload({
                                        event: "sporty"
                                    });
                                    el.trigger("sporty");
                                },
                                load: function () {
                                    el.attr("data-original", el.attr('data-original3'));
                                    el.lazyload({
                                        event: "sporty"
                                    });
                                    el.trigger("sporty");
                                }
                            });
                        } else {
                            el.lazyload({
                                event: "sporty"
                            });
                            el.trigger("sporty");
                        }
                    },
                    load: function () {
                        el.attr("data-original", el.attr('data-original2'));
                        el.lazyload({
                            event: "sporty"
                        });
                        el.trigger("sporty");
                    }
                });
},
load: function () {
    el.lazyload({
        event: "sporty"
    });
    el.trigger("sporty");
}
});
} else {
    el.lazyload({
        event: "sporty"
    });
    el.trigger("sporty");
}
});

$('#bt_displayWidgetList').on('click', function () {
    $('.widget').hide();
    $('.widgetListDisplay').show();
    $('.li_widget').removeClass('active');
});

$(".li_widget").on('click', function (event) {
    $('.widget').show();
    $('.widgetListDisplay').hide();
    $('.li_widget').removeClass('active');
    $(this).addClass('active');
    printWidget($(this).attr('data-path'));
    return false;
});

if (getUrlVars('saveSuccessFull') == 1) {
    $('#div_alert').showAlert({message: '{{Sauvegarde effectué avec succès}}', level: 'success'});
}

if (getUrlVars('removeSuccessFull') == 1) {
    $('#div_alert').showAlert({message: '{{Suppression effectué avec succès}}', level: 'success'});
}

jwerty.key('ctrl+s', function (e) {
    e.preventDefault();
    saveWidget();
});

$('.widgetAction[data-action=save]').on('click', function () {
    saveWidget();
});

$('.widgetAction[data-action=remove]').on('click', function () {
    bootbox.confirm('{{Etes-vous sûr de vouloir supprimer le widget}} <span style="font-weight: bold ;">' + $('.widgetAttr[data-l1key=name]').value() + '</span> ?', function (result) {
        if (result) {
            removeWidget($('.widgetAttr[data-l1key=path]').value());
        }
    });
});

$('.widgetAction[data-action=copy]').on('click', function () {
    bootbox.prompt("{{Nom la copie du widget ?}}", function (result) {
        if (result) {
            copyWidget($('.widgetAttr[data-l1key=path]').value(),result);
        }
    });
});

$('.widgetAction[data-action=add]').on('click', function () {
    $.hideAlert();
    bootbox.prompt("Nom du widget ?", function (result) {
        if (result !== null) {
            addWidget(result);
        }
    });
});

$('#bt_shareOnMarket').on('click', function () {
    $('#md_modal').dialog({title: "Partager sur le market"});
    $('#md_modal').load('index.php?v=d&modal=market.send&type=widget&logicalId=' + encodeURI($('.widgetAttr[data-l1key=logicalId]').value()) + '&name=' + encodeURI($('.widgetAttr[data-l1key=logicalId]').value())).dialog('open');
});

$('#bt_applyWidget').on('click', function () {
    $('#md_modal').dialog({title: "Appliquer widget"});
    $('#md_modal').load('index.php?v=d&plugin=widget&modal=widget.apply&path=' + encodeURI($('.widgetAttr[data-l1key=path]').value())).dialog('open');
});

$('#bt_manageFiles').on('click', function () {
    $('#md_modal').dialog({title: "Gérer les dépendances"});
    $('#md_modal').load('index.php?v=d&plugin=widget&modal=widget.3rdparty&path=' + encodeURI($('.widgetAttr[data-l1key=path]').value())).dialog('open');
});

$('#bt_getFromMarket').on('click', function () {
    $('#md_modal').dialog({title: "Partager sur le market"});
    $('#md_modal').load('index.php?v=d&modal=market.list&type=widget').dialog('open');
});

if (getUrlVars('id') != '') {
    if ($('#ul_widget .li_widget[data-path="' + getUrlVars('id') + '"]').length != 0) {
        $('#ul_widget .li_widget[data-path="' + getUrlVars('id') + '"]').click();
    }
}
$('.widgetDisplayCard').on('click', function () {
    $('#ul_widget .li_widget[data-path="' + $(this).attr('data-path') + '"]').click();
});


$('body').delegate('.widgetAttr', 'change', function () {
    modifyWithoutSave = true;
});

$('#bt_insertIcon').on('click', function () {
    chooseIcon(function (_icon) {
        editor.replaceSelection(_icon);
    });
});

function printWidget(_path) {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/widget/core/ajax/widget.ajax.php", // url du fichier php
        data: {
            action: "get",
            path: _path
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
        $('.widget').setValues(data.result, '.widgetAttr');

        if (editor == null) {
            if (isset(data.result.content)) {
                $('#ta_script').val(data.result.content);
            }
            setTimeout(function () {
                editor = CodeMirror.fromTextArea(document.getElementById("ta_widgetContent"), {
                    lineNumbers: true,
                    mode: "text/html",
                    matchBrackets: true,
                    viewportMargin: Infinity
                });
            }, 1);
        } else {
            if (isset(data.result.content)) {
                editor.setValue(data.result.content);
            }
        }
        initTooltips();
        $('#div_widgetResult').empty();
        $('#div_widgetResult').append('<iframe src="index.php?v=d&plugin=widget&modal=widget.result&path=' + data.result.path + '" frameBorder="0" height="200"></iframe>');
        modifyWithoutSave = false;
    }
});
}

function saveWidget() {
    $.hideAlert();
    var widget = $('.widget').getValues('.widgetAttr');
    widget = widget[0];
    if (editor != null) {
        widget.content = editor.getValue();
    }
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/widget/core/ajax/widget.ajax.php", // url du fichier php
        data: {
            action: "save",
            widget: json_encode(widget),
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
        var vars = getUrlVars();
        var url = 'index.php?';
        for (var i in vars) {
            if (i != 'id' && i != 'saveSuccessFull' && i != 'removeSuccessFull' && i != undefined) {
                url += i + '=' + vars[i].replace('#', '') + '&';
            }
        }
        url += 'id=' + data.result.path + '&saveSuccessFull=1';
        modifyWithoutSave = false;
        window.location.href = url;
    }
});
}


function addWidget(_name) {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/widget/core/ajax/widget.ajax.php", // url du fichier php
        data: {
            action: "add",
            name: _name,
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
        var vars = getUrlVars();
        var url = 'index.php?';
        for (var i in vars) {
            if (i != 'id' && i != 'saveSuccessFull' && i != 'removeSuccessFull') {
                url += i + '=' + vars[i].replace('#', '') + '&';
            }
        }
        url += 'id=' + data.result.path + '&saveSuccessFull=1';
        window.location.href = url;
    }
});
}

function removeWidget(_path) {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/widget/core/ajax/widget.ajax.php", // url du fichier php
        data: {
            action: "remove",
            path: _path,
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
        var vars = getUrlVars();
        var url = 'index.php?';
        for (var i in vars) {
            if (i != 'id' && i != 'removeSuccessFull' && i != 'saveSuccessFull') {
                url += i + '=' + vars[i].replace('#', '') + '&';
            }
        }
        url += 'removeSuccessFull=1';
        modifyWithoutSave = false;
        window.location.href = url;
    }
});
}

function copyWidget(_path,_name) {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/widget/core/ajax/widget.ajax.php", // url du fichier php
        data: {
            action: "copy",
            path: _path,
            name: _name,
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
        var vars = getUrlVars();
        var url = 'index.php?';
        for (var i in vars) {
            if (i != 'id' && i != 'saveSuccessFull' && i != 'removeSuccessFull') {
                url += i + '=' + vars[i].replace('#', '') + '&';
            }
        }
        url += 'id=' + data.result.path + '&saveSuccessFull=1';
        window.location.href = url;
    }
});
}