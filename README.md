# WebRTC-Signaling-Server
A sample nodeJS based signaling server designed for usage with WebRTC based mobile/browser clients to establish a 1-1 video session

Steps to deploy:
1) Install nodeJS
2) Go to root folder and enter "npm install" to install all node modules
3) Start the server using "node app.js"

This server is created just for a demo and works only when hosted on a LAN. It takes care of handshake between two WebRTC clients, thereby facilitating exchange of media between them.

A compatible android client can be found at https://github.com/Androidhacks7/AppRTC-Android

PS: The client needs to first register with a name by hitting port 8080. Port 7777 is used for exchange of socket messages
