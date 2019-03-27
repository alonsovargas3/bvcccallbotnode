'use strict';
var pool = require ('../api/mysql_conv');

module.exports = function(user_id){

  //Get current converstaion values from DB

  //pool.query('SELECT * FROM zobot_conversation where user_id = ?', [user_id],function(err,result,fields){
  //  if (err) {
  //    throw err;
  //  } else {
  //    console.log(JSON.stringify(result[0]));
  //    return result[0].user_id;
  //  }
  // }); //End DB query

  async function sessionStat(user_id){
    try {
      const result = await pool.query('SELECT * FROM zobot_conversation where user_id = ?', [user_id]);
      const statResp = result[0];
      return statResp;
    } catch (err){
      console.log(err);
    }
  }

  return sessionStat(user_id);

}
