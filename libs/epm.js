//apiURL = 'http://127.0.0.1/C2API';
apiURL = 'http://192.168.2.143/TEST_C2API';
globalURL = 'http://127.0.0.1:8099/CDEAPI';
globalHref = 'http://127.0.0.1:8099/CDE3.0/'
//apiURL = 'http://192.168.2.143/C2API';
$(function () {
    $('.cde-header').scrollFix({distanceTop: parseInt(0)});
})
function get_url_param(name)
{
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
;(function($, doc){
    'use strict'
    $.fn.extend({
        'tmsDrag' : function(el){
            var me = this;
            var maskDiv = $('<div class="drag-mask" style="position:absolute; width:90%; height:100%; top:0; left:0; z-index:9999;"></div>');
            $(this).children(el).on('mousedown.tms', function(e){
                var mouseX  = e.pageX,
                    mouseY  = e.pageY,
                    offsetX = parseFloat($(me).css('left')),
                    offsetY = parseFloat($(me).css('top')),
                    x, y;
                $(me).append(maskDiv);

                $(doc).on('mousemove.tms', function(ev){
                    ev.preventDefault();
                    x = offsetX + ev.pageX - mouseX;
                    y = offsetY + ev.pageY - mouseY;
                    $(me).css({
                        left : x+'px',
                        top  : y+'px'
                    });
                });

                $(doc).on('mouseup.tms', function(ev){
                    $(doc).off('mousemove.tms mouseup.tms');
                    $(me).children('.drag-mask').remove();
                });
            });
        }
    });
})(jQuery, window.document);
function openModalWin(event, url, eArr, isParent) {
    parent.$("#parentSaveBtn").removeClass("hidden");
    var isParent = isParent ? isParent : 'N';
    if(isParent == 'Y'){
        var modalWin = parent.$('#modalWin');
        var iWin = parent.$("#iWin");
        var dragWin = parent.$('#dragWin');
        var ModalTitle = parent.$('#Modal_title');
    }else{
        var modalWin = $('#modalWin');
        var iWin = $("#iWin");
        var dragWin = $('#dragWin');
        var ModalTitle = $('#Modal_title');
    }
    dragWin.css({top:0, left:0});
    //var randomnumber=Math.floor(Math.random()*1000);
    window.modalWin = modalWin;
    iWin.attr("src", url);
    dragWin.tmsDrag('#dragCon');
    modalWin.modal({ show:true });
    if(event.title) ModalTitle.html(event.title);
    else ModalTitle.html(event.innerHTML);
    window.setInterval(function(){
        var iframe = document.getElementById('iWin');
        iframe.height = (iframe.contentWindow.document.body&&iframe.contentWindow.document.documentElement)? Math.min(iframe.contentWindow.document.body.scrollHeight,iframe.contentWindow.document.documentElement.scrollHeight):'400px';
    }, 200);
}
function callChildBtnSave(){
    iWin.window.btnSave();
    $('#modalWin').modal('hide');
}