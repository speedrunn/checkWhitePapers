"use strict";
const request = require('request');
const pdf = require('pdf-parse');
const fs = require('fs');
const config = require('./config/config.json');
var re = /(https?:\/\/[^\s]+)/g;

var dataText = {
	"text":"",
	"userkey": config.userkey
}
var uidSend = {
	"uid":"",
	"userkey": config.userkey
}
const zeroX = '0x.pdf';
let dataBuffer = fs.readFileSync('white_papers/'+zeroX);
 
pdf(dataBuffer).then(async (data) => {
    dataText.text = data.text.substring(5000,15000);
   	let references = data.text.match(re);
   	let uid = await sendRequest(dataText);
   	if(uid.text_uid){
   		fs.writeFile('tempUid.txt',JSON.stringify(uid.text_uid),'utf-8',(err)=>{
   			if(err) throw err;
   			console.log("Write uid")
   		})
   	}
   	setTimeout(getPercent,3000);      
});

function getPercent(){
	fs.readFile('tempUid.txt',async (err,data)=>{
		if(err) throw err;
		let uid = JSON.parse(data);
		uidSend.uid = uid;
		uidSend.exceptdomain = 'https://archive.org/stream/0xproject/0x_white_paper_djvu.txt';
		let percent = await sendRequest(uidSend)
		if(percent.error_code == 181){
			setTimeout(getPercent,3000);
		} else {
			// get percent value
			let result = {};
			result.name = zeroX;
			result.percent = percent.text_unique + '%'
			fs.writeFile('result.txt', JSON.stringify(result), (err)=>{
				if(!err) console.log("Percent written");
				
			})

		}
	})
}

function sendRequest(formData){
	return new Promise((resolve,reject)=>{
		request({
			  uri: 'http://api.text.ru/post',
			  method: 'POST',
			  headers: {
			    'User-Agent': 'request', 
			    'Content-Type': 'json'
			  },
			  formData: formData
			}, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			  	let resp = JSON.parse(body);
			    resolve(resp)
			  } else {
			  	console.log(error);
			  }
			});
	})
}

