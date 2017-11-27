apiURL = "http://127.0.0.1/CAPI";
// apiURL = 'http://192.168.2.143/TEST_C2API';
// apiURL = 'http://192.168.2.143:8033/CAPI';

$.fn.removeColClass = function() {
  for (var i = 0; i <= 24; i++) {
    $(this).removeClass("col-xs-" + i);
    $(this).removeClass("col-sm-" + i);
    $(this).removeClass("col-md-" + i);
    $(this).removeClass("col-lg-" + i);
  }
};

$.fn.removeOffsetClass = function() {
  for (var i = 0; i <= 24; i++) {
    for (var i = 0; i <= 24; i++) {
      $(this).removeClass("col-xs-offset-" + i);
      $(this).removeClass("col-sm-offset-" + i);
      $(this).removeClass("col-md-offset-" + i);
      $(this).removeClass("col-lg-offset-" + i);
    }
  }
};

Array.prototype.removeByValue = function(val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) {
      this.splice(i, 1);
      break;
    }
  }
};

function elementChange(event) {
  var intpuDIV = $(event).parents(".c-input:first");
  var showArrayStr = intpuDIV.attr("data-show-array");
  var showArray = eval(showArrayStr);
  if (showArrayStr && showArray.length > 0) {
    directFormShow(event, showArrayStr);
  }

  var formulaArrayStr = intpuDIV.attr("data-formula-array");
  var formulaArray = eval(formulaArrayStr);
  if (formulaArrayStr && formulaArray.length > 0) {
    formulaShow(formulaArray);
  }

  var timer = $(event).attr("data-timer");
  if (timer && timer == "Y") {
    setParentTimestamp(event);
  }
}

function formulaShow(formulaArray) {
  var showArr = [];
  var hideArr = [];
  for (var i = 0; i < formulaArray.length; i++) {
    var fid = formulaArray[i][0];
    var cmp = formulaArray[i][1];
    var toValue = formulaArray[i][2];
    var toGridID = formulaArray[i][3];
    console.log(fid);
    $.post(
      apiURL + "/FormulaSvr/model",
      { id: fid },
      function(res) {
        if (res.code == 0) {
          var rs = doFormula(res.data);
          var findPos =
            (cmp == "=" && rs == toValue) ||
            (cmp == ">" && rs > toValue) ||
            (cmp == "<" && rs < toValue);
          if (findPos) showArr.push(toGridID);
          else hideArr.push(toGridID);
          privateShowFormulaResult(showArr, hideArr, formulaArray.length);
        }
      },
      "json"
    );
  }
}

function privateShowFormulaResult(showArr, hideArr, len) {
  if (showArr.length + hideArr.length == len) {
    var newHideArr = [];
    for (var i = 0; i < hideArr.length; i++) {
      if ($.inArray(hideArr[i], showArr) > -1) continue;
      newHideArr.push(hideArr[i]);
    }
  }
  hideArr = newHideArr;
  for (var i = 0; i < showArr.length; i++) {
    var tempGridID = showArr[i];
    var tempGrid = $("#" + tempGridID);
    //var tableRow = $(event).parents('.table-row:first');
    //if(tableRow.length > 0)
    //{
    //    tempGrid = tableRow.find('#'+tempGridID);
    //}
    if (tempGrid.attr("data-hide")) {
      tempGrid.show();
    }
    tempGrid.find(".c-element").removeAttr("disabled");
    tempGrid
      .find("[data-hide='2']")
      .find(".c-element")
      .attr("disabled", "disabled");
  }
  for (var i = 0; i < hideArr.length; i++) {
    var tempGridID = hideArr[i];
    var tempGrid = $("#" + tempGridID);
    //var tableRow = $(event).parents('.table-row:first');
    //if(tableRow.length > 0)
    //{
    //    tempGrid = tableRow.find('#'+tempGridID);
    //}
    if (tempGrid.attr("data-hide")) {
      tempGrid.hide();
    }
    tempGrid.find(".c-element").attr("disabled", "disabled");
  }
}

function directGlobalHide(gridID) {
  var tempGrid = $("#" + gridID);
  var globalStr = tempGrid.attr("data-global-array");
  if (globalStr == undefined) return false;
  var globalArr = eval(globalStr);
  for (var i = 0; i < globalArr.length; i++) {
    var elementID = globalArr[i][0];
    var valueID = globalArr[i][1];
    //$.post(apiURL+'/GlobalSvr/fetch', {elementID: elementID}, function (res)
    //{
    //    if (res.code == 0)
    //    {
    //        var fromValue = res.data;
    //        if(fromValue == valueID)
    //        {
    //            //这里的控制关系待检验
    //            $('#'+gridID).show();
    //        }
    //    }
    //}, 'json').error(function(res){console.log(res.responseText)});
    var fromValue = typeof GetElemVal == "function" ? GetElemVal(elementID) : 0;
    if (fromValue == valueID) {
      $("#" + gridID).show();
    }
  }
}

//多:多:多 = 多个输入值: 多个比较值: 多个控件
function directFormShow(event, showArrayStr) {
  //选中的值
  var masterValues = [];
  var tempName = $(event).attr("name");
  //兼容radio/checkbox/select
  $("[name='" + tempName + "']").each(function(index, row) {
    if ($(row).is(":checked") || $(row).is("select")) {
      masterValues.push($(row).val());
    }
  });

  //循环处理多个被控制的Slave控件
  var showArr = [];
  var hideArr = [];
  var dataShowArray = eval(showArrayStr);
  for (var i = 0; i < dataShowArray.length; i++) {
    var masterValue = dataShowArray[i][0];
    var slaveGID = dataShowArray[i][1];
    var findPos = $.inArray(masterValue, masterValues);
    if (findPos > -1 && $.inArray(slaveGID, showArr) == -1) {
      showArr.push(slaveGID);
      hideArr.removeByValue(slaveGID);
    } else if (
      findPos == -1 &&
      $.inArray(slaveGID, hideArr) == -1 &&
      $.inArray(slaveGID, showArr) == -1
    ) {
      hideArr.push(slaveGID);
    }
  }

  for (var i = 0; i < showArr.length; i++) {
    var tempGridID = showArr[i];
    var tempGrid = $("#" + tempGridID);
    //var tableRow = $(event).parents('.table-row:first');
    //TODO 干什么用的？
    //if(tableRow.length > 0)
    //{
    //    tempGrid = tableRow.find('#'+tempGridID);
    //}
    if (tempGrid.attr("data-hide")) {
      tempGrid.show();
    }
    tempGrid.find(".c-element").removeAttr("disabled");
    tempGrid
      .find("[data-hide='2']")
      .find(".c-element")
      .attr("disabled", "disabled");
  }
  for (var i = 0; i < hideArr.length; i++) {
    var tempGridID = hideArr[i];
    var tempGrid = $("#" + tempGridID);
    //var tableRow = $(event).parents('.table-row:first');
    //if(tableRow.length > 0)
    //{
    //    tempGrid = tableRow.find('#'+tempGridID);
    //}
    if (tempGrid.attr("data-hide")) {
      tempGrid.hide();
    }
    tempGrid.find(".c-element").attr("disabled", "disabled");
    // if(tempGrid.find(".c-element").attr("data-checked") || tempGrid.find(".c-element").attr("data-checked") == false){
    //     tempGrid.find(".c-element").attr("data-checked", false);
    // }
    // tempGrid.find(".c-element").attr("checked", false);
  }
}

function zy_ArrayinArray(inValues, valuesArray) {
  for (var j = 0; j < inValues.length; j++) {
    var inValue = inValues[j];
    for (var i = 0; i < valuesArray.length; i++) {
      if (inValue == valuesArray[i]) return true;
    }
  }
  return false;
}

function zq_bindFormula(event, data) {
  var res = doFormula(data);
  if (res || res == 0) {
    $(event).val(res);
  }
}

function doFormula(data, isText) {
  var isText = isText ? isText : "N";
  var res = eval(data);
  var exp = res.EXP;
  var exp_var = "";
  var formula = res.SYMBOLS;
  for (var i = 0; i < formula.length; i++) {
    var row = formula[i];
    var v = row.value;
    var elementName = row.eid;
    if (elementName == undefined || elementName == "") {
      toastr.warning("公式中的变量" + row.name + "没有指定数据元");
    } else if (isText == "Y") {
      v = row.value;
    } else {
      var elements = $("[name='" + elementName + "']");
      if (elements.length > 0) {
        if (elements.is("select")) {
          var tempOption = elements.find("option:selected");
          if (!(tempOption.length == 0 || tempOption.val() == "")) {
            v = tempOption.attr("data-cvalue");
          }
        } else if (elements.is(":checkbox") || elements.is(":radio")) {
          var checkedE = $("input[name='" + elementName + "']:checked");
          if (checkedE.length > 0) {
            v = checkedE.attr("data-cvalue"); //如果是checkbox取第一个选中的
          }
        } else {
          v = elements.val();
          if (v == "" && row.value != "") {
            v = row.value;
          }
        }
      } else {
        //这里就这样就可以了，传奇那写好API直接改下url就可以了
        //$.ajax(
        //{
        //    url: apiURL+"/GlobalSvr/fetch",
        //    dataType: 'json',
        //    async: false,
        //    type: "post",
        //    data: { id: zq_get_url_param("id"), elementID: elementName },
        //    success: function (res)
        //    {
        //        if (res.code == 0)
        //        {
        //            v = res.data;
        //        }
        //    }
        //});
        v = GetElemVal(elementName);
      }
    }
    if (isNaN(v)) {
      exp_var += row.name + '="' + v + '";';
    } else {
      exp_var += row.name + "=" + v + ";";
    }
  }
  console.log(exp_var);
  console.log(exp);
  var rs = eval(exp_var + exp);
  return rs;
}

