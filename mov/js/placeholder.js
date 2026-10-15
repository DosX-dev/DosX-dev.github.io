/*********************************************

	jQuery extended placeholder plugin.
	Text, password, and textarea fields supported.
	Version: 0.9.2
	Author: Sergey Estrin
	Site: http://g-rain-design.ru/en/jquery/placeholder/
	Released under the MIT License.

*********************************************/

(function($) {

	$.fn.placeholder_clear = function() {
	
		var arPlaceholders = $(this).data("placeholders");

		$(this).find("input[placeholder], textarea[placeholder]").each(function(){
		
			var field_name = $(this).attr("name");

			if(field_name in arPlaceholders)
				if($(this).val()==arPlaceholders[field_name]) 
					$(this).val("");
		
		});

	};


	$.fn.placeholder_focus = function(caption) {
	
		if(this.val()==caption) {
			this.val("");
			this.removeClass($.fn.placeholder_options.placeholded_class);
		}
	
	};

	$.fn.placeholder_blur = function(caption) {
	
		if(this.val()=="") {
			this.val(caption);
			this.addClass($.fn.placeholder_options.placeholded_class);
		}
	
	};

	$.fn.placeholder_password_focus = function(caption) {

		if(!this.is(':password')) {
	
			if(this.val()==caption) {
				var new_input = $('<input type="password" name="' + this.attr('name') + '" value="" />');
				new_input.attr("placeholder",caption);
				new_input.attr("class",this.attr("class"));
				new_input.removeClass("pie_first-child"); // PIE compatibility
				new_input.removeClass($.fn.placeholder_options.placeholded_class);
				new_input.blur(function(){	new_input.placeholder_password_blur(caption); });
				this.replaceWith(new_input);
				new_input.focus();
				new_input.focus();
			}
			
		}
	
	};

	$.fn.placeholder_password_blur = function(caption) {

		if(this.is(':password')) {
	
			if(this.val()=="") {
				var new_input = $('<input type="text" name="' + this.attr('name') + '" value="' + caption + '" />');
				new_input.attr("placeholder",caption);
				new_input.attr("class",this.attr("class"));
				new_input.removeClass("pie_first-child"); // PIE compatibility
				new_input.addClass($.fn.placeholder_options.placeholded_class);
				new_input.focus(function(){	new_input.placeholder_password_focus(caption); });
				this.replaceWith(new_input);
			}
			
		}
	
	};

	$.fn.placeholder = function(opts) {
	
		if(opts!=null) 
			for(var index in opts) 
				if($.fn.placeholder_options[index]!=null)
					$.fn.placeholder_options[index]=opts[index];

		var elements = this;

		if($.fn.placeholder_options.container) {
			$($.fn.placeholder_options.container_selector).each(function(){
				var caption = $(this).find($.fn.placeholder_options.caption_selector+":first").html();
				var input = $(this).find("input:text:first, input:password:first, textarea:first");
				if(caption && input[0]) {
					input.attr("placeholder",caption);
					elements.push(input);
				}
			});
		}
	
		elements.each(function() {
    	
    		var input = $(this);
    	
    		var caption = $.fn.placeholder_options.caption_prefix + input.attr("placeholder") + $.fn.placeholder_options.caption_postfix;

    		var pform = input.parents('form:first');
    		var pdata = pform.data("placeholders");
    		if(!(pdata instanceof Array)) pdata = [];
    		//pdata.push({ name: input.attr("name"), caption: caption });
    		pdata[input.attr("name")] = caption;
    		
    		pform.data("placeholders",pdata);
    		pform.unbind("submit",$.fn.placeholder_clear).bind("submit",$.fn.placeholder_clear);
    	
    		if(input.is(':password'))
    		{

    			input.placeholder_password_blur(caption);
    			input.focus(function(){	input.placeholder_password_focus(caption); });
    			input.blur(function(){ input.placeholder_password_blur(caption); });
    			
    		} else {
    	
    			input.placeholder_blur(caption);
    			input.focus(function(){	input.placeholder_focus(caption); });
    			input.blur(function(){ input.placeholder_blur(caption);	});
    			
    		}

    	});
	
	};

	// default options

	$.fn.placeholder_options = {
    	placeholded_class: "placeholded",
    	caption_prefix: "",
    	caption_postfix: "",
    	container: false,
    	container_selector: ".form-field-container",
    	caption_selector: ".form-field-caption"
    };
	

})(jQuery);


$().ready(function(){

	$(":input[placeholder], textarea[placeholder]").placeholder();	
	//$(":input[placeholder], textarea[placeholder]").placeholder({container: true});
	
});