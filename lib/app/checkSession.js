'use strict';
var db = require ('../api/mysql_conv');

module.exports = function(user_id){

  //Get current converstaion values from DB
  db.query('SELECT * FROM zobot_conversation where user_id = ?', [user_id],function(err,result,fields){
    if (err) {
      throw err;
    } else {
      console.log(result);
    }
  }); //End DB query

}