//-3:多个随意格 -1:一个随意格 0:无 1:一个内层空格 2:一个内层非选项元格 3:radio/check/select 4:radio/check 5:多格但必须跨格元
function isGridEditable(eArr, isParent) {
  var isParent = isParent ? isParent : "N";
  if (isParent == "Y") {
    var tempGrids = parent.getGrids();
  } else {
    var tempGrids = getGrids();
  }

  var gridCounter = tempGrids.length;
  var tempElements = tempGrids.find(".c-element");
  if ($.inArray(11, eArr) > -1) {
    if (gridCounter == 0) {
      parent.toastr.warning("至少选择【一个】网格！");
      return false;
    }
  }
  if ($.inArray(12, eArr) > -1) {
    if (gridCounter == 1) {
    } else {
      parent.toastr.warning("只能编辑【一个】网格！");
      return false;
    }
  }
  if ($.inArray(13, eArr) > -1) {
    if (tempGrids.find(".c-grid").length > 0) {
      toastr.warning("只能编辑最【内层】格！");
      return false;
    }
  }
  if ($.inArray(14, eArr) > -1) {
    if ($.trim(tempGrids.find(".c-content:first").html()) != "") {
      parent.toastr.warning("只能编辑【空】格！");
      return false;
    }
  }
  if ($.inArray(21, eArr) > -1) {
    if (tempElements.length > 0) {
      toastr.warning("只能编辑【无数据元】格！");
      return false;
    }
  }
  if ($.inArray(22, eArr) > -1) {
    if (tempElements.length == 0) {
      toastr.warning("只能编辑【有数据元】格！");
      return false;
    }
  }
  if ($.inArray(23, eArr) > -1) {
    if (tempElements.length == 1) {
    } else {
      toastr.warning("只能编辑【唯一数据元/值】格！");
      return false;
    }
  }
  if ($.inArray(24, eArr) > -1) {
    if (tempElements.is("select") && tempElements.attr("id") != "province10") {
      toastr.warning("只能编辑【非下拉框】数据元！");
      return false;
    }
  }
  if ($.inArray(25, eArr) > -1) {
    if ($.inArray(tempElements.attr("type"), ["radio", "checkbox"]) > -1) {
      toastr.warning("只能编辑【非选择框】数据元！");
      return false;
    }
  }
  if ($.inArray(26, eArr) > -1) {
    if (
      gridCounter == 1 &&
      (tempElements.length > 1 ||
        tempElements.is("select") ||
        tempElements.is(":checkbox") ||
        tempElements.is(":radio"))
    ) {
      if (tempElements.attr("id") == "province10") {
        toastr.warning("不支持编辑【地址自典型】数据元！");
        return false;
      }
    } else {
      toastr.warning("只能编辑【带值域】数据元！");
      return false;
    }
  }
  if ($.inArray(27, eArr) > -1) {
    for (var b = 0; b < tempElements.length; b++) {
      var name = tempElements.eq(b).attr("name");
      var selectedC = tempGrids.find("[name='" + name + "']").length;
      var editorC = $("[name='" + name + "']").length;
      if (editorC > selectedC) {
        toastr.warning("只能选中【全部值域】数据元，才能编辑！");
        return false;
      }
    }
  }
  return true;
}
function isGridEditable_new(eArr, isParent, id) {
  var isParent = isParent ? isParent : "N";
  if (isParent == "Y") {
    var tempGrids = parent.getGrids();
  } else {
    var tempGrids = getGrids();
  }

  var gridCounter = tempGrids.length;
  var tempElements = tempGrids.find(".c-element");
  if ($.inArray(11, eArr) > -1) {
    if (gridCounter == 0) {
      toastr.warning("至少选择【一个】网格！");
      return false;
    }
  }
  if ($.inArray(12, eArr) > -1) {
    if (gridCounter == 1) {
    } else {
      toastr.warning("只能编辑【一个】网格！");
      return false;
    }
  }
  if ($.inArray(13, eArr) > -1) {
    if (tempGrids.find(".c-grid").length > 0) {
      toastr.warning("只能编辑最【内层】格！");
      return false;
    }
  }
  if ($.inArray(14, eArr) > -1) {
    if ($.trim(tempGrids.find(".c-content:first").html()) != "") {
      parent.toastr.warning("只能编辑【空】格！");
      return false;
    }
  }
  if ($.inArray(21, eArr) > -1) {
    if (tempElements.length > 0) {
      toastr.warning("只能编辑【无数据元】格！");
      return false;
    }
  }
  if ($.inArray(22, eArr) > -1) {
    if (tempElements.length == 0) {
      toastr.warning("只能编辑【有数据元】格！");
      return false;
    }
  }
  if ($.inArray(23, eArr) > -1) {
    if (tempElements.length == 1) {
    } else {
      toastr.warning("只能编辑【唯一数据元/值】格！");
      return false;
    }
  }
  if ($.inArray(24, eArr) > -1) {
    if (tempElements.is("select") && tempElements.attr("id") != "province10") {
      toastr.warning("只能编辑【非下拉框】数据元！");
      return false;
    }
  }
  if ($.inArray(25, eArr) > -1) {
    if ($.inArray(tempElements.attr("type"), ["radio", "checkbox"]) > -1) {
      toastr.warning("只能编辑【非选择框】数据元！");
      return false;
    }
  }
  if ($.inArray(26, eArr) > -1) {
    if (
      gridCounter == 1 &&
      (tempElements.length > 1 ||
        tempElements.is("select") ||
        tempElements.is(":checkbox") ||
        tempElements.is(":radio"))
    ) {
      if (tempElements.attr("id") == "province10") {
        toastr.warning("不支持编辑【地址自典型】数据元！");
        return false;
      }
    } else {
      toastr.warning("只能编辑【带值域】数据元！");
      return false;
    }
  }
  if ($.inArray(27, eArr) > -1) {
    for (var b = 0; b < tempElements.length; b++) {
      var name = tempElements.eq(b).attr("name");
      var selectedC = tempGrids.find("[name='" + name + "']").length;
      var editorC = $("[name='" + name + "']").length;
      if (editorC > selectedC) {
        toastr.warning("只能选中【全部值域】数据元，才能编辑！");
        return false;
      }
    }
  }
  return true;
}

function openModalWin(event, url, eArr, isParent) {
  if (!isGridEditable(eArr)) return false;
  parent.$("#parentSaveBtn").removeClass("hidden");
  var isParent = isParent ? isParent : "N";
  if (isParent == "Y") {
    var modalWin = parent.$("#modalWin");
    var iWin = parent.$("#iWin");
    var dragWin = parent.$("#dragWin");
    var ModalTitle = parent.$("#Modal_title");
  } else {
    var modalWin = $("#modalWin");
    var iWin = $("#iWin");
    var dragWin = $("#dragWin");
    var ModalTitle = $("#Modal_title");
  }
  dragWin.css({ top: 0, left: 0 });
  var randomnumber = Math.floor(Math.random() * 1000);
  window.modalWin = modalWin;
  iWin.attr("src", url + "?" + randomnumber);
  dragWin.tmsDrag("#dragCon");
  modalWin.modal({ show: true });
  if (event.title) ModalTitle.html(event.title);
  else ModalTitle.html(event.innerHTML);
  window.setInterval(function() {
    var iframe = document.getElementById("iWin");
    iframe.height =
      iframe.contentWindow.document.body &&
      iframe.contentWindow.document.documentElement
        ? Math.min(
            iframe.contentWindow.document.body.scrollHeight,
            iframe.contentWindow.document.documentElement.scrollHeight
          )
        : "400px";
  }, 200);
}

function c2id() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getTemplateID() {
  if (window.template_id == undefined) {
    window.template_id = parent.template_id;
    if (window.template_id == undefined) {
      window.template_id = parent.parent.template_id;
    }
  }
  return window.template_id;
}

function selfDeleteGrid(event) {
  $(event)
    .parents(".c-grid:first")
    .remove();
}

function selfCopyGrid(event) {
  var grid = $(event).parents(".c-grid:first");
  var newGrid = grid.clone();
  newGrid.attr("id", c2id());
  grid.after(newGrid);
}

function jingyu_cloneNode(event) {
  var firstRow = $(event).parents(".c-grid:first");
  //var rownum = parseInt(firstRow.siblings().length)+2;
  if (
    firstRow.attr("data-num") == "" ||
    firstRow.attr("data-num") == undefined
  ) {
    var rownum = parseInt(firstRow.find(".table_flag").attr("rownum")) + 1;
    firstRow.attr("data-num", rownum);
  } else {
    var rownum = parseInt(firstRow.attr("data-num")) + 1;
    firstRow.attr("data-num", rownum);
  }

  var tabName = firstRow.find(".table_flag:first").attr("tabName");
  var newGrid = $(
    $(event)
      .parent()
      .attr("data-content")
  );
  var grids = newGrid.find(".c-grid");
  grids.each(function() {
    if ($(this).attr("data-hide")) {
      $(this).hide();
      $(this)
        .find(".c-element")
        .attr("disabled", "disabled");
    }
  });
  newGrid.removeAttr("onmouseover onclick");
  grids.removeAttr("onmouseover onclick");
  newGrid.find(".table_flag").attr({ rownum: rownum, tabName: tabName });
  newGrid.find(".c-element").attr({ rownum: rownum, tabName: tabName });

  if (newGrid.find(".selfCopyGridDIV").length > 0) {
    var innerInc = newGrid.find(".selfCopyGridDIV").parents(".c-grid:first");
    if (
      innerInc.attr("data-incIid") == "" ||
      innerInc.attr("data-incIid") == undefined
    ) {
      for (var i = 1; i < 10000; i++) {
        var incId = "tabName" + i;
        if ($("body").find("#" + incId).length == 0) break;
      }
    } else {
      var oldId = firstRow.attr("data-incIid");
      var incId =
        "tabname" +
        (parseInt(oldId.substring(oldId.length - 1, oldId.length)) +
          parseInt(1));
    }
    innerInc.attr("data-incIid", incId);
    innerInc.find(".c-content:first").attr("id", incId);
    innerInc.find(".c-content:first").removeAttr("tabname");
    innerInc.find(".c-content:first").removeAttr("rownum");
    innerInc
      .find(".c-content:first")
      .find(".table_flag")
      .attr({ rownum: 2, tabName: incId });
    innerInc
      .find(".c-content:first")
      .find(".c-element")
      .attr({ rownum: 2, tabName: incId });
  }

  //创建新的元的ID
  var words = "<i>" + newGrid.prop("outerHTML") + "</i>";
  var elements = newGrid.find(".c-element");
  elements.each(function() {
    var tempName = $(this).attr("name");
    var reg = /^([a-zA-Z0-9\.]+_\d+).*/;
    var tempStr = reg.exec(tempName)[1];
    var newName = tempName;
    for (var i = 2; i < 10000; i++) {
      var newName = tempStr + "_" + i;
      if ($("[name='" + newName + "'").length == 0) break;
    }
    var e = new RegExp(tempName, "g");
    words = words.replace(e, newName);
    //$(this).attr('name', newName);
  });

  var innerNode = $(words);
  var grids = innerNode.find(".c-grid");
  for (var i = 0; i < grids.length; i++) {
    var id = grids.eq(i).attr("id");
    var e = new RegExp(id, "g");
    var newID = c2id();
    words = words.replace(e, newID);
  }
  newGrid = $(words).children();
  firstRow.parent().append(newGrid);
  erroPopover(newGrid.find(".c-input"));
}

function jingyu_deleNode(event) {
  $(event)
    .parents(".c-grid:first")
    .nextAll()
    .last()
    .remove();
}

function addFlag(obj) {
  for (var i = 1; i < 10000; i++) {
    var tabName = "tabName" + i;
    if (obj.parents("#editorBody").find("#" + tabName).length == 0) break;
  }
  obj.find(".c-content:first").attr("id", tabName);
  obj.find(".c-content:first").removeAttr("tabname");
  obj.find(".c-content:first").removeAttr("rownum");
  obj.find(".c-content:first").removeClass("table_flag");
  var grids = obj.find(".c-grid");
  if (grids.length <= 0) {
    grids = obj;
  }
  grids.find(".c-content:first").attr({ tabName: tabName, rowNum: 2 });
  grids.find(".c-content:first").addClass("table_flag");
}

function removeFlag(obj) {
  obj.find(".c-content:first").removeAttr("id");

  var grids = obj.find(".c-grid");
  if (grids.length <= 0) {
    grids = obj;
  }
  grids.find(".c-content:first").removeAttr("tabName rowNum");
  grids.find(".c-content:first").removeClass("table_flag");
}

function zq_removeClass(grids) {
  for (var i = 0; i <= 24; i++) {
    grids.removeClass("col-xs-" + i);
    grids.removeClass("col-sm-" + i);
    grids.removeClass("col-md-" + i);
    grids.removeClass("col-lg-" + i);
  }
}

