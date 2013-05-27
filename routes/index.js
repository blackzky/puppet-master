
/*
 * GET home page.
 */

exports.index = function(req, res){
  var count = 0;
  for(var key in req.query) {
    count++;
  }
  if(count > 0){
    console.log("query..");
    res.send(JSON.stringify(req.query, null, 2));
  } else
    res.render('index', { title: 'Express' });
};

