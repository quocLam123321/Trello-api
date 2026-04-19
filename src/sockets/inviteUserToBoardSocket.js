
export const inviteUserToBoardSocket = (socket) => {
  // lắng nghe sự kiện mà client emit lên > FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', invitation => {
    // cách làm nhanh và đơn giản nhất: emit ngược lại một sự kiện về cho mọi client khác (ngoại trừ chính cái thằng gửi req lên), rồi để bên FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
