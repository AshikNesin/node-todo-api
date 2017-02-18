
// ObjectId.isValid()
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/testdb',(err,db)=>{
	if(err){
		return console.log('Unable to connect to DB');
	}
	console.log('Mongodb Connected');
	// db.collection('Todo').insertOne({
	// 	text:'Its a completed task',
	// 	completed:true
	// },(err,result)=>{
	// 	if(err){
	// 		return console.log('Not able to write');
	// 	}
	// 	console.log(JSON.stringify(result.ops));
	// })


	// db.collection('Todo').find({completed:false}).toArray().then((docs)=>{
	// 	console.log(docs);
	// },(err)=>{
	// 	console.log(err);
	// })

	// db.collection('Todo').deleteMany({completed:false}).then((res)=>{
	// 	console.log(res);
	// })

	db.collection('Todo').findOneAndUpdate({
		completed:true
	},{
		$set:{
			completed:false
		}
	})

	db.close()
})