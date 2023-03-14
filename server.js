const http=require('http');
const path=require('path');
const fs=require('fs');
const url=require('url');
const qs=require('querystring');
const port=3000;

var postsArr = [];
var server=http.createServer((request, response)=>{
var urlObj=url.parse(request.url);
console.log("URL OBJ:::", urlObj);
if(request.method=="GET" && urlObj.pathname=="/posts" && urlObj.search!=null) {
    console.log("Query string",urlObj.query);
    var qsObj=qs.parse(urlObj.query);
    for(item of Object.keys(qsObj)) {
        console.log(`Query :: ${item} : ${qsObj[item]}`);
    }
    var pos=postsArr.findIndex(item => item.postName==qsObj.postName);
    if(pos>=0) {
        response.end(JSON.stringify(postsArr[pos]));
    } else {
        response.statusCode=402;
        response.end(JSON.stringify({err:"Post Not Found"}));
    }
    return;
}

    if(request.url=='/posts') {
        if(request.method=="DELETE") {
            var postsToBeDeleted="";
            request.on("data", (chunk)=>{
                postsToBeDeleted+=chunk;
            })
            request.on("end",()=>{
            var postsToBeDeletedObj=JSON.parse(postsToBeDeleted);
            var pos=postsArr.findIndex(item => item.postName == postsToBeDeletedObj.postName);
            if(pos>=0) {
                postsArr.pop(postsToBeDeletedObj);
                response.end(JSON.stringify({msg:"Post deleted successfully", deletedPosts:postsToBeDeletedObj}));
            } else {
                response.end(JSON.stringify({err:"Posts to be delted does not found"}));
            }})
            request.on("error", (err)=>{
                response.end(JSON.stringify({err:err}));
            })
            return;
        }

        if(request.method=="PATCH") {
            var postsToBeUpdated="";
            request.on("data", (chunk)=>{
                postsToBeUpdated+=chunk;
            })
            request.on("end", ()=>{
                var postsToBeUpdatedObj=JSON.parse(postsToBeUpdated);
                var pos=postsArr.findIndex(item => item.postName == postsToBeUpdatedObj.postName);
                if(pos>=0) {
                    postsArr[pos].status=postsToBeUpdatedObj.status;
                    response.end(JSON.stringify({msg:"Data updated successfully", updatedData:postsArr[pos]}))
                } else {
                    response.statusCode=401;
                    response.end(JSON.stringify({err:"Posts does not exists"}));
                }
                request.on("error", (err)=>{
                    response.statusCode=401;
                    response.end(JSON.stringify({err:err}));
                })
            })
            return;
        }

        if(request.method=="GET") {
            response.end(JSON.stringify(postsArr));
            return;
        }

        if(request.method=="POST") {
            var newPosts="";
            request.on("data", (chunk)=>{
                newPosts+=chunk;
            })
            request.on("end", ()=>{
                var newPostsObj=JSON.parse(newPosts);
                var pos=postsArr.findIndex(item => item.postName == newPostsObj.postName);
                if(pos==-1) {
                    postsArr.push(newPostsObj);
                    response.end(JSON.stringify({msg:"New Posts Created Successfully"}));
                } else {
                    response.statusCode=401;
                    response.end(JSON.stringify({err:"Posts already exists with the given name"}));
                }
                
            })
            request.on("error", (err)=>{
                console.log("Error in post request to /posts", err);
                response.statusCode=401;
                response.end(JSON.stringify({err:"Insertion Failed"}));
            })
            return;
        }
    }
    response.end("Response fromthe server")
})

server.listen(port, ()=>{
    console.log(`Server started running at port ${port}`);
})