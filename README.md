# WebTechMiniProject
Group 005 


To get the app running, follow the steps:


1. cd to project directory, enter the command:   
  $ bower install
2. cd to NodeApp, enter the command:
  $ npm install
3. Run the following command on terminal:
  $ npm install -g nodemon
4. Start the node server by typing following command from NodeApp:
  $ nodemon server.js
5. cd into project directory and run the json server by typing following command:
  $ json-server --static . --port 3000 --watch data.json
