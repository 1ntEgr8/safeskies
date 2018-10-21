$(function(){
  var ticket_ref = $("#ticket_ref").text();
  var socket = io.connect("https://safe-skies-mcarmonagonzalez.c9users.io",{transportOptions: {
    polling: {
      extraHeaders: {
        'user-type': 'admin',
        'ticket-ref':ticket_ref
      }
    }
  }});
  var input = $("input");
  $(".send-button").on('click',function(){
        socket.emit('new_message',{message: { user_message: "", admin_message: input.val().toString()}});
    });
  $(".cancel-button").on('click',function(){
      socket.emit('new_message',{ message:  "closing" });
      window.location = "https://safe-skies-mcarmonagonzalez.c9users.io/admin/dashboard";
  });
  $("input").keydown(function (e){
    console.log(e.keyCode);
    if(e.keyCode == 13){
        socket.emit('new_message',{message: { user_message: "", admin_message: input.val().toString()}});
    }
  });
  
  socket.on('new_message',function(data){
    if(data.ticket_ref === ticket_ref){
      if(data.message !== "closing"){
        $(".cell").append("<span class='list-group-item'><span id='author-name'>"+data.username+":</span> "+data.message.admin_message+"</span>")
        updateScroll();
        input.val("");
      }
    }
  });
}
);

function updateScroll(){
    var element = document.getElementById("chat");
    element.scrollTop = element.scrollHeight;
}




