console.clear();
const fs = require("fs");
const path = require("path");
const fileNames1 = ["Actors","Animations","Armors","Classes","CommonEvents","Enemies","Items"];
const fileNames2 = ["MapInfos","Skills","States","System","Tilesets","Troops","Weapons"];
var fileSelected = false;
var outputSelected = false;
_("#file").bind("change",e=>{
    if(_("#file")[0].files[0]){
        fileSelected = true;
        let filepath = _("#file")[0].files[0].path;
        _("#output").attr("nwworkingdir",filepath.substring(0,filepath.lastIndexOf(path.sep)));
    }else{
        fileSelected = false;
        _("#output").attr("nwworkingdir","");
    }
    if(fileSelected && outputSelected){
        _("#get").attr("disabled","").val("提取");
    }else{
        _("#get").attr("disabled","disabled").val("請先完成1、2步");
    }
})

_("#output").bind("change",e=>{
    if(_("#output")[0].files[0]){
        outputSelected = true;
    }else{
        outputSelected = false;
    }
    if(fileSelected && outputSelected){
        _("#get").attr("disabled","").val("提取");
    }else{
        _("#get").attr("disabled","disabled").val("請先完成1、2步");
    }
})

_("#get").bind("click",e=>{
    const outputPath = _("#output")[0].files[0].path;
    const fr = new FileReader();
    fr.onload = ()=>{
        let src = fr.result;
        let jsons = [];
        let counter = 0;
        let type = 0;
        let _json = "";

        src = src.replace(/[\r\n]/g,"");
        src = src.match(/(\[null.+?)(?=\\x)/)
        src = src[0];

        for (const i in src) {
            let chr = src[i];
            if(chr == "["){
                if(counter == 0 && type == 0){
                    type = 1;
                }
                if(type == 1) counter ++;
            }else if(chr == "]"){
                if(type == 1) counter --;
                if(counter < 0) counter = 0;
            }else if(chr == "{"){
                if(counter == 0 && type == 0){
                    type = 2;
                }
                if(type == 2) counter ++;
            }else if(chr == "}"){
                if(type == 2) counter --;
                if(counter < 0) counter = 0;
            }
            if(counter == 0 && _json != "") {
                try {
                    let json = JSON.parse(_json + chr);
                    jsons.push(json);
                } catch (error) {}

                type = 0;
                _json = "";
            }else if(counter > 0){
                _json += chr;
            }
        }
        let datas = jsons.filter(v=>JSON.stringify(v) != "{}");
        let mapsCount = datas.length - 14;
        let offset = mapsCount + 7;
        let mapCounter = 0;
        for (const i in datas) {
            let data = JSON.stringify(datas[i]);
            let filename = "";
            if(i < 7 || i >= datas.length - 7){
                if(i < 7){
                    filename = fileNames1[i] + ".json";
                }else{
                    filename = fileNames2[i - offset] + ".json";
                }
            }else{
                mapCounter ++;
                filename = "Map" + mapCounter.toString().padStart(3,'0') + ".json";
            }
            try {
                fs.unlinkSync(outputPath + "/" + filename,data); 
            } catch (error) {}
            fs.writeFileSync(outputPath + "/" + filename,data);
        }
    }
    fr.readAsText(_("#file")[0].files[0],"utf-8")
})