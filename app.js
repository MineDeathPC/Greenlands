//express code
const port = 2000;
var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req,res){
	res.sendFile(__dirname+'/client/index.html');
})
app.use('/client',express.static(__dirname + '/client'));
serv.listen(port);
const fs = require('fs')



const { v4: uuidv4 } = require('uuid');

function generateUUID() {
  return uuidv4();
}



var online = [];



function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



const sqlite3 = require('sqlite3').verbose();

// Path to your existing SQLite database file
const dbPath = 'data/player_data.db';
const world_dbPath = 'data/world_data.db'

// Connect to the existing SQLite database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Connected to Player Data sql Database at ${dbPath}`);
   // db.run("DELETE FROM Players",(err)=>{
      //console.log(err)
  //  })
  }
});

const world_db = new sqlite3.Database(world_dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Connected to World Data SQL Database${world_dbPath}`);
  }
})
// Connect to the existing SQLite database






const bcrypt = require('bcrypt');
async function hashPassword(password) {
    try {
      const saltRounds = 10; // Number of salt rounds for hashing
  
      // Generate a salt
      const salt = await bcrypt.genSalt(saltRounds);
  
      // Hash the password with the generated salt
      const hashedPassword = await bcrypt.hash(password, salt);
      
      return hashedPassword;
    } catch (error) {
      console.log(error)
    }
  }





function addPlayer(unique, uuid, username, password) {

    var inventory = {}; inventory[unique] = [];
    for(i = 0;i<=599;i++){
     inventory[unique].push({slot_id:i,slot_name:null,amount:null})
    }
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Connected to the SQLite database at ${dbPath}`);
      }
    });
  
    // SQL query to insert a new player
    const sql = `INSERT INTO Players (uuid,username, password, inventory) VALUES (?, ?, ?, ?)`;
  
    // Execute the query with parameters
    db.run(sql, [uuid, username, password, JSON.stringify(inventory[unique])], function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`A new player has been added with ID ${this.lastID}`);
      }
    });
  
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Closed the database connection.');
      }
    });
  }



  function getPlayerData(uuid) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          console.log(`Connected to the SQLite database at ${dbPath}`);
        }
      });
  
      const sql = `SELECT * FROM Players WHERE uuid = ?`;
      db.all(sql, [uuid], (err, rows) => {
        console.log("db player");
        if (err) {
          console.log(err.message);
          reject(err);
        } else {
          if (rows.length > 0) {
            resolve(rows[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  }






  // Function to update a specific slot in player inventory in the database
function updatePlayerInventorySlot(playerUUID, slotNumber, newSlotData) {
  console.log("ml:"+newSlotData)
  return new Promise((resolve, reject) => {
    getPlayerData(playerUUID).then((playerData) => {
      const inventory = JSON.parse(playerData.inventory);
      
      if (inventory[slotNumber]) {
        inventory[slotNumber] = { ...inventory[slotNumber], ...newSlotData };

        const updatedInventoryString = JSON.stringify(inventory);
        
        db.run('UPDATE Players SET inventory = ? WHERE uuid = ?', [updatedInventoryString, playerUUID], (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      } else {
        reject(new Error('Invalid slot number'));
      }
    }).catch((error) => {
      reject(error);
    });
  });
}









function updateWorldBlockData(worldName, blockIndex, newBlockData) {
  console.log(worldName+""+blockIndex+""+newBlockData)
  console.log(blockIndex)
  const world_db = new sqlite3.Database(world_dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
      reject(err);
    } else {
      console.log(`Connected to World Data SQL Database before fetch ${world_dbPath}`);
    }
  });

  return new Promise((resolve, reject) => {
    world_db.all('SELECT block_data FROM worlds WHERE world_name = ?', [worldName], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (rows.length === 0) {
        reject(new Error('World not found'));
        return;
      }
      console.log("world found")

      const currentBlockData = JSON.parse(rows[0].block_data);

      const blockToUpdate = currentBlockData.filter(block => block.index == blockIndex)[0];

      if (!blockToUpdate) {
        reject(new Error('Invalid block index'));
        return;
      }

      console.log("block-to-upt "+ Object.values(blockToUpdate))

      

      let updatedBlockData = [];
      for (let i = 0; i < currentBlockData.length; i++) {
        if (currentBlockData[i].index == blockIndex) {
          console.log("deltabv")
          updatedBlockData.push(newBlockData);
        } else {
          updatedBlockData.push(currentBlockData[i]);
        }
      }

      let updatedBlockDataString = JSON.stringify(updatedBlockData);

     console.log(Object.values(updatedBlockData[blockIndex]))

      world_db.run('UPDATE worlds SET block_data = ? WHERE world_name = ?', [updatedBlockDataString,worldName], (error) => {
        if (error) {
         console.log(error)
         return;
        } else {
          console.log('sucess')
        }
      });
     
    });
  });
}






  function getWorldData(worldName) {
    return new Promise((resolve, reject) => {
      const world_db = new sqlite3.Database(world_dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        } else {
          console.log(`Connected to World Data SQL Database before fetch ${world_dbPath}`);
        }
      });
  
      world_db.all("SELECT * FROM Worlds WHERE world_name = ?", [worldName], (err, rows) => {
       
        if (err) {
          console.log(err.message);
          reject(err);
        } else {
          if (rows.length > 0) {
           
            resolve(rows[0]);
          } else {
            resolve(null);
          }
        }
      });
    
      world_db.close((err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log('Closed the database connection.');
        }
      });
    });
  }
  





  function generateWorld(unique, world_name,uuid,owner,locktype,admins,creation_date,external_locks) {
    const world_db = new sqlite3.Database(world_dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Connected to the SQLite database at ${world_dbPath}`);
      }
    });
  
    // SQL query for new world
    const sql = `INSERT INTO Worlds (world_name,uuid,owner,locktype,admins,block_data,creation_date,external_locks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
    let block_data = {}; block_data[unique] = [];

    function usualGeneration(){
    //2244,9000
    for(i = 0;i < 9500;i ++){
      //empty air
      if(i<2224){
        block_data[unique].push({index:i,block:{name:"air",maxHealth:1000,health:1000,data:{}}});
      continue;
      }
      //bedrock layer
      if(i>8806){
        block_data[unique].push({index:i,block:{name:"bedrock",maxHealth:1000,health:1000,data:{}}});
        continue;
      }

      //main terrain layer
      let block_build_selector = {}; block_build_selector[unique] = randomInt(0,10);
      if(block_build_selector[unique]==1){
        //rock
         block_data[unique].push({index:i,block:{name:"air",maxHealth:10,health:10,data:{}}});
      }
      else{
        block_data[unique].push({index:i,block:{name:"air",maxHealth:5,health:5,data:{}}});
      }

    }
    }
    //usualGeneration()
    for(i = 0;i < 9500;i ++){
      //empty air
      if(i<2224){
        block_data[unique].push({index:i,block:{name:"air",maxHealth:1000,health:1000,data:{}}});
      continue;
      }
      //bedrock layer
      if(i>7006){
        block_data[unique].push({index:i,block:{name:"bedrock",maxHealth:1000,health:1000,data:{}}});
        continue;
      }

      //main terrain layer
      let block_build_selector = {}; block_build_selector[unique] = randomInt(0,10);
      if(block_build_selector[unique]==1){
        //rock
         block_data[unique].push({index:i,block:{name:"rock",maxHealth:10,health:10,data:{}}});
      }
      else{
        block_data[unique].push({index:i,block:{name:"dirt",maxHealth:5,health:5,data:{}}});
      }

    }


    console.log("attempt generation, blocks : " + block_data[unique].length)

    // Execute the query with parameters
    world_db.run(sql, [world_name,uuid,owner,locktype,admins,JSON.stringify(block_data[unique]),creation_date,external_locks], function (err) {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`A world has been generated, with name ${world_name}`);
      }
    });
  
    // Close the database connection
    world_db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Closed the database connection.');
      }
    });
  }




