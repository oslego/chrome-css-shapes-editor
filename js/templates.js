(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['property'] = template({"1":function(depth0,helpers,partials,data) {
  return " disabled ";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<li id=\""
    + escapeExpression(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"property","hash":{},"data":data}) : helper)))
    + "\">\n  <span class=\"property\">"
    + escapeExpression(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"property","hash":{},"data":data}) : helper)))
    + "</span>:\n  <div class=\"js-action js-action--create ico\" title=\"Create new shape\">\n    <nav>\n      <a data-shape=\"circle()\">circle</a>\n      <a data-shape=\"ellipse()\">ellipse</a>\n      <a data-shape=\"polygon()\">polygon</a>\n    </nav>\n  </div><div class=\"js-action js-action--edit ico\" title=\"Edit shape\" ";
  stack1 = helpers.unless.call(depth0, (depth0 != null ? depth0.editable : depth0), {"name":"unless","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "></div>\n  <span class=\"value\">"
    + escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"value","hash":{},"data":data}) : helper)))
    + "</span>;\n</li>\n";
},"useData":true});
})();