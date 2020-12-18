//搭建服务器
var http = require('http');
var formidable = require("formidable");
var fs = require('fs');
var common = require('./common');

// 搭建服务器
var server = http.createServer(function(req, res){
    res.writeHead(200, {
        "Content-Type":"text/json;charset=utf-8",
        "Access-Control-Allow-Origin":"*"
    });
    if(req.method == "POST"){
        //初始化一个form表单数据的解析器
        var form  = new formidable.IncomingForm();
        //指定formidable数据的存储目录；form.uploadDir = "/my/dir"; 设置上传文件存放的文件夹，默认为系统的临时文件夹，可以使用fs.rename()来改变上传文件的存放位置和文件名
        form.uploadDir = __dirname+"/temp"; 
        //设置formidable存储文件时自动保存文件的后缀 form.keepExtensions = false; 设置该属性为true可以使得上传的文件保持原来的文件的扩展名。
        form.keepExtensions = true; 

        form.parse(req, function(err, fileds, files){
        /*  //接收formData中的参数
            req.fields
            //接收formData中的文件
            req.files
        })*/
            //判断当前片段是都是第一个
            if(fileds.sliceIndex == 0){
              //生成文件名
              var fileName = common.getRandomStr();
              var filePath = __dirname+"/files/"+fileName+"."+fileds.fileType;
              //创建读取流
              var readStream = fs.createReadStream(files.file.path);
              // 创建写入流
              var writeStream = fs.createWriteStream(filePath);
              readStream.pipe(writeStream);
              //数据读取完毕 
              readStream.on('end', function(){
                  //删除临时文件夹中的文件
                  fs.unlinkSync(files.file.path); 
                  res.end(JSON.stringify({code:200, fileName}));
              }); 
            }else {
              //非第一个片段
              //创建设置文件路径
              var filePath = __dirname+"/files/"+fileds.fileName+"."+fileds.fileType;
              //通过files.file.path路径读取前端发送的数据
              var readStream =  fs.createReadStream(files.file.path);
              //向指定的路径写入文件
              var  writeStream = fs.createWriteStream(filePath, {flags:"a"});
              //通过管道流把读取的文件直接写到指定的文件中
              readStream.pipe(writeStream);
              //数据读取完毕 
              readStream.on('end', function(){
                //删除临时文件夹中的文件
                fs.unlinkSync(files.file.path); 
                res.end(JSON.stringify({code:200, fileName:fileds.fileName}));
              });
            } 
        });
    }
});

server.listen(8080);

