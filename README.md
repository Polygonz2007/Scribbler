# Scribbler

An app where you can draw togheter with people!! Woohoo!

## How it works
Pages are a fixed size that you can zoom and pan over, and draw. You can go between multiple pages. You can choose different burshes and stuff
It uses websockets to send the changes that happen to all clients. Server handles that stuff happens in the same order for all clients.



Client opens page -> Connect to websocket -> Allow drawing and setting username and stuff

Types of actions:
New board (width, height)
Stroke (start, end, size, color, texture)
Delete board (board_id)