function classRemoveSM(grids) {
  for (var i = 0; i <= 24; i++) {
    grids.removeClass("col-xs-" + i);
    grids.removeClass("col-sm-" + i);
    grids.removeClass("col-md-" + i);
    grids.removeClass("col-lg-" + i);
  }
}

function classRemoveOFFSET(grids) {
  for (var i = 0; i <= 24; i++) {
    grids.removeClass("col-xs-offset-" + i);
    grids.removeClass("col-sm-offset-" + i);
    grids.removeClass("col-md-offset-" + i);
    grids.removeClass("col-lg-offset-" + i);
  }
}

function zq_get_url_param(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}

function edc_zq_get_url_param(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}

function zq_showViewStyle() {
  $.post(
    apiURL + "/CRFSvr/model",
    { id: zq_get_url_param("id") },
    function(res) {
      if (res.code == 0) {
        if (res.data.STYLE_PADDING == "" || res.data.STYLE_COLOR == "") {
          return false;
        }
        $("#bootstrap-style").attr(
          "href",
          "./libs/bootstrap-" +
            res.data.STYLE_PADDING +
            "-" +
            res.data.STYLE_COLOR +
            ".css"
        );
      }
    },
    "json"
  );
}

function zq_rangeShowValue(event) {
  $(event)
    .parent()
    .find(".c-range-value")
    .text($(event).val());
}

//TODO 張琪 排版zh_readFile
function zh_readFile(a) {
  var oPic = a.parentNode.previousElementSibling;
  var file = a.files[0];
  if (!file || !/image\/\w+/.test(file.type)) {
    file = "";
    oPic.innerHTML = "请插入图片";
    return false;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    var image = new Image();
    image.src = e.target.result;
    image.onload = function() {
      image.style.height = "84px";
      image.style.width = "198px";
      image.style.verticalAlign = "initial";
      oPic.innerHTML = "";
      oPic.appendChild(image);
    };
  };
  reader.readAsDataURL(file);
  return false;
}

function zh_removePic(a) {
  var oPic = a.parentNode.previousElementSibling.previousElementSibling;
  oPic.innerHTML = "请插入图片";
  return false;
}
//========================公式编辑区=================================================
function howManyDays(sDate1, sDate2) {
  //sDate1和sDate2是2002-12-18格式
  var aDate, oDate1, oDate2, iDays;
  aDate = sDate1.split("-");
  oDate1 = new Date(
    (aDate[1] + "-" + aDate[2] + "-" + aDate[0]).replace(/-/g, "/")
  ); //转换为12-18-2002格式
  aDate = sDate2.split("-");
  oDate2 = new Date(
    (aDate[1] + "-" + aDate[2] + "-" + aDate[0]).replace(/-/g, "/")
  );
  iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
  return iDays;
}

//传参方法 activeRange(参数,[[小于数,大于数,乘以的数]],矫正参数可填) 模板136
function activeRange(value, range, param) {
  var param = param || 1;
  var res;
  $(range).each(function() {
    if ($(this)[0] + "" == "" && $(this)[1] == "") {
      res = floatClear(floatClear(value, $(this)[2], "*"), param, "*");
      return false;
    }
    if ($(this)[0] + "" == "") {
      if (value <= $(this)[1]) {
        res = floatClear(floatClear(value, $(this)[2], "*"), param, "*");
        return false;
      }
    } else if ($(this)[1] == "") {
      if (value >= $(this)[0]) {
        res = floatClear(floatClear(value, $(this)[2], "*"), param, "*");
        return false;
      }
    } else {
      if (value >= $(this)[0] && value <= $(this)[1]) {
        res = floatClear(floatClear(value, $(this)[2], "*"), param, "*");
        return false;
      }
    }
  });
  return res;
}

function floatClear(num1, num2, operation) {
  if (num1.toString().indexOf(".") != -1) {
    var t1 = num1.toString().split(".")[1].length;
    var r1 = Number(num1.toString().replace(".", ""));
  } else {
    var t1 = 0;
    var r1 = num1;
  }
  if (num2.toString().indexOf(".") != -1) {
    var t2 = num2.toString().split(".")[1].length;
    var r2 = Number(num2.toString().replace(".", ""));
  } else {
    var t2 = 0;
    var r2 = num2;
  }
  var res;
  var max = Math.pow(10, Math.max(t1, t2));
  if (operation == "/") {
    res = r1 / r2 * Math.pow(10, t2 - t1);
  } else if (operation == "*") {
    res = r1 * r2 * Math.pow(10, -(t2 + t1));
  } else if (operation == "+") {
    res = (num1 * max + num2 * max) / max;
  } else if (operation == "-") {
    res = (num1 * max - num2 * max) / max;
  }
  return res;
}

// 模板138
function f_special_range_compute(value, rangeArr, computeArr) {
  var res = 0;
  for (var i = 0; i < rangeArr.length; i++) {
    var ranNode = rangeArr[i];
    var comNode = computeArr[i];
    if (ranNode[0] + "" == "" && ranNode[1] == "") {
      res = floatClear(floatClear(value, comNode[0], "*"), comNode[1], "+");
      break;
    }
    if (ranNode[0] + "" == "") {
      if (value <= $(this)[1]) {
        res = floatClear(floatClear(value, comNode[0], "*"), comNode[1], "+");
        break;
      }
    } else if (ranNode[1] == "") {
      if (value >= $(this)[0]) {
        res = floatClear(floatClear(value, comNode[0], "*"), comNode[1], "+");
        break;
      }
    } else {
      if (value >= ranNode[0] && value <= ranNode[1]) {
        res = floatClear(floatClear(value, comNode[0], "*"), comNode[1], "+");
        break;
      }
    }
  }
  return res;
}

/*根据不同取值范围，有不同的计算公式
 * f_special_range_compute(value, rangeArr, computeArr)
 * 参数：
 * value：计算项参数
 * rangeArr：范围划分，例如0-4范围和5以后范围，写法格式[[0,4],[5,""]]
 * computeArr：不同范围段对应的公式
 * 实例模板 576 计算右侧疼痛总分 f_special_range_compute(V1, [[1,4], [5,""]], [(25-V1)*5, 0])
 * */
function f_special_range_compute(value, rangeArr, computeArr) {
  var res = 0;
  for (var i = 0; i < rangeArr.length; i++) {
    var ranNode = rangeArr[i];
    var comNode = computeArr[i];
    if (ranNode[0] + "" == "" && ranNode[1] == "") {
      res = comNode;
      break;
    }
    if (ranNode[0] + "" == "") {
      if (value <= $(this)[1]) {
        res = comNode;
        break;
      }
    } else if (ranNode[1] == "") {
      if (value >= $(this)[0]) {
        res = comNode;
        break;
      }
    } else {
      if (value >= ranNode[0] && value <= ranNode[1]) {
        res = comNode;
        break;
      }
    }
  }
  return res;
}

//传参方法 f_goodText(参数,[[是否相等,小于数,大于数]])
function f_goodText(num, range) {
  var res;
  $(range).each(function() {
    if (this[0] == "=") {
      if (this[1] === "") {
        if (num <= this[2]) {
          res = this[3];
        }
      } else if (this[2] === "") {
        if (num >= this[1]) {
          res = this[3];
        }
      } else {
        if (num >= this[1] && num <= this[2]) {
          res = this[3];
        }
      }
    } else if (this[0] == "==") {
      if (num == this[1]) {
        res = this[2];
      }
    } else {
      if (this[1] === "") {
        if (num < this[2]) {
          res = this[3];
        }
      } else if (this[2] === "") {
        if (num > this[1]) {
          res = this[3];
        }
      } else {
        if (num > this[1] && num < this[2]) {
          res = this[3];
        }
      }
    }
  });
  return res;
}

function f_minDate(name, min, max) {
  var date_format = $('[name="' + name + '"]').attr("onclick");
  date_format = date_format.substring(
    date_format.indexOf("d", 2),
    date_format.indexOf(",")
  );
  $('[name="' + name + '"]').attr(
    "onClick",
    "WdatePicker({" +
      date_format +
      ",minDate:'" +
      min +
      "',maxDate:'" +
      max +
      "'})"
  );
}

//取绝对值
function f_getAbs(v) {
  if (!v.toString()) return;
  return Math.abs(v);
}

//向下取整
function f_getFloor(v) {
  if (!v.toString()) return;
  return Math.floor(v);
}

//保留特定小数位数
function f_float(value, minfloat) {
  return Number(parseFloat(value).toFixed(minfloat));
}

//高等数学里的以e为底的指数函数  例：EXP{F(X)}是e的F(X)次方。
function f_exp(V) {
  return Math.exp(V);
}

//用来获得x的y次方
function f_pow(V1, V2) {
  return Math.pow(V1, V2);
}

/* 日期时间间隔计算，返指定的时间格式
 *  f_dateSubtractDate(beginDate, finishDate[, unit])
 *  参数:
 *  beginDate  : 开始日期 curr为当前日期
 *  finishDate : 结束日期 curr为当前日期
 *  unit       : 计算出的日期显示格式 (可选参数 默认值 1)
 *
 *  unit = 1 格式 mm:ss
 *  unit = 2 格式 分:秒
 *  unit = 3 格式 返回周数
 *
 *  实例模板353
 *  f_dateSubtractDate(V1 , V2 , 2);
 */
function f_dateSubtractDate(beginDate, finishDate, returnType, name) {
  if (!beginDate || !finishDate) return;
  var eleName = name ? name : "N";
  var beginArr =
    beginDate == "curr"
      ? getCurrDateArr()
      : beginDate
          .replace(/年|月|日|时|分|秒|\-|:|\s/g, ",")
          .replace(/,,/g, ",")
          .replace(/,$/, "")
          .split(",");
  var finishArr =
    finishDate == "curr"
      ? getCurrDateArr()
      : finishDate
          .replace(/年|月|日|时|分|秒|\-|:|\s/g, ",")
          .replace(/,,/g, ",")
          .replace(/,$/, "")
          .split(",");

  for (var i = 0; i < 6; i++) {
    beginArr[i] = beginArr[i] == undefined ? 0 : parseInt(beginArr[i]);
    finishArr[i] = finishArr[i] == undefined ? 0 : parseInt(finishArr[i]);
  }
  var timeSpaceTimeStamp =
    new Date(
      finishArr[0],
      dateZeroFill(parseInt(finishArr[1]) - 1),
      finishArr[2],
      finishArr[3],
      finishArr[4],
      finishArr[5]
    ) /
      1000 -
    new Date(
      beginArr[0],
      dateZeroFill(parseInt(beginArr[1]) - 1),
      beginArr[2],
      beginArr[3],
      beginArr[4],
      beginArr[5]
    ) /
      1000;

  var unit = returnType == undefined ? 1 : returnType;
  switch (unit) {
    case 1: //CASE 1 : return (mm:ss)
      if (eleName != "N")
        $('[name="' + name + '"]').val(
          dateZeroFill(parseInt(timeSpaceTimeStamp / 60)) +
            ":" +
            dateZeroFill(parseInt(timeSpaceTimeStamp % 60))
        );
      return (
        dateZeroFill(parseInt(timeSpaceTimeStamp / 60)) +
        ":" +
        dateZeroFill(parseInt(timeSpaceTimeStamp % 60))
      );
    case 2: //CASE 2 : return (分:秒)
      if (eleName != "N")
        $('[name="' + name + '"]').val(
          dateZeroFill(parseInt(timeSpaceTimeStamp / 60)) +
            "分" +
            dateZeroFill(parseInt(timeSpaceTimeStamp % 60)) +
            "秒"
        );
      return (
        dateZeroFill(parseInt(timeSpaceTimeStamp / 60)) +
        "分" +
        dateZeroFill(parseInt(timeSpaceTimeStamp % 60)) +
        "秒"
      );
    case 3: //CASE 3 : return 周数
      if (eleName != "N")
        $('[name="' + name + '"]').val(Math.round(timeSpaceTimeStamp / 604800));
      return Math.round(timeSpaceTimeStamp / 604800);
    default:
      if (eleName != "N") $('[name="' + name + '"]').val("");
      return "";
  }

  function getCurrDateArr() {
    var date = new Date();
    return (resArr = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ]);
  }
}

