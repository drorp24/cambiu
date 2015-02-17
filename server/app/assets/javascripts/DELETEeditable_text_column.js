 
var admin = {
 
  init: function(){
    admin.set_admin_editable_events();
  },
 
  set_admin_editable_events: function(){
    $(document).on("keypress", ".admin-editable", function(e){
      if ( e.keyCode==27 )
        $( e.currentTarget ).hide();
 
      if ( e.keyCode==13 ){
        var path        = $( e.currentTarget ).attr("data-path");
        var attr        = $( e.currentTarget ).attr("data-attr");
        var resource_id = $( e.currentTarget ).attr("data-resource-id");
        var val         = $( e.currentTarget ).val();
 
        val = $.trim(val);
        if (val.length==0)
          val = "&nbsp;";
 
        $("div#"+$( e.currentTarget ).attr("id")).html(val);
        $( e.currentTarget ).hide();
 
        var payload = {};
        resource_class = path.slice(0,-1); // e.g. path = meters, resource_class = meter
        payload[resource_class] = {};
        payload[resource_class][attr] = val;
 
        var url =  "/admin/"+path+"/"+resource_id;
        
        //
        // activeadmin treats the ajax call as POST /admin/exchanges/42/rates/batch_action instead
        // Doing the same ajax call from the firebug console works just fine: $.ajax({url: "/admin/rates/1", type: "PATCH", data: {rate: {buy_currency: "XYZ"}}})
        //
        $.ajax({url: url, type: "PATCH", data: payload}).done(function(result){
          console.log("dror");
        });
      }
    });
 
    $(document).on("blur", ".admin-editable", function(e){
      $( e.currentTarget ).hide();
    });
  },
 
  editable_text_column_do: function(el){
    var input = "input#"+$(el).attr("id");
 
    $(input).width( $(el).width()+4 ).height( $(el).height()+4 );
    $(input).css({top: ( $(el).offset().top-2 ), left: ( $(el).offset().left-2 ), position:'absolute'});
 
    val = $.trim( $(el).html() );
    if (val=="&nbsp;")
      val = "";
      
    $(input).val( val );
    $(input).show();
    $(input).focus();
  }
};
 
$( document ).ready(function() {
  admin.init();
});