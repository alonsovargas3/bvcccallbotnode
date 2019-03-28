'use strict';
var pool = require ('../api/mysql_conv');

module.exports = function(user_id,step,convoType,id){

  //Updatae current converstaion values from DB

  async function sessionStat(user_id,step,convoType,id){
    try {
      if(step=="coin_name" || step=="start"){
        //if no convos - start a new one
        console.log("deep id="+id);
        const result = await pool.query('REPLACE INTO zobot_conversation (ID,user_id,active_session,session_type,next_step) VALUES (?,?,?,?,?)',[id,user_id,'1',convoType,step]);
      } else {
        let active_session = '';
        if(step=="complete" || step=="cancelled"){
          active_session = 0;
        } else {
          active_session = 1;
        }
        const result = await pool.query('UPDATE zobot_conversation SET next_step = ?, active_session = ? WHERE user_id = ? AND session_type = ?', [step,active_session,user_id,convoType]);
      }
      return;
    } catch (err){
      console.log(err);
    }
  }

  return sessionStat(user_id,step,convoType,id);

}