//日期相减，返回周数
function f_dateSubtractWeeks(beginDate, finishDate) {
  return parseInt(
    (new Date(finishDate.replace(/-/g, ",")) -
      new Date(beginDate.replace(/-/g, ","))) /
      (60 * 60 * 24 * 7 * 1000)
  );
}

//日期加上周数，返回日期
function f_addWeek(currDate, weeks) {
  return timeStampToDate(
    new Date(currDate.replace(/-/g, ",")).getTime() +
      60 * 60 * 24 * 7 * 1000 * weeks
  );
}

//日期加/减天数，返回日期
function f_calculateDays(calcDate, sign, calcDays) {
  var cDateTimeStamp = new Date(calcDate.replace(/-/g, ",")).getTime();
  var dayTimeStamp = 60 * 60 * 24 * 1000;
  var resTimeStamp;

  switch (sign) {
    case "+":
      resTimeStamp = cDateTimeStamp + dayTimeStamp * calcDays;
      break;
    case "-":
      resTimeStamp = cDateTimeStamp - dayTimeStamp * calcDays;
      break;
    default:
      resTimeStamp = cDateTimeStamp;
      break;
  }

  return timeStampToDate(resTimeStamp);
}

// ele=元素 value=输入值 add=需要加（减）多少 compare='>=' dataInfo错误信息
function f_noUpOrDown(ele, value, compare, add, dataInfo) {
  var add = add || 0;
  var dataInfo = dataInfo || "";
  if (compare == ">=") {
    $('[name="' + ele + '"]').attr("data-minEqual", true);
    $('[name="' + ele + '"]').attr("min", parseInt(value) + add);
    $('[name="' + ele + '"]').attr("data-minInfo", dataInfo);
  } else if (compare == "<=") {
    $('[name="' + ele + '"]').attr("data-maxEqual", true);
    $('[name="' + ele + '"]').attr("max", parseInt(value) + add);
    $('[name="' + ele + '"]').attr("data-maxInfo", dataInfo);
  } else if (compare == ">") {
    $('[name="' + ele + '"]').attr("min", parseInt(value) + add);
    $('[name="' + ele + '"]').attr("data-minInfo", dataInfo);
  } else if (compare == "<") {
    $('[name="' + ele + '"]').attr("max", parseInt(value) + add);
    $('[name="' + ele + '"]').attr("data-maxInfo", dataInfo);
  }
}

//设置日期控件时间选择范围(当前日期控件的name值, 最小日期, 最小日期加减计算, 最大日期, 最大日期加减计算)
function f_calculationTimeRange(name, minDate, minNum, maxDate, maxNum) {
  var resArr = calcDate(minDate, minNum, maxDate, maxNum);
  setDateRange(name, resArr);
}

/*
 * 限制日期选择范围,仅提示或提示且不能提交
 * f_dateLimit(name, minDate, minNum, minType, minText, maxDate, maxNum, maxType, maxText)
 * 参数:
 * name    : 当前日期控件的name值
 * minDate : 最小日期
 * minNum  : 最小日期加/减多少时间(年,月,日,周)
 * minType : 最小日期提示方式,是否仅提示true(仅提示)/false(提示并不可输入)
 * minText : 最小日期提示文字
 * maxDate : 最大日期
 * maxNum  : 最大日期加/减多少时间(年,月,日,周)
 * maxType : 最大日期提示方式,是否仅提示true(仅提示)/false(提示并不可输入)
 * maxText : 最大日期提示文字
 * 实例模板278
 * f_dateLimit('JH06.00.002.706_278_1', V, '+0日' , false, '结束时间晚于开始时间' ,'2099-01-01', '+0日', true, '日期超出范围');
 */
function f_dateLimit(
  name,
  minDate,
  minNum,
  minType,
  minText,
  maxDate,
  maxNum,
  maxType,
  maxText
) {
  var resArr = calcDate(minDate, minNum, maxDate, maxNum);
  $('input[name="' + name + '"]').attr({
    "data-minlimit": resArr[0],
    "data-maxlimit": resArr[1],
    "data-mintext": minText,
    "data-maxtext": maxText,
    "data-mintype": minType,
    "data-maxtype": maxType
  });
}

function f_dateConfirm(v, name, range, minText, maxText) {
  var dateVal = new Date(v.replace(/-/g, ",")).getTime(),
    rangeStr = range,
    minLimit = rangeStr[0],
    maxLimit = rangeStr[rangeStr.length - 1],
    minInterval = rangeStr[1],
    maxInterval = rangeStr[rangeStr.length - 2],
    tempNumArr = rangeStr.split(","),
    dateReg = /[^\u4e00-\u9fa5\-\+0-9]/g,
    minNum = tempNumArr[0].replace(dateReg, ""),
    maxNum = tempNumArr[1].replace(dateReg, "");

  var resArr = calcDate("curr", minNum, "curr", maxNum);
  resArr[0] = new Date(resArr[0].replace(/-/g, ",")).getTime();
  resArr[1] = new Date(resArr[1].replace(/-/g, ",")).getTime();

  if (minLimit === "A") {
    resArr[1] = "1900-01-01";
    if (minInterval === "[" && dateVal < resArr[0]) {
      infoPopover(name, minText);
    }
    if (minInterval === "(" && dateVal <= resArr[0]) {
      infoPopover(name, minText);
    }
  }

  if (maxLimit === "A") {
    resArr[1] = "2099-01-01";
    if (maxInterval === "]" && dateVal > resArr[1]) {
      infoPopover(name, maxText);
    }
    if (maxInterval === ")" && dateVal >= resArr[1]) {
      infoPopover(name, maxText);
    }
  }

  setDateRange(name, resArr);
}

//计算范围(最小日期, 最小日期加减, 最大日期, 最大日期加减) 返回数组[0]=最小日期 , [1]=最大日期
function calcDate(minDate, minNum, maxDate, maxNum) {
  var min =
    minDate == "curr" || minDate == "0"
      ? timeStampToDate(new Date().getTime())
      : minDate;
  var max =
    maxDate == "curr" || maxDate == "0"
      ? timeStampToDate(new Date().getTime())
      : maxDate;

  var numArr = [minNum, maxNum];
  var dateArr = [min, max];
  var resArr = [];

  for (var i = 0, len = 2; i < len; i++) {
    if (/年$/.test(numArr[i])) {
      resArr[i] =
        parseInt(numArr[i].replace(/年$/, "")) +
        parseInt(dateArr[i].substring(0, 4)) +
        dateArr[i].substring(4);
    } else if (/月$/.test(numArr[i])) {
      //月份计算
      numArr[i] = parseInt(numArr[i].replace(/月$/, "")); //去除字符串月，取整形月份数字
      var tempDate = new Date(dateArr[i].replace(/-/g, ",")); //需要计算的日期对象
      var dateYear = tempDate.getFullYear(); //需要计算的年
      var dateMonth = tempDate.getMonth() + 1; //需要计算的月
      var dateDate = tempDate.getDate(); //需要计算的日

      var calcYear = parseInt(numArr[i] / 12); //月份绝对值超过12，计算需要加减的年份
      var calcMonth = parseInt(numArr[i] % 12); //月份的余数

      var resMonth = parseInt(dateMonth) + calcMonth; //月份余数 与 需要计算的月份之和
      if (resMonth > 12) {
        //月份之和超过一年 (加月份)
        resMonth -= 12;
        calcYear += 1;
      } else if (resMonth < 1) {
        //月份相减跨年 (减月份)
        resMonth += 12;
        calcYear -= 1;
      }
      //拼日期字符串
      resArr[i] =
        dateYear +
        calcYear +
        "-" +
        dateZeroFill(resMonth) +
        "-" +
        dateZeroFill(dateDate);
    } else if (/日$/.test(numArr[i])) {
      resArr[i] = timeStampToDate(
        new Date(dateArr[i].replace(/-/g, ",")).getTime() +
          parseInt(numArr[i].replace(/日$/, "")) * (60 * 60 * 24 * 1000)
      );
    } else if (/周$/.test(numArr[i])) {
      resArr[i] = timeStampToDate(
        new Date(dateArr[i].replace(/-/g, ",")).getTime() +
          parseInt(numArr[i].replace(/周$/, "")) * (60 * 60 * 24 * 7 * 1000)
      );
    }
  }
  return resArr;
}

//设置日期控件选择范围(日期控件input的name属性值, calcDate函数的返回值数组)
function setDateRange(name, resArr) {
  var minDate = resArr[0] == null ? "1900-01-01" : timeStampToDate(resArr[0]);
  var maxDate = resArr[1] == null ? "2099-01-01" : timeStampToDate(resArr[1]);

  var date_format = $('[name="' + name + '"]').attr("onclick");
  date_format = date_format.substring(
    date_format.indexOf("d", 2),
    date_format.indexOf(",")
  );
  $('[name="' + name + '"]').attr(
    "onClick",
    "WdatePicker({" +
      date_format +
      ",minDate:'" +
      minDate +
      "',maxDate:'" +
      maxDate +
      "'})"
  );
}

function f_minOrMax(ele, v, compare, add) {
  if (compare == ">=") {
    $('[name="' + ele + '"]').attr("min", add - v);
  } else if (compare == "<=") {
    $('[name="' + ele + '"]').attr("max", add - v);
  } else if (compare == ">") {
    $('[name="' + ele + '"]').attr("data-minEqual", true);
    $('[name="' + ele + '"]').attr("min", add - v);
  } else if (compare == "<") {
    $('[name="' + ele + '"]').attr("data-maxEqual", true);
    $('[name="' + ele + '"]').attr("max", add - v);
  }
}

//判断输入框的值，如果等于某数，返回0，否则返回该数值
function f_notSureValue(val, unVal) {
  return val == unVal ? 0 : val;
}

//计算最高分
function f_calculateHighestScore() {
  return Math.max.apply(null, arguments);
}

//身份证号，返回日期
function f_IDtoDate(id) {
  var idnum = id.toString();
  return (
    idnum.substring(6, 10) +
    "-" +
    idnum.substring(10, 12) +
    "-" +
    idnum.substring(12, 14)
  );
}

//(V, name绑定的元素, [范围number,'提示语'], [范围number,'提示语'])
function f_confirm(v, ele, range1, range2) {
  if (!(range1[0] <= v)) {
    infoPopover(ele, range1[1]);
  }
  if (!(range2[0] >= v)) {
    infoPopover(ele, range2[1]);
  }
}

