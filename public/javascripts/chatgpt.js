$(document).ready(function () {
    //Sample Questions
    $("[id^=ques]").click(function (event) {
        $("#query").val(event.target.innerText);
        $("#query-submit").trigger('click');
        $("#initImage").hide();
    })

    //About Page
    $("#about").hide();

    // Query box.
    $("#query").keydown(function (e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            $("#query-submit").trigger('click');
        }
    });

    $("#aboutBtn").click(function (e) {
        if(e.target.innerText=="About Us"){
            $("#chat-page").hide();
            $("#about").show();
            $("#aboutBtn h6").text("Home")
        }
        else {
            $("#chat-page").show();
            $("#about").hide();
            $("#aboutBtn h6").text("About Us")
        }
    })

    // Query submit button.
    $('#query-submit').click(function (event) {
        let $chatPlaceholder = $("#message-container");
        let $loader = $(".loader");
        let $query = $("#query");
        let query = $query.val();
        let assistantId = $("#assistant-id").val();
        $("#sample-questions").hide();
        //display user message
        $chatPlaceholder.append("<div class='conversation user-conversation'><span class='avatar user-avatar'></span><span class='message'>"+ query +"</span></div>");
        //scroll to last message
        $("#message-container").children().get(($("#message-container").children().length-1)).scrollIntoView({behavior: 'smooth'});
        var settings = {
            "url": "/chatgpt/query",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "query": query,
                "assistantId": assistantId
            }),
            "beforeSend": function (jqXHR) {
                $loader.css('display', 'flex');
                $query.prop("disabled", true);
                event.currentTarget.disabled = true;
            },
            "error": function (exception) {
                alert(exception);
            },
            "complete": function () {
                $query.val('');
                $loader.hide();
                $query.prop("disabled", false);
                event.currentTarget.disabled = false;
            }
        };

        $.ajax(settings).done(function (response) {
            let responseText = response.text.replaceAll(/\[\d+\]/g, '');
            let citations = response.citations;
            //display bot message
            $chatPlaceholder.append("<div class='conversation bot-conversation'><span class='avatar bot-avatar'><img src = '/images/ihs_logo.png' alt='ign_bot'/></span><span class='message'>"+ responseText +"</span><span class='citations'> </span></div>");
            // scroll to last message
            $("#message-container").children().get(($("#message-container").children().length-1)).scrollIntoView({behavior: 'smooth'});
        });
    });
});
