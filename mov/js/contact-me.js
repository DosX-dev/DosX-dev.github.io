$(document).ready(function() {

    $("#contact-form [type='submit']").click(function(e) {
        e.preventDefault();
        
        // Get input field values of the contact form
        var user_name       = $('input[name=name]').val();
        var user_email      = $('input[name=email-address]').val();
        var user_subject    = $('input[name=subject]').val();
        var user_message    = $('textarea[name=message]').val();
       
        // Datadata to be sent to server
        post_data = {'userName':user_name, 'userEmail':user_email, 'userSubject':user_subject, 'userMessage':user_message};
       
        // Ajax post data to server
        $.post('php/contact-me.php', post_data, function(response){  
           
            // Load json data from server and output message    
            if(response.type == 'error') {

                output = '<div class="error-message"><p>'+response.text+'</p></div>';
                
            } else {
           
                output = '<div class="success-message"><p>'+response.text+'</p></div>';
               
                // After, all the fields are reseted
                $('#contact-form input').val('');
                $('#contact-form textarea').val('');
                
            }
           
            $("#answer").hide().html(output).fadeIn();

        }, 'json');

    });
   
    // Reset and hide all messages on .keyup()
    $("#contact-form input, #contact-form textarea").keyup(function() {
        $("#answer").fadeOut();
    });
   
});