function f_newConfirm(v, name, range, minText, maxText) {
  var rangeStr = range,
    minLimit = rangeStr[0],
    maxLimit = rangeStr[rangeStr.length - 1],
    minInterval = rangeStr[1],
    maxInterval = rangeStr[rangeStr.length - 2],
    tempNumArr = rangeStr.split(","),
    minNum = tempNumArr[0].replace(/[^0-9]/gi, ""),
    maxNum = parseFloat(tempNumArr[1]);

  if (minLimit === "A") {
    if (minInterval === "[" && v < minNum) {
      infoPopover(name, minText);
    }
    if (minInterval === "(" && v <= minNum) {
      infoPopover(name, minText);
    }
  }

  if (maxLimit === "A") {
    if (maxInterval === "]" && v > maxNum) {
      infoPopover(name, maxText);
    }
    if (maxInterval === ")" && v >= maxNum) {
      infoPopover(name, maxText);
    }
  }
}

function f_isSex(v, rangeArr, ele) {
  $(rangeArr).each(function() {
    if (v != this) {
      $('[name="' + ele + '"]').attr("disabled", "disabled");
    }
  });
}

//身份证计算年龄
function f_idCalculatedAge(id) {
  var idNum = id.toString();
  var myDate = new Date();
  var month = myDate.getMonth() + 1;
  var day = myDate.getDate();
  var age = myDate.getFullYear() - idNum.substring(6, 10) - 1;
  if (
    idNum.substring(10, 12) < month ||
    (idNum.substring(10, 12) == month && idNum.substring(12, 14) <= day)
  ) {
    age++;
  }
  return age;
}

//汉字转拼音
function f_nameTransPinyin(name) {
  var nameLength = name.length;
  var pinyinArr = [];
  for (var i = 0; i < nameLength; i++) {
    pinyinArr[i] = ConvertPinyin(name[i]).toUpperCase();
  }

  if (nameLength === 3) {
    return (
      pinyinArr[0].substring(0, 2) +
      "-" +
      pinyinArr[1].substring(0, 1) +
      pinyinArr[2].substring(0, 1)
    );
  }
  if (nameLength === 2) {
    return pinyinArr[0].substring(0, 2) + "-" + pinyinArr[1].substring(0, 2);
  }
  if (nameLength >= 4) {
    return (
      pinyinArr[0].substring(0, 1) +
      pinyinArr[1].substring(0, 1) +
      "-" +
      pinyinArr[2].substring(0, 1) +
      pinyinArr[3].substring(0, 1)
    );
  }
}

//做显隐关系的数据元  计算值数组 被控制的数据元name
function f_getShowValue(v, cvalueArr, nameArr) {
  for (var i = 0, len = cvalueArr.length; i < len; i++) {
    if (v === cvalueArr[i]) {
      return nameArr[i];
    } else if (v != cvalueArr[i] && parseInt(i) + 1 == cvalueArr.length) {
      return 0;
    }
  }
}

/****根据一条数据元内容控制另一数据元具体显示，例：模板468根据计算的总分控制显示级别内容
 * 参数意义： v总分数据元  总分范围[[0,5],[6,10]]  级别数据元的name
 * ***/
function f_getShowSelect(v, numArr, name) {
  for (var i = 0, len = numArr.length; i < len; i++) {
    if (numArr[i][0] <= v && v <= numArr[i][1]) {
      $('[name="' + name + '"]')
        .find("option")
        .eq(i + 1)
        .prop("selected", true);
      break;
    }
  }
}

/****根据一条数据元的选中内容控制另一数据元可选择项，例：模板275根据第一题具体选项判断第二题哪些可选
 * 参数意义： v第一题数据元  numArr第一题数据元中控制下方不能选择的计算值[1,2,3,4,5,6]  name第二题数据元的name  index具体哪一个选项不让选
 * ***/
function f_disable(v, numArr, name, indexArray) {
  if ($.inArray(parseInt(v), numArr) > -1) {
    $('[name="' + name + '"]').prop("checked", false);
    for (var i = 0, len = indexArray.length; i < len; i++) {
      $('[name="' + name + '"]')
        .eq(indexArray[i])
        .attr("disabled", "disabled");
    }
  } else {
    for (var i = 0, len = indexArray.length; i < len; i++) {
      $('[name="' + name + '"]')
        .eq(indexArray[i])
        .removeAttr("disabled");
    }
  }
}

/****根据一条数据元选中哪个选项弹出提示（radio或check类型）例：模板275根据第一题选择非0项弹出提示
 * 参数意义： v第一题数据元  numArr第一题数据元中控制提示的计算值[1,2,3,4,5,6]  tip提示内容
 * ***/
function f_getTip(v, numArr, tip) {
  for (var i = 0, len = numArr.length; i < len; i++) {
    if (parseInt(v) === numArr[i]) {
      toastr.warning(tip);
      break;
    }
  }
}

/*  根据日期计算年龄(需给日期控件绑定公式,勾选 自动计算、失焦计算)
 *   参数:
 *   name : 年龄数据元编码
 *   v    : 日期控件值
 *   实例模板261
 *   f_dateCalcAge('JH02.01.026.00_261_2',V);
 */
function f_dateCalcAge(name, v1, v2) {
  if (!v1) return;
  if (v2) {
    var birthData = new Date(v1.replace(/-/g, ",")).getTime();
    var lastMenstData = new Date(v2.replace(/-/g, ",")).getTime() + 24192000000;
    $('[name="' + name + '"]').val(
      Math.ceil((lastMenstData - birthData) / 31536000000)
    );
    return Math.ceil((lastMenstData - birthData) / 31536000000);
  } else {
    var r = v1.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
    var date = new Date(r[1], r[3] - 1, r[4]);
    if (
      date.getFullYear() == r[1] &&
      date.getMonth() + 1 == r[3] &&
      date.getDate() == r[4]
    ) {
      var year = new Date().getFullYear();
      $('[name="' + name + '"]').val(year - r[1] + 1);
      return year - r[1] + 1;
    }
  }
}
//可取代上一公式f_dateCalcAge
/*  根据日期计算年龄
 *   参数:
 *   v: 日期控件参数
 *   给年龄控件绑定该公式f_dategetAge(V)
 */
function f_dategetAge(v1, v2) {
  if (!v1) return;
  if (v2) {
    var birthData = new Date(v1.replace(/-/g, ",")).getTime();
    var lastMenstData = new Date(v2.replace(/-/g, ",")).getTime() + 24192000000;
    return Math.ceil((lastMenstData - birthData) / 31536000000);
  } else {
    var r = v1.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
    var date = new Date(r[1], r[3] - 1, r[4]);
    if (
      date.getFullYear() == r[1] &&
      date.getMonth() + 1 == r[3] &&
      date.getDate() == r[4]
    ) {
      var year = new Date().getFullYear();
      return year - r[1] + 1;
    }
  }
}

/* 计算两个日期的时间间隔，是否在值定的范围
 *  f_dateCalcRange(name, v1, v2, rArr, unit, alertText);
 *  参数：
 *  name      :绑定公式的数据元编码。
 *  v1,v2     :两个日期数据元。
 *  rArr      :日期间隔限定范围。
 *  unit      :日期单位(年、月、日、周)。
 *  alertText : 提示话语。
 *  实例模板180
 *  f_dateCalcRange('JH10.00.012.32_180_1', V1, V2, [18,65], '年', '超出范围,进行入选/排除标准确认!');
 */
function f_dateCalcRange(name, v1, v2, rangeArr, unit, alertText) {
  if (v1 == "" && v2 == "") return;
  var v1TimeStamp = new Date(v1.toString().replace(/-/g, ",")).getTime();
  var v2TimeStamp = new Date(v2.toString().replace(/-/g, ",")).getTime();
  var unitObj = {
    年: 31536000000,
    月: 2592000000,
    周: 604800000,
    日: 86400000,
    天: 86400000,
    时: 3600000,
    分: 60000,
    秒: 1000
  };
  var timeInterval = Math.abs(v1TimeStamp - v2TimeStamp);
  var range = timeInterval / unitObj[unit];
  if (!(range >= parseInt(rangeArr[0]) && range <= parseInt(rangeArr[1]))) {
    infoPopover(name, alertText);
  }
}

/* 只能选中一个数据元
 *  f_chooseOneOnly(arguments);
 *  参数:
 *  arguments : 与当前绑定公式的所关联的数据元编码，可填写多个用 ',' 分割
 *  实例模板:188
 *  第六题 : f_chooseOneOnly('JH10.00.013.07_188_1');
 *  第七题 : f_chooseOneOnly('JH10.00.013.06_188_1');
 */
function f_chooseOneOnly() {
  for (var i = 0, len = arguments.length; i < len; i++) {
    $('input[name="' + arguments[i] + '"]').attr({
      "data-checked": false,
      checked: false
    });
  }
}

/* 设置数据元默认值
 *  f_setShowDefault(v, num, name, defaultVal);
 *  参数:
 *  v          : 当前绑定公式的数据元
 *  num        : 数据元的计算值
 *  name       : 需要设置默认值的数据元编码
 *  defaultVal : 默认值
 *  实例模板:189
 *  f_setShowDefault(V, 1, 'JH10.00.082.06_189_1' , 1);
 */
function f_setShowDefault(v, num, name, defaultVal) {
  if (v == num) {
    $('input[name="' + name + '"]')
      .val(defaultVal)
      .attr("readonly", defaultVal);
  } else {
    $('input[name="' + name + '"]')
      .val("")
      .removeAttr("readonly");
  }
}

//数据元值域分组
function f_setOptionsGroup(name, groupArr) {
  $(document).on("click", 'input[name="' + name + '"]', function() {
    for (var a = 0, b = $('input[name="' + name + '"]').length; a < b; a++) {
      var inputObj = $('input[name="' + name + '"]').eq(a);
      if (inputObj.attr("data-avalue") == $(this).attr("data-avalue")) {
        var index = a;
        for (var i = 0, len = groupArr.length; i < len; i++) {
          if ($.inArray(index, groupArr[i]) == -1) continue;
          for (var j = 0, jLen = groupArr[i].length; j < jLen; j++) {
            var item = $('input[name="' + name + '"]').eq(groupArr[i][j]);
            if (item.attr("data-avalue") != $(this).attr("data-avalue"))
              item.prop("checked", false);
          }
        }
        break;
      }
    }
  });
}

/* 给数据元添加大小值的质控，质控数值取自其他数据元间的计算
 *  f_setControlToEle(v, num, name, defaultVal);
 *  参数:
 *  name : 需要添加大小值控制的数据元编码
 *  v1 : 输入的最小值
 *  minequal : 大于等于填写'true'，否则就空''
 *  text1 : 提示错误原因
 *  v2 : 输入的最大值
 *  maxequal  : 小于等于填写'true'，否则就空''
 *  text2    : 提示错误原因
 *  实例模板:204
 *  f_setControlToEle('JH10.00.007.44_204_1', V1+V2+V3+V4+V5+V6+1, 'true', '填写孕周有误，请核实！', V1+V2+V3+V4+V5+V6+1, 'true', '填写孕周有误，请核实！')
 */
function f_setControlToEle(name, v1, minequal, text1, v2, maxequal, text2) {
  $('input[name="' + name + '"]').attr({
    min: v1,
    "data-minequal": minequal,
    "data-mininfo": text1,
    max: v2,
    "data-maxequal": maxequal,
    "data-maxinfo": text2
  });
}

/* 总分=得分/回答问题数量
 *  f_getAverage(v1, v2);
 *  参数:
 *  v1 : 得分1
 *  v2 : 得分2
 *  实例模板:589
 */
