$(function(){
  var socket = io.connect("https://safe-skies-mcarmonagonzalez.c9users.io",{transportOptions: {
    polling: {
      extraHeaders: {
        'user-type': 'admin_dashboard'
      }
    }
  }});
  socket.on('new_message',function(data){
    console.log(data.message);
    if(data.message ==="new_ticket"){
       $("tbody").append("<tr><td>"+data.ticket.ref+"</td><td>"+data.ticket.poster.first_name + " "  + data.ticket.poster.last_name+"</td><td>"+data.ticket.description+"</td><td>"+data.ticket.poster.seat+"</td><td><a href='/admin/dashboard/ticket/chat/"+data.ticket._id+"' class='btn btn-outline-primary'>Join Client</a></td><td><form action='/admin/dashboard/ticket/chat/"+data.ticket._id+"?_method=delete' method='POST'><input type='submit'  class='btn btn-outline-primary' value='Delete Ticket'></form></td></tr>")
    }
  });
}


);




