# batchsql v1.0.0

Sometimes you just need to run easy SQL commands. Sometimes you wanna batch them up and be sure execution will be smooth.

## BatchSQL: No Frills! ##


1. BatchSQL allows you to run easy SQL queries. 
2. Submit object arrays and Batch SQL is composed and executed on the fly!

##Installation

Using npm:

```bash
$ {sudo -H} npm i -g npm
$ npm i --save batchsql
```

In Node.js/io.js:

```js
//require batchsql
var conn=require("batchsql");

//select database to use
conn.db('website',function(connection){
		

	//here is some data to insert
	var data={
		url:'https://www.npmjs.com/package/batchsql',
		domain:'npmjs.org',
		desc:'NodeJs packages'
	};

	//insert some data into 'urls' table
	conn.insert('urls',data, function(err,affected) {
		if(err){throw err}
		//print out affected rows
		console.log(affected);

		//now query the table
		var query="SELECT * FROM urls";	
		//NOTE the table is stated in query SQL so no need to pass it to method
		conn.query(query, function(err, results,rows) {
			//Viola! We have some results
			console.log(results,rows);
		});	

	},true); //note this last argument (ignore) tells batchSQL to perform an "INSERT IGNORE" query 

});
```

# API #

BatchSQL exposes the following methods.

##Query(query, callback) ##
Takes and executes a valid SQL query and returns results.

## update(table,updateObj,condition,callback,upDateEntireTable) ##

## insert(table,insertObj,callback,ignore) ##

## upsert(table,insertObj,updateObj,callback,ignore) ##

#  #Be Carefurl! Not yet ready!
BatchSQL is still in early alpha and may not be appropriate fro production!