function f_getAverage() {
  var num = 0;
  var total = 0;
  for (var i = 0, len = arguments.length; i < len; i++) {
    total += arguments[i];
    if (arguments[i] > 0) num++;
  }
  return total / num;
}

/* 总分=得分/回答问题数量 有答题数量限制
 *  f_getNumAverage(name, V, minNum, text);
 *  参数:
 *  name：总分数据元的编码
 *  V : 数组类型，需要计算的所有参数
 *  minNum : 至少需要回答问题数
 *  text ： 提示错误语句
 *  实例模板 572 功能障碍/症状总分
 */
function f_getNumAverage(name, V, minNum, text) {
  var num = 0;
  var total = 0;
  for (var i = 0, len = V.length; i < len; i++) {
    total += V[i];
    if (V[i] > 0) num++;
  }
  if (num < minNum) {
    toastr.warning(text);
    $('input[name="' + name + '"]').val("");
  } else {
    return total / num;
  }
}

//刻度尺公式 f_rulerCalc(['JH06.00.002.262_112_1'],10-V);
function f_rulerCalc(name, calcNum, v) {
  var maskResDiv = $('<div class="maskResDiv"></div>');
  maskResDiv.html(calcNum - v).css({
    position: "absolute",
    top: 0,
    left: "105%",
    "font-size": "20px",
    background: "#fff",
    "white-space": "nowrap",
    "line-height": 1,
    "z-index": 9999,
    "box-sizing": "border-box"
  });
  if (
    $('input[name="' + name + '"]')
      .siblings(".slider-container")
      .children(".back-bar")
      .find(".maskResDiv").length > 0
  ) {
    $('input[name="' + name + '"]')
      .siblings(".slider-container")
      .children(".back-bar")
      .find(".maskResDiv")
      .html(calcNum - v);
  } else {
    $('input[name="' + name + '"]')
      .siblings(".slider-container")
      .children(".back-bar")
      .append(maskResDiv);
  }
  console.info(calcNum - v);
  return calcNum - v;
}

// 模板136特殊公式，四项全选择是为4分，少选一个为0
function f_special_getAllNum() {
  var num = 0;
  var total = 0;
  for (var i = 0, len = arguments.length; i < len; i++) {
    total += arguments[i];
    if (arguments[i] == 0) num = 1;
  }
  if (num == 1) return 0;
  if (num == 0) return total;
}

// 特殊公式，根据范围计算几次幂 CKD_EPI计算
function f_special_pow(V, powNum, isSex) {
  if (isSex == 1) {
    if (V <= 0.9) {
      return 141 * Math.pow(V / 0.9, -0.411) * Math.pow(0.993, powNum);
    } else {
      return 141 * Math.pow(V / 0.9, -1.209) * Math.pow(0.993, powNum);
    }
  } else if (isSex == 2) {
    if (V <= 0.7) {
      return 141 * Math.pow(V / 0.7, -0.329) * Math.pow(0.993, powNum);
    } else {
      return 141 * Math.pow(V / 0.7, -1.209) * Math.pow(0.993, powNum);
    }
  }
}

//时间戳转日期 返回 yyyy-mm-dd
function timeStampToDate(timeStamp) {
  var resDate = new Date(timeStamp);
  return (
    resDate.getFullYear() +
    "-" +
    dateZeroFill(resDate.getMonth() + 1) +
    "-" +
    dateZeroFill(resDate.getDate())
  );
}

//日期补零
function dateZeroFill(num) {
  return (num < 10 ? "0" + num : num).toString();
}

function radioC(event) {
  var c = $(event).attr("data-checked");
  var radioSiblings = $('[name="' + $(event).attr("name") + '"]');
  radioSiblings.prop("checked", false);
  radioSiblings.attr("data-checked", false);
  if (c == "true") c = false;
  else if (c == "false") c = true;
  $(event).prop("checked", c);
  $(event).attr("data-checked", c);
  radioSiblings.change();
}

function removeGridClass(obj) {
  obj.removeClass("mouse");
  obj.find(".mouse").removeClass("mouse");
  obj.removeClass("s-win");
  obj.find(".s-win").removeClass("s-win");
  obj.removeClass("click-red");
  obj.find(".click-red").removeClass("click-red");
  obj.find(".c-toolbar").remove();
  obj.find(".c-content").removeClass("c-indent");
}

function setTip(obj, tipText) {
  var cTipObj = obj.find(".c-tip");
  if (cTipObj.length > 0) {
    cTipObj.text(tipText);
  } else {
    var newTipObj = $(".c-tip").clone();
    newTipObj.text(tipText);
    obj.find(".c-content .form-horizontal").append(newTipObj);
  }
}

function popoverText(ele) {
  $(ele).on("dblclick", ".c-grid", function(e) {
    if (
      $(this).find(".c-title").length <= 0 &&
      $(this).attr("data-split") != "Y"
    )
      return false;

    $(ele)
      .find(".previewPop")
      .remove();
    var preview = $(
      '<div class="previewPop" style="max-height: 300px; position: absolute;z-index: 30;background-color: #fff;padding: 0; border: solid 1px #cccccc; overflow: auto;width: 300px;left:0px;top:30px;font-size:12px;"><div><h5 class="editor_name popover-title"></h5></div><div ><table class="table table-hover" style="margin-bottom: 0;table-layout:fixed;"><thead><tr><th class="text-center">值域</th><th class="text-center">计算值</th><th class="text-center">值</th></tr></thead><tbody></tbody></table></div></div>'
    );

    if ($(this).attr("data-title")) {
      preview
        .find(".editor_name")
        .html(
          $(this).attr("data-title") +
            "\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            $(this).attr("data-c-value")
        );
      if ($(this).attr("data-split") == "Y") {
        elementsObj = "<div>" + $(this).attr("data-element") + "</div>";
        elementsData = $(elementsObj).find(".c-element");
      } else {
        elementsData = $(this).find(".c-element");
      }
    } else {
      var cTitle = $(this).find(".c-title");
      if (cTitle.attr("data-title")) {
        preview
          .find(".editor_name")
          .html(cTitle.attr("data-title") + "\n" + cTitle.attr("title"));
      } else {
        preview
          .find(".editor_name")
          .html(cTitle.html() + "\n" + cTitle.attr("title"));
      }
      elementsData = $(this).find(".c-element");
    }

    $.each(elementsData, function(index, element) {
      var elementsText =
        "<tr><td class='text-center text' style='word-break:break-all;'>" +
        element.getAttribute("title") +
        "</td><td class='text-center' style='word-break:break-all;'>" +
        element.getAttribute("data-cvalue") +
        "</td><td class='text-center' style='word-break:break-all;'>" +
        element.getAttribute("data-avalue") +
        "</td></tr>";
      preview.find("tbody").append(elementsText);
    });
    if (preview.find(".text").html() == "null") {
      preview.find(".table").remove();
    }
    preview.bind("mousedown mouseup", function(event) {
      event.stopPropagation();
    });
    $(this).append(preview);
    e.stopPropagation();
  });
  $("html").click(function() {
    $(ele)
      .find(".previewPop")
      .remove();
  });
}

function setParentTimestamp(event) {
  var timestamp = $(event).val();
  $(event)
    .parents(".c-grid")
    .attr("data-timestamp", timestamp);
}

function showTip(str) {
  if ($("body").find("#tipAlert").length == 0) {
    var tip =
      '<div id="tipAlert" class="alert alert-success alert-dismissable fb" style="display:none; position: fixed; left:38%;top:38%;z-index:10;"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button></div>';
    $("body").append(tip);
  }
  $(document).ajaxStart(function() {
    $("#tipAlert").text(str);
    $("#tipAlert").show();
  });
  $(document).ajaxSuccess(function() {
    $("#tipAlert").text("完成");
    $("#tipAlert").fadeOut(1500);
  });
}

