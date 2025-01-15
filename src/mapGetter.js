//variables para escena de cargar mapa ya existente
var mapSelector = document.getElementById('mapSelector');
var inputMapBox = document.getElementById('mapToSelect');
var inputMapEditorBox = document.getElementById('mapToSelectEditor');

//variables para escena de meterse en editor de mapas
var songSelector = document.getElementById("songSelector");
var inputSongBox = document.getElementById('songToSelect');
var buttonAcceptSong = document.getElementById('buttonSongToSelect');
var initialBPMBox = document.getElementById('initialBPM');

var songOfMapCreator;
var initialBPMOfMapCreator;

//variables de escena de editor
var nameSelector  = document.getElementById('nameSelector');
var mapNameBox    = document.getElementById('nameOfProject');
var buttonSaveMap = document.getElementById('saveSongButton');

var BPMSelector=    document.getElementById('BPMSelector');
var BPMTextBox =    document.getElementById('BPMOFNextNode');



var mapRawText;
var editorRawText = null;

inputMapBox.addEventListener('change', () => {
    let files = inputMapBox.files;
    if(files.length == 0) return;
    const file = files[0];
    let reader = new FileReader();

    reader.onload = (e) => {
        const file = e.target.result;

        
        mapRawText = file;
        loadScene(game);

        //let map = load(game.mapRawText); map.editor = true;
        //mapCreatorScene.map = map;
        
        //map.song.volume = 0.1;
        //player.Start();
        //player.setTargetMap(map); player.automode = true;
        //mapCreator = new MapCreator(map);
        //timeLine = new TimeLine(mapCreator, map.tilesWidth * 1.5);
        //timeLine.Start();

        //player.setTargetMap(map); player.automode = true;
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(file); 
    
});

inputMapEditorBox.addEventListener('change', () => {
    let files = inputMapEditorBox.files;
    if(files.length == 0) return;
    const file = files[0];
    let reader = new FileReader();

    reader.onload = (e) => {
        const file = e.target.result;

        
        editorRawText = file;
        loadScene(mapCreatorScene);

        //let map = load(game.mapRawText); map.editor = true;
        //mapCreatorScene.map = map;
        
        //map.song.volume = 0.1;
        //player.Start();
        //player.setTargetMap(map); player.automode = true;
        //mapCreator = new MapCreator(map);
        //timeLine = new TimeLine(mapCreator, map.tilesWidth * 1.5);
        //timeLine.Start();

        //player.setTargetMap(map); player.automode = true;
    };
    reader.onerror = (e) => alert(e.target.error.name);
    reader.readAsText(file); 
    
});

buttonAcceptSong.onclick = function()
{
    songOfMapCreator = inputSongBox.value;
    initialBPMOfMapCreator = parseInt(initialBPMBox.value);
    
    loadScene(mapCreatorScene);
}

function saveMap()
{
    console.log(mapNameBox.value);
    mapCreatorScene.map.saveMap(mapNameBox.value);
}