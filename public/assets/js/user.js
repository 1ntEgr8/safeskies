$(function(){
  var ticket_ref = $("#ticket_ref").text().toString();
  var socket = io.connect("https://safe-skies-mcarmonagonzalez.c9users.io",{transportOptions: {
    polling: {
      extraHeaders: {
        'user-type': 'user',
        'ticket-ref':ticket_ref
      }
    }
  }});
  socket.emit('new_message',{message: "new_ticket"});
  var input = $("input");
  $("button").on('click',function(){
        socket.emit('new_message',{message: { user_message: input.val().toString(), admin_message: ""}});
    });
    $("input").keydown(function (e){
      if(e.keyCode == 13){
          socket.emit('new_message',{message: { user_message: input.val().toString(), admin_message: ""}});
      }
    });
  socket.on('new_message',function(data){
    if(data.ticket_ref === ticket_ref){
      console.log("Message",data.message)
      if(data.message === "closing"){
        $(".cell").append("<span class='list-group-item'><span id='author-name'>Flight Attendant has ended the chat</span></span>")
        window.location = "https://safe-skies-mcarmonagonzalez.c9users.io/dashboard/ticket/completed";
        
      }else{
        
        //document.getElementsByTagName("input")[0].removeAttribute('disabled');
        $(".cell").append("<span class='list-group-item'><span id='author-name'>"+data.username+":</span> "+data.message.user_message+"</span>")
        input.val("");
        updateScroll();
      }
    }
  });


});
function updateScroll(){
    var element = document.getElementById("chat");
    element.scrollTop = element.scrollHeight;
}