function createTree() {
  var tempGridTree = [];
  $.ajax({
    type: "POST",
    url: apiURL + "/CategorySvr/tree",
    dataType: "json",
    async: false,
    success: function(res) {
      var data = res.data;
      var tempGridArr = [];
      for (var i = 0; i < data.length; i++) {
        recTree(i, "");
      }
      function recTree(index, treePre) {
        var newOption = {};
        newOption.id = data[index].id;
        newOption.text = treePre + "▪ " + data[index].text;
        newOption.pId = data[index].pId;
        treePre = treePre + "#";
        if ($.inArray(data[index].id, tempGridArr) == -1) {
          tempGridArr.push(data[index].id);
          tempGridTree.push(newOption);
        } else {
          return false;
        }
        for (var j = 0; j < data.length; j++) {
          if (data[index].id == data[j].pId) {
            recTree(j, treePre);
          }
        }
      }
    }
  });
  return tempGridTree;
}
function createCasc(pId, tree) {
  var arr = [];
  $(tree).each(function() {
    if (this.pId == pId) {
      arr.push(this);
    }
  });
  return arr;
}
function createSelect2(element, tree, pId, echoID) {
  var echoID = echoID || 0;
  if (pId == undefined) {
  } else if (pId == "") {
    tree = "";
  } else {
    tree = createCasc(pId, tree);
  }
  element
    .select2({
      data: tree,
      templateResult: formatState,
      templateSelection: formatState,
      placeholder: "请选择"
    })
    .val(echoID)
    .trigger("change");
}
function formatState(state) {
  var newStr = state.text.replace(/#/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  var $state = $("<span>" + newStr + "</span>");
  return $state;
}

function erroPopover(cIputObj) {
  cIputObj = cIputObj ? cIputObj : $(".c-input");
  cIputObj.each(function(index, input) {
    var ele = $(input).find(".c-element");
    var popId = $(
      '[name="' +
        $(input)
          .find(".c-element:first")
          .attr("name") +
        '"]'
    )
      .eq(0)
      .parents(".c-grid:first")
      .attr("id");
    $("#p" + popId).remove();
    ele.blur(function() {
      showError(ele, popId);
    });
    ele.focus(function() {
      $("#p" + popId)
        .parents(".c-input:first")
        .removeClass("dangerStyle");
      $("#p" + popId).remove();
    });
  });
}

function showError(ele, popId) {
  var iNC = isNotCheck(ele);
  if (!iNC.res && iNC.res != undefined) {
    var qc_warning =
      '<div id="p' +
      popId +
      '" class="erroStyle"><div><h5 class="warning_qc popover-title"></h5></div></div>';
    $("#" + popId)
      .find(".c-input:first")
      .append($(qc_warning));
    $("#p" + popId)
      .find(".warning_qc")
      .html(iNC.formErrors);
    $("#p" + popId)
      .parents(".c-input:first")
      .addClass("dangerStyle");
  } else {
    $("#p" + popId)
      .parents(".c-input:first")
      .removeClass("dangerStyle");
    $("#p" + popId).remove();
  }
}

function infoPopover(name, infoStr) {
  var ele = $('[name="' + name + '"]').eq(0);
  var popId = ele.parents(".c-grid:first").attr("id");
  $("#I" + popId).remove();
  var qc_Info =
    '<div id="I' +
    popId +
    '"class="infoStyle"><div><div class="popover-title">' +
    infoStr +
    "</div></div></div>";
  ele.parents(".c-input:first").append($(qc_Info));
  setTimeout(function() {
    $("#I" + popId).fadeOut(1500, function() {
      $("#I" + popId).remove();
    });
  }, 5000);
  ele.focus(function() {
    $("#I" + popId).remove();
  });
}

function isNotCheck(ele, eleName) {
  var formErrors;
  var res;
  //var eleName = eleName ? '<h5>'+eleName+'</h5>' : '<h5>错误信息</h5>';
  var eleName = "";
  if (!$.isEmptyObject(ele.attr("required"))) {
    if (
      !$.isEmptyObject(ele.attr("type")) &&
      (ele.attr("type") == "text" || ele.attr("type") == "number")
    ) {
      if ($.isEmptyObject(ele.val())) {
        var errText = ele.attr("required-error");
        res = false;
        formErrors = errText == "" ? "该数据项必须填写" : errText;
      }
    } else if (ele.is("select")) {
      if (ele.val() == "" || ele.val() == "0") {
        var errText = ele.attr("required-error");
        res = false;
        formErrors = errText == "" ? "该数据项必须填写" : errText;
      }
    } else if (ele.is(":radio") || ele.is(":checkbox")) {
      var checkedValue = $(
        'input[name="' + ele.attr("name") + '"]:checked'
      ).val();
      if (!checkedValue) {
        var errText = ele.attr("required-error");
        res = false;
        formErrors = errText == "" ? "至少选中一项" : errText;
      }
    }
  }
  if (!$.isEmptyObject(ele.attr("pattern")) && ele.val() != "") {
    var reg = new RegExp(ele.attr("pattern"));
    if (!reg.test(ele.val())) {
      var errText = ele.attr("pattern-error");
      res = false;
      formErrors = errText == "" ? "数据格式有误" : errText;
    }
  }
  if (!$.isEmptyObject(ele.attr("max"))) {
    if ($.isNumeric(ele.val())) {
      if (!$.isEmptyObject(ele.attr("data-maxEqual"))) {
        if (parseFloat(ele.val()) > parseFloat(ele.attr("max"))) {
          res = false;
          if (!$.isEmptyObject(ele.attr("data-maxInfo"))) {
            formErrors = ele.attr("data-maxInfo");
          } else {
            formErrors = "不能大于等于" + ele.attr("max");
          }
        }
      } else {
        if (parseFloat(ele.val()) >= parseFloat(ele.attr("max"))) {
          res = false;
          if (!$.isEmptyObject(ele.attr("data-maxInfo"))) {
            formErrors = ele.attr("data-maxInfo");
          } else {
            formErrors = "不能大于" + ele.attr("max");
          }
        }
      }
    }
  }
  if (!$.isEmptyObject(ele.attr("min"))) {
    if ($.isNumeric(ele.val())) {
      if (!$.isEmptyObject(ele.attr("data-minEqual"))) {
        if (parseFloat(ele.val()) < parseFloat(ele.attr("min"))) {
          res = false;
          if (!$.isEmptyObject(ele.attr("data-minInfo"))) {
            formErrors = ele.attr("data-minInfo");
          } else {
            formErrors = "不能小于等于" + parseFloat(ele.attr("min"));
          }
        }
      } else {
        if (parseFloat(ele.val()) <= parseFloat(ele.attr("min"))) {
          res = false;
          if (!$.isEmptyObject(ele.attr("data-minInfo"))) {
            formErrors = ele.attr("data-minInfo");
          } else {
            formErrors = "不能小于" + parseFloat(ele.attr("min"));
          }
        }
      }
    }
  }
  if (!$.isEmptyObject(ele.attr("minlength"))) {
    if (ele.val().length < parseInt(ele.attr("minlength"))) {
      res = false;
      formErrors = "字符数不能小于" + ele.attr("minlength");
    }
  }
  if (ele.attr("data-floatlimit") && ele.attr("data-floatlimit") != 0) {
    var floatLimit = parseInt(ele.attr("data-floatlimit"));
    var floatReg = new RegExp("^[+-]?\\d*\\.?\\d{" + floatLimit + "}$");
    if (!floatReg.test(ele.val())) {
      res = false;
      formErrors = "请保留" + floatLimit + "位小数";
    }
  }
  return {
    res: res,
    formErrors: formErrors
  };
}

function checkData(isCDE) {
  var res = true;
  var formErrors = [];
  $(".c-input").each(function(index, input) {
    if (
      $(input)
        .find(".c-element:first")
        .attr("disabled") == "disabled" ||
      $(input)
        .parents("[data-hide=2]")
        .css("display") == "none" ||
      $(input)
        .parents("[data-hide=1]")
        .css("display") == "none"
    )
      return true;
    var ele = $(input).find(".c-element:first");
    var eleName = $(input)
      .prev()
      .html();
    if (isNotCheck(ele, eleName).res != undefined) {
      formErrors.push(isNotCheck(ele, eleName).formErrors);
      res = isNotCheck(ele, eleName).res;
    }
    var popId = $(
      '[name="' +
        $(input)
          .find(".c-element:first")
          .attr("name") +
        '"]'
    )
      .eq(0)
      .parents(".c-grid:first")
      .attr("id");
    $("#p" + popId).remove();
    showError(ele, popId);
  });

  if (res) {
    if (arguments.length > 0) toastr.warning("验证成功，请可导出给EDC");
  } else {
    var str = "错误信息:</br>";
    for (var i = 0; i < formErrors.length; i++) {
      str += i + "." + formErrors[i] + "</br>";
    }
    if (arguments.length > 0) toastr.warning(str);
    return false;
  }
  return res;
}

var WdateElements;
function onloadIng() {
  //自动计算初始化
  var dataAuto = $("[data-auto]");
  if (dataAuto.length > 0) {
    dataAuto.each(function() {
      var _this = this;
      var fomular = JSON.parse($(this).attr("data-formula"));
      $(fomular.SYMBOLS).each(function() {
        if (
          $.inArray($('[name="' + this.eid + '"]').attr("data-type"), [
            "S1",
            "S",
            "BY",
            "N",
            "D",
            "T",
            "DT",
            "TA"
          ]) > -1
        ) {
          $('[name="' + this.eid + '"]')[0].addEventListener(
            "input",
            function() {
              zq_bindFormula(_this, $(_this).attr("data-formula"));
            }
          );
        } else {
          $('[name="' + this.eid + '"]')
            .parent()
            .click(function() {
              zq_bindFormula(_this, $(_this).attr("data-formula"));
            });
        }
      });
    });
  }
  //03自增初始化 1显隐初始化 2必填标识初始化 3设置默认值初始化  4H5刻度尺初始化 5报错信息初始化 6页面radiocheck点击过的回显 7radioCheck初始化 8UK选项点击事件
  initRequire();
  zq_rangeShowValue(".c-input-range");
  setDValue();
  clearInputDataChecked();
  onloadInc();
  initHide();
  initHtml();
  erroPopover();
  setUKEvent();
  if (!isPc()) {
    $(".Wdate").attr("readonly", "readonly");
  }
}

function initHide() {
  $("[data-hide]").each(function() {
    $(this)
      .find(".c-element")
      .attr("disabled", "disabled");
  });
}

function initRequire() {
  $(".star").remove();
  var required = $("[required]").parents(".c-grid");
  if (required.length > 0) {
    $("body").append(
      '<div style="display: none"><span id="star" class="stars">&nbsp;*&nbsp;</span></div>'
    );
    required.each(function() {
      if ($(this).find(".c-grid").length != 0) return true;
      var star = $("#star")
        .clone()
        .removeAttr("id");
      var requireObj = $(this).find(".c-element");
      var isRequire = requireObj.attr("required");
      var requireAdr = requireObj.attr("data-required");
      var splitContent = $(
        '[data-c-value="' + $(this).attr("data-c-value") + '"]'
      )
        .eq(0)
        .children(".c-content");
      if (
        $('[data-c-value="' + $(this).attr("data-c-value") + '"]')
          .eq(0)
          .attr("data-split") == "Y"
      ) {
        if (
          isRequire == "required" &&
          requireAdr == "left" &&
          splitContent.find(".stars").length == 0
        ) {
          splitContent.prepend(star);
        } else if (
          isRequire == "required" &&
          splitContent.find(".stars").length == 0
        ) {
          splitContent.append(star);
        }
      } else if (requireObj.attr("data-type") == "ADR") {
        var adrGrid = $(this)
          .siblings(".addr-grid")
          .find(".addr-gridtitle");
        if (isRequire == "required" && adrGrid.find(".stars").length == 0)
          adrGrid.prepend(star);
      } else {
        if (isRequire == "required" && requireAdr == "right") {
          var tipObj = $(this).find(".c-tip");
          if (
            tipObj.length == 0 ||
            tipObj.html() == "" ||
            tipObj.hasClass("col-sm-0")
          ) {
            star.addClass("appendStar");
            $(this)
              .find(".c-input")
              .append(star);
          } else {
            $(this)
              .find(".c-tip")
              .append(star);
          }
        } else if (isRequire == "required") {
          $(this)
            .find(".c-title")
            .prepend(star);
        }
      }
    });
  }
}

function clearInputDataChecked() {
  $('input[data-checked="true"]').attr("data-checked", "false");
}

function filterStr(editorBody) {
  var table_box = editorBody.find(".table_flag");
  table_box.each(function() {
    var element = $(this).find(".c-element");
    var tabName = $(this).attr("tabName");
    var rowNum = $(this).attr("rowNum");
    element.attr("tabname", tabName);
    element.attr("rownum", rowNum);
  });
  removeGridClass(editorBody);
  editorBody.find("*[data-hide]").hide();
  editorBody
    .find("*[data-disabled]")
    .find(".c-element")
    .attr("disabled", "disabled");
  editorBody.find("#jsLoad").remove();
  editorBody.find(".c-grid").removeAttr("onmouseover");
  editorBody.find(".c-grid").removeAttr("onclick");
  return editorBody.html();
}

function initHtml() {
  var tempElements = $("body").find(".c-element");
  for (var i = 0; i < tempElements.length; i++) {
    var tempElement = tempElements.eq(i);
    if (tempElement.is("select")) {
      if (tempElement.val() != "") {
        tempElement.find("#e2v_" + tempElement.val()).change();
      }
    }

    if (tempElement.is(":checkbox") || tempElement.is(":radio")) {
      if (tempElement.prop("checked")) {
        tempElement.change();
      }
    }
  }
}

function onloadInc() {
  var IncLength = $(".selfCopyGridDIV").length;
  if (IncLength > 0) {
    for (var i = 0; i < IncLength; i++) {
      var flagDiv = $(".selfCopyGridDIV").eq(i);
      var copyContent = flagDiv.parents(".c-grid:first").clone();
      var selfCopyGridDIV = copyContent.find(".selfCopyGridDIV");
      if (selfCopyGridDIV.length > 1) {
        copyContent
          .find(".selfCopyGridDIV")
          .eq(selfCopyGridDIV.length - 1)
          .remove();
      } else {
        copyContent
          .find(".selfCopyGridDIV")
          .eq(0)
          .remove();
      }
      copyContent.find(".c-content:first").removeAttr("id");
      copyContent.find(".c-content input").removeAttr("disabled");
      flagDiv.attr("data-content", copyContent[0].outerHTML);
    }
  }
}

function successInfo(str) {
  $(".alert-warning").hide();
  $("#success").html(str);
  $(".alert-success").show();
  setTimeout(function() {
    $(".alert-success").fadeOut();
  }, 1000);
}

function warnInfo(str) {
  $(".alert-success").hide();
  $("#warning").html(str);
  $(".alert-warning").show();
  setTimeout(function() {
    $(".alert-warning").fadeOut();
  }, 1000);
}

function createRangeScript(name, min, max, step) {
  var divisions = max - min < 10 ? max - min : 10;
  var space = parseFloat((max - min) / divisions);
  var scaleArr = [];
  for (var i = 1, len = divisions; i < len; i++) {
    scaleArr.push(Math.round(min + space * i));
  }
  scaleArr.unshift(min);
  scaleArr.push(max);
  var script = $("<script>");
  var code =
    ";(function(){var broNode = $(\".single-slider[name='" +
    name +
    "']\").next('.slider-container');if ( broNode.length == 0 ) {createjRange();}else{broNode.remove();createjRange();}function createjRange(){$(\".single-slider[name='" +
    name +
    "']\").jRange({from: " +
    min +
    ",to: " +
    max +
    ",step: " +
    step +
    ",scale: [" +
    scaleArr +
    "],format: '%s',width: '90%',showLabels: true,showScale: true});}})();";
  script.html(code);
  return script;
}

function createSelectScript(name) {
  var script = $("<script>");
  var code =
    ";(function(){var selectNode = $(\".c-tpl-select[name='" +
    name +
    "']\").next('.select2');if ( selectNode.length == 0 ) {$(\".c-tpl-select[name='" +
    name +
    "']\").select2();}else{selectNode.remove();$(\".c-tpl-select[name='" +
    name +
    "']\").removeClass('select2-hidden-accessible');$(\".c-tpl-select[name='" +
    name +
    "']\").removeAttr('tabindex');$(\".c-tpl-select[name='" +
    name +
    "']\").removeAttr('aria-hidden');$(\".c-tpl-select[name='" +
    name +
    "']\").select2();}})();";
  script.html(code);
  return script;
}

function tableClick(obj) {
  $(".viewNode").css("background", "");
  $(".c-name").removeClass("tdActive");
  $(obj)
    .parents(".viewNode")
    .css("background", "#ffffff");
  $(obj)
    .parents(".c-name")
    .addClass("tdActive");
}

(function($, doc) {
  "use strict";
  $.fn.extend({
    tmsDrag: function(el) {
      var me = this;
      var maskDiv = $(
        '<div class="drag-mask" style="position:absolute; width:90%; height:100%; top:0; left:0; z-index:9999;"></div>'
      );
      $(this)
        .children(el)
        .on("mousedown.tms", function(e) {
          var mouseX = e.pageX,
            mouseY = e.pageY,
            offsetX = parseFloat($(me).css("left")),
            offsetY = parseFloat($(me).css("top")),
            x,
            y;
          $(me).append(maskDiv);

          $(doc).on("mousemove.tms", function(ev) {
            ev.preventDefault();
            x = offsetX + ev.pageX - mouseX;
            y = offsetY + ev.pageY - mouseY;
            $(me).css({
              left: x + "px",
              top: y + "px"
            });
          });

          $(doc).on("mouseup.tms", function(ev) {
            $(doc).off("mousemove.tms mouseup.tms");
            $(me)
              .children(".drag-mask")
              .remove();
          });
        });
    }
  });
})(jQuery, window.document);

function clearDragEvent() {
  $("#modalWin").on("click", clearEvent);
  $("#closeBtn").on("click", clearEvent);
  function clearEvent() {
    $("#dragCon").off("mousedown.tms");
  }
}

function CurentTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hh = now.getHours();
  var mm = now.getMinutes();
  var clock = year + "-";
  if (month < 10) clock += "0";
  clock += month + "-";
  if (day < 10) clock += "0";
  clock += day + " ";
  if (hh < 10) clock += "0";
  clock += hh + ":";
  if (mm < 10) clock += "0";
  clock += mm;
  return clock;
}

