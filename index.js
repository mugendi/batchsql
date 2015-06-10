
var mysql = require('mysql'),
	_ = require('lodash'),
	settings=require("./connection-settings.js").settings,
	connection={
		conn:{
			query:function(query,callback){callback( throwError(1046),null,null)}
		}
	},
	db="",
	errFile=require('./errors.json') // from https://mariadb.com/kb/en/mariadb/mariadb-error-codes/
	;



var escapeOBJ=function(val){
	return JSON.stringify(val)
			   .replace(/'/g,"\\'")
			   .replace(/"/g,"'")
			   .replace(/[\[\]]/g,"")
}

var throwError=function(code){
	// tryig to throw errors like this one...
	// { 
	// 	[Error: ER_DUP_ENTRY: Duplicate entry 'sjhgshfs' for key 'PRIMARY'] 
	// 	code: 'ER_DUP_ENTRY', 
	// 	errno: 1062, 
	// 	sqlState: '23000', 
	// 	index: 0 
	// }

	var err={
		code: errFile[code].error, 
		errno: code, 
		sqlState: errFile[code].sqlState, 
		// index: 0 
	}

	return new Error( [ errFile[code].error+": "+errFile[code].description, err ]);
}

connection.db=function(database,callback){

	connection.conn=mysql.createConnection(_.extend(settings,{database:database}));
	db=database;



	callback(connection);
}

connection.query=function(query, callback){
	//perform actual query
	connection.conn.query(query, function(err, results,rows){
		callback(err, results,rows);
	});
}

connection.update=function(table,updateObj,condition,callback,upDateEntireTable){

    var query="UPDATE  "+table+" SET ";

    var l=_.keys(updateObj).length;
    var where="";

    for(var i in updateObj){
        query+=i+"=";
        query+=(typeof updateObj[i]=="number")?
                updateObj[i]:"'"+updateObj[i].replace(/'/,"\'")+"'";

        query+=(i<l-1)?",":"";
    };

    

    if(_.isObject(condition)){
        //always have condition as array...
        if(!_.isArray(condition)){
            condition=[condition];
        }

        var c={};
        _.keys(condition[0]).forEach(function(k){
            c=_.map(condition,k);
            where=k+" IN ("+escapeOBJ(c)+")";
        });
    }
    else{
        where=" "+condition;
    }

    query+=(where!=="")?" WHERE "+where:"";

    // console.log(query);

    //avoid updates with no where
    if(where!=="" || upDateEntireTable){
        //console.log("updated anyway");

        //now update...
        connection.query(query, function(err, results,rows) {
           if(err){ callback(err,null,null); return; }
            // console.log( );
            callback(null, results.affectedRows + ' rows updated!');
        });
    }

},

connection.insert=function(table,insertObj,callback,ignore){

    if(!_.isArray(insertObj)){
        insertObj=[insertObj]
    }

    //format object for multiple inserts
    // INSERT INTO `proxies` (`ip`, `port`, `type`, `anonymity`, `added`, `google`, `facebook`, `twitter`, `yahoo`) VALUES
    // ('101.255.28.38', '8080', 'HTTPS', 'High +KA', '2014-12-10 03:00:03', 0, 0, 0, 0),
    // ('111.206.81.248', '80', 'HTTP', 'Low', '2014-12-10 03:00:03', 0, 0, 0, 0),

    //make insertion query
    //first pick first row, all records must conform with this row
    query="INSERT ";
    query+=(ignore)?"IGNORE":"";
    query+=" INTO "+table+" ";
    query+="("+_.map(_.keys(insertObj[0]),function(f){return '`'+f+'`';}).join(",")+")";
    query+=" VALUES ";

    //how big an object have we...
    var length=insertObj.length,
        vs='';

    insertObj.forEach(function(d,i){

        query+="("+escapeOBJ(_.values(d))+")";
        query+=(i<length-1)?",":"";

        return false;
    });


    connection.query(query, function(err, results,rows) {
    	if(err){ callback(err,null,null); return; }
        // connection.end();
        callback(null,results.affectedRows + ' rows inserted!');
    });

};


connection.upsert=function(table,insertObj,updateObj,callback,ignore){

    if(!_.isArray(insertObj)){
        insertObj=[insertObj]
    }

    //format object for multiple inserts
    // INSERT INTO `proxies` (`ip`, `port`, `type`, `anonymity`, `added`, `google`, `facebook`, `twitter`, `yahoo`) VALUES
    // ('101.255.28.38', '8080', 'HTTPS', 'High +KA', '2014-12-10 03:00:03', 0, 0, 0, 0),
    // ('111.206.81.248', '80', 'HTTP', 'Low', '2014-12-10 03:00:03', 0, 0, 0, 0),

    //make insertion query
    //first pick first row, all records must conform with this row
    query="INSERT ";
    query+=(ignore)?"IGNORE":"";
    query+=" INTO "+table+" ";
    query+="("+_.map(_.keys(insertObj[0]),function(f){return '`'+f+'`';}).join(",")+")";
    query+=" VALUES ";

    //how big an object have we...
    var length=insertObj.length,
        vs='';

    insertObj.forEach(function(d,i){

        query+="("+escapeOBJ(_.values(d))+")";
        query+=(i<length-1)?",":"";

        return false;
    });


    if(updateObj){
        query+=' ON DUPLICATE KEY UPDATE ';

        var l=_.keys(updateObj).length;
        var ups=[];
        for(var i in updateObj){
            ups.push(
                i+"="+ 
                    ((typeof updateObj[i]=="number")? 
                    updateObj[i]:"'"+updateObj[i].replace(/'/,"\'")+"'")
                    +''
            );
        }; 

        query+=ups.join(', ');
    }
    

    //now insert...
    connection.query(query, function(err, results,rows) {
        if(err){ callback(err,null,null); return; }
        // console.log(results)
        // connection.end();
        callback(null,'Upsert Done!'); 
        
    });

};


module.exports=connection;