function serverlog(message){
	console.log(message);
}

//socket.io definition
const io = require('socket.io')(serv, {
    cors: {
        origin: "http://localhost:8100",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});


// Function to log all rooms
function logAllRooms() {
    const allRooms = io.sockets.adapter.rooms;
    console.log('All Rooms:');
    for (const room in allRooms) {
      if (!allRooms[room].sockets.hasOwnProperty(room)) {
        console.log(`Room: ${room}`);
      }
    }
  }

//socket on connection
io.sockets.on('connection',function(socket){
	serverlog("socket connection!");
	
    //socket on successful connection
	socket.on('connected',function(){
	serverlog("full connection-socket");

	socket.emit('hello-client')
	})


    socket.on('client-login-request',function (data){
        console.log("login-attempt: "+Object.values(data))
        hashPassword(data.password).then((hashedPassword)=>{
            db.all("SELECT * FROM Players WHERE username = ?",[data.username.toUpperCase().trim()],(err,rows)=>{
                if(err)
                    {
                        console.log(err.message);
                    }
                else{
                    if(rows.length>0){
                        bcrypt.compare(data.password, rows[0].password, function(err, result) {
                            if(err){
                                console.log(err.message)
                                return;
                            }
                            if(result){
                                if(online.some(a=>a.uuid===rows[0].uuid)){
                                    console.log("Err user already online!")
                                    socket.emit('warn-client',"User Already Online","That player is already online! Please log off your current device first")
                                    return;
                                }
                            console.log('login sucessful')
                            socket.emit('login-sucessful',{username:data.username,passwordHash:hashedPassword});
                            online.push({socketID:socket.id,uuid:rows[0].uuid});
                            console.log("online : " + online.length)
                            }
                            else{
                                socket.emit('warn-client',"Verification Failed","incorrect username or password")
                            }
                        })
                       
                    }
                }
            })
        })
    })








    socket.on('client-createacc-request',function(data){
        if(data.username.toUpperCase().trim()==null || data.password==null)
            return;

        console.log("create acc attmept: "+Object.values(data));
        db.all("SELECT * FROM Players WHERE username = ?", [data.username.toUpperCase().trim()], (err, rows) => {
            if (err) {
              console.error(err.message);
            } else {
              if (rows.length > 0) {
                socket.emit('username-taken')
                return;
              } else {
                if(data.password.length >= 8 && (/^[a-zA-Z0-9]+$/).test(data.username.toUpperCase().trim())){
                    console.log("allowing acc creation...");

                    hashPassword(data.password).then((hashedpass)=>{
                    addPlayer(socket.id, generateUUID(),data.username.toUpperCase().trim(),hashedpass);
                    socket.emit('acc-created',{username:data.username.trim().toUpperCase()});
                    })
                }
              }
            }
          });


    })




    socket.on('client-attempt-enter-world',function(data){
        console.log("enter world attempt : " + data.worldName.trim().toUpperCase());

        if((/^[a-zA-Z0-9]+$/).test(data.worldName.trim().toUpperCase())==false)
            return;
       
        world_db.all("SELECT * FROM Worlds WHERE world_name = ?",[data.worldName.trim().toUpperCase()],(err,rows)=>{
            if(err){
                console.log(err.message);
                return;
            }
            else{
                if(rows.length>0){
                    //should enter world
                        console.log("world name exists")
                        socket.emit("allow-enter-world",{enter_type:"join",world:rows[0]})
                        socket.join(data.worldName.trim().toUpperCase())
                        logAllRooms()
                }
                else{
                    //should create world
                    console.log("world does not exist, attempt world creation")
                    generateWorld(socket.id, data.worldName.trim().toUpperCase(),generateUUID(),"","","",new Date().toISOString(),"");
                    console.log("world generation sucessful! " + data.worldName.trim().toUpperCase());
                    socket.emit("allow-enter-world",{enter_type:"create",world:rows[0]})
                    socket.join(data.worldName.trim().toUpperCase())
                    logAllRooms()
                }
                let uuid = {}; uuid[socket.id] = (online.filter(a=>a.socketID===socket.id)[0]).uuid;
                getPlayerData(uuid[socket.id]).then((player_data)=>{ 
                  console.log('emitted')
                  socket.emit('build-inv-on-entry',JSON.parse(player_data.inventory))
                })
            }
        })
    })




    //[{slot_id:1,slot_name:dirt,amount:200}]





    socket.on('client-grid-interaction',function(data){
      console.log("grid-interaction,"+Object.values(data)+","+Object.keys(socket.rooms)[1].toString());
      getWorldData(Object.keys(socket.rooms)[1].toString()).then((obtainedData)=>{
      
      let block_data = {}; block_data[socket.id] = (JSON.parse(obtainedData.block_data)).filter(a=>a.index==data.index)[0]
      if(block_data[socket.id].block.name == "bedrock"){
        console.log('cant modify bedrock!')
        return;
      }
      if(block_data[socket.id].block.name == "air"){
        let uuid = {}; uuid[socket.id] = (online.filter(a=>a.socketID===socket.id)[0]).uuid;
        getPlayerData(uuid[socket.id]).then((player_data)=>{ 
        if(JSON.parse(player_data.inventory)[data.inv_selection].slot_name == null)
          return;
        console.log(JSON.parse(player_data.inventory)[data.inv_selection].slot_name)
      //  if(JSON.parse(player_data.inventory)[data.inv_selection].slot_name=="grass")
       
         
          io.to(Object.keys(socket.rooms)[1].toString()).emit("place",JSON.parse(player_data.inventory)[data.inv_selection].slot_name,data.index)
          updatePlayerInventorySlot(uuid[socket.id],data.inv_selection,{slot_id:JSON.parse(player_data.inventory)[data.inv_selection].slot_id,slot_name:JSON.parse(player_data.inventory)[data.inv_selection].slot_name,amount:JSON.parse(player_data.inventory)[data.inv_selection].amount-1})
          socket.emit('deduct-block',data.inv_selection,1)
          updateWorldBlockData(Object.keys(socket.rooms)[1].toString(),data.index,{index:data.index,block:{name:JSON.parse(player_data.inventory)[data.inv_selection].slot_name,maxHealth:block_data[socket.id].block.maxHealth,health:block_data[socket.id].block.health,data:{}}}).then((result)=>{
            console.log(result)
          })
        })
      }
      console.log("not air cant place")
    })
    })
    
   






    //disconnect event
    socket.on('disconnect', () => {
        console.log("disconnect detected:"+socket.id)
       online = online.filter(a=>a.socketID!=socket.id);
      
        console.log("online : " + online)
    })


    //end of MAIN SUPER event handler
})