function eachPush(el) {
  return {
    voption_id: el.attr("data-vid"),
    avalue: el.attr("data-avalue"),
    cvalue: el.attr("data-cvalue"),
    status: 0
  };
}

//UK
function _addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != "function") {
    window.onload = func;
  } else {
    window.onload = function() {
      oldonload();
      func();
    };
  }
}

_addLoadEvent(addUkBtn);

function addUkBtn() {
  $("#_my97DP iframe").load(function() {
    var my97Document = $(this).contents();
    var ukHTML =
      '<div class="UK_con" style="display:none;"><label class="uk_btn" id="ukDate"><input type="checkbox"/>UK日</label><label class="uk_btn" id="ukMonth"><input type="checkbox"/>UK月</label></div>';
    my97Document.find("#dpControl").before(ukHTML);

    $(document).on("focus", ".Wdate", function() {
      if ($(this).hasClass("c-element")) {
        WdateElements = $(this);
      } else {
        WdateElements = $(this).siblings(".c-element");
      }
    });
  });
}

function isPc() {
  var userAgentInfo = navigator.userAgent;
  var Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod"
  ];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

if (!isPc()) {
  (function(doc, win) {
    var docEl = doc.documentElement,
      resizeEvt =
        "orientationchange" in window ? "orientationchange" : "resize",
      recalc = function() {
        var clientWidth = docEl.clientWidth;
        if (!clientWidth) return;
        docEl.style.fontSize = 20 * (clientWidth / 320) + "px";
      };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener("DOMContentLoaded", recalc, false);
  })(document, window);
}

function setDValue() {
  var dvalues = $("div[data-dvalue]");
  var set = true;
  if ($("#cbShowDValue") && $("#cbShowDValue").prop("checked")) {
    set = false;
  }

  for (var i = 0; i < dvalues.length; i++) {
    var input = $(dvalues[i]);
    if (input.find(".c-tpl-select").length > 0) {
      if (set) {
        input
          .find(".c-tpl-select")
          .val(input.attr("data-dvalue"))
          .trigger("change");
      } else {
        input
          .find(".c-tpl-select")
          .val("")
          .trigger("change");
      }
    } else if (input.find(".c-tpl-radio, .c-tpl-checkbox").length > 0) {
      if (set) {
        input
          .find("input[value=" + input.attr("data-dvalue") + "]")
          .prop("checked", "true");
      } else {
        input.find("input").prop("checked", false);
      }
    }
  }
}

function setUKEvent() {
  $(".Wdate").on("click", function() {
    var dateFormat = $(this).attr("data-dateformat");
    var ukCon = $("#_my97DP iframe")
      .contents()
      .find(".UK_con");
    ukCon.find(".uk_btn input").attr("checked", false);
    if ($(this).attr("data-ukexist") == "true") {
      if (dateFormat == "yyyy-MM-dd" || dateFormat == "yyyy年MM月dd日") {
        ukCon.find("#ukDate").css("visibility", "visible");
      }
      if (dateFormat == "yyyy-MM" || dateFormat == "yyyy年MM月") {
        ukCon.find("#ukDate").css("visibility", "hidden");
      }
      ukCon.css("display", "block");
      $("#_my97DP iframe").css("height", "225px");
    } else {
      ukCon.css("display", "none");
    }
  });
}

function getHideData() {
  var eleArray = [];
  var valueArray = [];
  var gridArray = [];
  for (var i = 0, j = $(".c-grid").length; i < j; i++) {
    var item = $(".c-grid").eq(i);
    if (
      item.find(".c-grid").length == 0 &&
      item.find(".c-element").length > 0
    ) {
      var showArr = item.find(".c-input").attr("data-show-array");
      if (showArr != undefined && showArr != "") {
        showArr = eval(showArr);
        for (var a = 0, b = showArr.length; a < b; a++) {
          eleArray.push(item.attr("data-c-value"));
          valueArray.push(showArr[a][0]);
          gridArray.push(showArr[a][1]);
        }
      }
    }
  }
  return [eleArray, valueArray, gridArray];
}
function getMedSelect2(name) {
  var keyword = $(".medname[name='" + name + "']").attr("data-keyword") || "";
  $.ajax({
    url: apiURL + "/HospitalSvr/getMedicines",
    type: "post",
    dataType: "json",
    data: { pagesize: 2000 }
  }).done(res => {
    var medarr = res.data;
    localStorage.removeItem("medarr");
    localStorage.setItem("medarr", JSON.stringify(medarr));
  });
  var selectNode = $(".medname[name='" + name + "']").next(".select2");
  if (selectNode.length == 0) {
    $(".medname[name='" + name + "']").select2({
      placeholder: "请选择",
      width: "100%",
      ajax: {
        url: apiURL + "/HospitalSvr/getMedicines",
        method: "POST",
        data: s2_params,
        processResults: s2_results,
        dataType: "json",
        delay: 680
      },
      placeholder: "请选择药品"
    });
  } else {
    selectNode.remove();
    $(".medname[name='" + name + "']").removeClass("select2-hidden-accessible");
    $(".medname[name='" + name + "']").removeAttr("tabindex");
    $(".medname[name='" + name + "']").removeAttr("aria-hidden");
    $(".medname[name='" + name + "']").select2({
      placeholder: "请选择",
      width: "100%",
      ajax: {
        url: apiURL + "/HospitalSvr/getMedicines",
        method: "POST",
        data: s2_params,
        processResults: s2_results,
        dataType: "json",
        delay: 680
      },
      placeholder: "请选择药品"
    });
  }

  $(".medname[name='" + name + "']").on("select2:open", function(e) {
    $(".select2-search__field").attr("value", keyword);
    $(".select2-search__field").trigger("input", keyword);
  });
  $(".medname[name='" + name + "']").on("change", function(e) {
    id = $(".medname[name='" + name + "']").val() - 1;
    var medarr = JSON.parse(localStorage.getItem("medarr"));
    name.replace("", "");
    $(
      "input[name='" +
        name.replace("JH10.00.017.96.001", "JH10.00.017.96.002") +
        "']"
    )[0]
      ? ($(
          "input[name='" +
            name.replace("JH10.00.017.96.001", "JH10.00.017.96.002") +
            "']"
        )[0].value =
          medarr[id].ROUTE)
      : 1;
    $(
      "input[name='" +
        name.replace("JH10.00.017.96.001", "JH10.00.017.96.003") +
        "']"
    )[0]
      ? ($(
          "input[name='" +
            name.replace("JH10.00.017.96.001", "JH10.00.017.96.003") +
            "']"
        )[0].value =
          medarr[id].STRENGTH)
      : 1;
    $(
      "input[name='" +
        name.replace("JH10.00.017.96.001", "JH10.00.017.96.004") +
        "']"
    )[0]
      ? ($(
          "input[name='" +
            name.replace("JH10.00.017.96.001", "JH10.00.017.96.004") +
            "']"
        )[0].value =
          medarr[id].FREQUENCY)
      : 1;
  });
}
function s2_params(params) {
  var page = params.page ? params.page : 1;
  return { kw: params.term, p: page, pagesize: 20 };
}
function s2_results(res, params) {
  params.page = params.page || 1;
  var items = [];
  for (var i = 0; i < res.data.length; i++) {
    var row = res.data[i];
    items.push({
      id: row.ID,
      text: "[" + row.ID + "]" + row.NAME,
      locked: true
    });
  }
  var pageCount = Math.ceil(res.rowCount / 20);
  return { results: items, pagination: { more: params.page < pageCount } };
}
function getSystemTime(formElementName) {
  var grid = $("input[name='" + formElementName + "']");
  if (grid.val() == "") {
    var currentTime = edc_zq_get_url_param("currentTime");
    grid.val(currentTime);
  }
}
