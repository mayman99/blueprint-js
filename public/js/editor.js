let selectedTreeElement = undefined;
let selectedTreeItem    = undefined;

let inspectorPanel  = document.querySelector(".selector");
let inspectorLayerTools = inspectorPanel.querySelector(".layer-tools");
let inspectorGroupTools = inspectorPanel.querySelector(".group-tools");
let inspectorTileSelector = inspectorPanel.querySelector(".tile-selector");
let inspectorBrushSize = inspectorLayerTools.querySelector(".brush-size");
let inputBrushSize = inspectorBrushSize.querySelector("#brush-size");
let tileListElement = inspectorPanel.querySelector(".tile-list");

let itemDetailElement = inspectorPanel.querySelector(".item-details");
let itemDetailTypeIconElement  = itemDetailElement.querySelector(".item-type-icon");
let itemDetailNameInputElement = itemDetailElement.querySelector(".item-name");

let mapTreeElement   = document.querySelector(".project-item-tree");
let container = document.querySelector(".editor-container");

let windowBackgroundTint = document.querySelector(".window-tint");
let createMapWindow = document.querySelector("#create-map-window");
let loadMapWindow = document.querySelector("#load-map-window");
let loadTilesetWindow = document.querySelector("#load-tilesets-window");
let loadTilesetWindowProgressBarValue = loadTilesetWindow.querySelector(".progress-bar-value");

let backToolName = undefined;
let activeTool = undefined;
let activeToolName = "cursor";
let tools = ["cursor", "brush", "eraser", "move", "fill"];
let isWindowOpen = false;
let isRenamingTreeItem = false;
let zoomIntensity = 0.1;
let brushSize = 1;
let maxBrushSize = 8;
let selectedTilePage = 0;
let selectedTileElement = undefined;
let selectedTile = undefined;
let tilePageCount = 1; // should be the same as tilesets.length
let tilesets = [];
let isLoadingTilesets = true;
let tilesetLoadCount = 0;
let tilesetLoadCompleteCount = 0;
let toastyPlayed  = false;
let tilesetPagingForIsoEnabled = false;

class IsometricMapRenderer {
  constructor() {
    this.tileDepth=80;
    this.renderIndex=0;
  }
  draw(map) {
    this.renderIndex = 0;
    if (!map) return;

    this.drawGrid(map);
    this.drawRecursive(map); 
    if (map.hoverVisible) {
      this.drawBrush(map);
    }
  }
  
  drawBrush(map) {
    let mousePoint = this.screenToWorldPoint(map, mouse.x / ctxScaleX, mouse.y / ctxScaleY);               
    for(let y = 0; y < brushSize;++y) {
     for (let x = 0; x < brushSize;++x) {
          let renderPoint = this.getRenderPoint(mousePoint.x+x, mousePoint.y+y); 
          this.drawTileHover(renderPoint.x, renderPoint.y, map.tileWidth, map.tileHeight); 
       }
    }       
  }
  
  drawRecursive(map, currentLayer) {
    if (typeof currentLayer == "undefined") {            
      for (let item of map.children) {
        this.drawRecursive(map, item);
      }
    } else {
      if (currentLayer.visible) {
        if (currentLayer instanceof MapLayerGroup) {
          for (let item of currentLayer.children) {
            this.drawRecursive(map, item);
          }
        } else {
          this.drawLayer(map, currentLayer);
        }
      }      
      this.renderIndex++;
    }
  }
  
  drawGrid(map) {
    let camera = Camera.getMainCamera();
    let tileWidth = map.tileWidth;
    let tileHeight = map.tileHeight;
    let tile_half_width = tileWidth / 2;
    let tile_half_height = tileHeight / 2;
    for (let tileX = 0; tileX < map.width; ++tileX) {
      for (let tileY = 0; tileY < map.height; ++tileY) {     
        let renderX = camera.viewport.x + (tileX - tileY) * tile_half_width;
        let renderY = camera.viewport.y + (tileX + tileY) * tile_half_height;
        this.drawGridTile(renderX, renderY, tileWidth, tileHeight);     
      }
    }
  }
  
  drawLayer(map, layer) {
    let camera = Camera.getMainCamera();
    let tileWidth = map.tileWidth;
    let tileHeight = map.tileHeight;
    let tile_half_width = tileWidth / 2;
    let tile_half_height = tileHeight / 2;
    for (let tileX = 0; tileX < map.width; ++tileX) {
      for (let tileY = 0; tileY < map.height; ++tileY) {     
        let renderX = camera.viewport.x + (tileX - tileY) * tile_half_width;
        let renderY = camera.viewport.y + (tileX + tileY) * tile_half_height;        
        this.drawTile(map, layer.tileData[tileY * map.width + tileX], renderX, renderY-48-(this.renderIndex*12), tileWidth, tileHeight);
      }
    } 
  }
  
  getRenderPoint(tileX, tileY) {
    let camera = Camera.getMainCamera();
    let tileWidth = map.tileWidth;
    let tileHeight = map.tileHeight;
    let tile_half_width = tileWidth / 2;
    let tile_half_height = tileHeight / 2;
    let renderX = camera.viewport.x + (tileX - tileY) * tile_half_width;
    let renderY = camera.viewport.y + (tileX + tileY) * tile_half_height;
    return {
      x: renderX,
      y: renderY
    }
  }
  drawGridTile(x, y, width, height) {
    this.drawTileGraphics(x, y, width, height, 'rgba(255,255,255,0.4)', 'rgba(25,34, 44,0.2)', [5], 1);
  }  
  drawTile(map, tileData, x, y, width, height) {
    if (!tileData || tileData.id === -1) 
      return;
    
    let tileset = getTilesetById(tileData.tileset, map.type);
    let tile = tileset.getTile(tileData.id);       
    if (!tile || !tile.src)
      return;
    
    // this.drawTileGraphics(x, y, width, height, 'rgba(255,255,255,0.4)', 'rgba(25,34, 44,0.2)', [5], 1);
    // ctx.drawImage(tile.src, tile.x, tile.y, tile.width, tile.height, x, y, tile.width, tile.height);
    let offsetY = this.tileDepth - height;
    ctx.drawImage(tile.src, x, y+offsetY-(height/2));
  }  
  drawTileHover(x, y, width, height){         
    this.drawTileGraphics(x, y, width, height, 'rgba(30,250,42,0.4)', 'rgba(30,250,42,0.1)', [], 1);
  }  
  drawTileGraphics(x, y, width, height, strokeStyle, fillStyle, lineDash, lineWidth) {
    ctx.beginPath();  
    ctx.setLineDash(lineDash);
    ctx.strokeStyle = strokeStyle;  
    ctx.fillStyle = fillStyle;  
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width/2, y-height/2);  
    ctx.lineTo(x + width, y);  
    ctx.lineTo(x + width/2, y + height/2);  
    ctx.lineTo(x, y);    
    ctx.stroke();
    ctx.fill();    
  }
  
  worldToScreenPoint(map, x, y) {
    let camera = Camera.getMainCamera();
    let tileWidth = map.tileWidth;
    let tileHeight = map.tileHeight;
    let tile_half_width = tileWidth / 2;
    let tile_half_height = tileHeight / 2;    
    let renderX = (x - y) * tile_half_width - camera.viewport.x;
    let renderY = (x + y) * tile_half_height - camera.viewport.y;
    return {
      x: renderX,
      y: renderY
    }
  }
  screenToWorldPoint(map, x, y) {
    let camera = Camera.getMainCamera();
    let tile_height = map.tileHeight;
    let tile_width = map.tileWidth;
    let mouse_y = y - camera.viewport.y;
    let mouse_x = x - camera.viewport.x;  
    return {
      x: Math.floor((mouse_y / tile_height) + (mouse_x / tile_width)),
      y: Math.floor((-mouse_x / tile_width) + (mouse_y / tile_height))+1
    };
  }  
}

class MapRenderer {
  draw(map) {
    if (!map) return;    
    this.drawGrid(map);
    this.drawRecursive(map);    
    if (map.hoverVisible) {
      this.drawBrush(map);
    }
  }
  
  drawBrush(map) {
    let mousePoint = this.screenToWorldPoint(map, mouse.x / ctxScaleX, mouse.y / ctxScaleY);               
    for(let y = 0; y < brushSize;++y) {
     for (let x = 0; x < brushSize;++x) {
          let renderPoint = this.getRenderPoint(mousePoint.x+x, mousePoint.y+y); 
          this.drawTileHover(map, renderPoint.x, renderPoint.y);
       }
    }       
  }
  
  drawRecursive(map, currentLayer) {
    if (typeof currentLayer == "undefined") {            
      for (let item of map.children) {
        this.drawRecursive(map, item);
      }
    } else {
      if (currentLayer.visible) {
        if (currentLayer instanceof MapLayerGroup) {
          for (let item of currentLayer.children) {2
            this.drawRecursive(map, item);
          }
        } else {
          this.drawLayer(map, currentLayer);
        }
      }
    }
  }
  
  drawGrid(map) {
    let camera = Camera.getMainCamera();
    for(let y = 0; y < map.height; ++y) {
      for (let x = 0; x < map.width; ++x) {
        let renderX = camera.viewport.x + (x * map.tileWidth);
        let renderY = camera.viewport.y + (y * map.tileHeight);
        this.drawGridTile(map, renderX, renderY);
      }
    }    
  }
   
  drawLayer(map, layer) {
    let camera = Camera.getMainCamera();
    for(let y = 0; y < map.height; ++y) {
      for (let x = 0; x < map.width; ++x) {
        let renderX = camera.viewport.x + (x * map.tileWidth);
        let renderY = camera.viewport.y + (y * map.tileHeight);
        this.drawTile(layer.tileData[y * map.width + x], map, renderX, renderY);
      }
    }    
  }
  
  getRenderPoint(x, y) {    
    let camera = Camera.getMainCamera();
    return {
      x: camera.viewport.x + (x * map.tileWidth),
      y: camera.viewport.y + (y * map.tileHeight) 
    }
  }
  drawGridTile(map, x, y) {
    this.drawTileGraphics(map, x, y, 'rgba(255,255,255,0.4)', 'rgba(25,34, 44,0.2)', [1], 1);
  }
  
  drawTile(tileData, map, x, y) {
    if (!tileData || tileData.id === -1) 
      return;
    
    let tileset = getTilesetById(tileData.tileset, map.type);
    let tile = tileset.getTile(tileData.id);    
    ctx.drawImage(tileset.src, tile.x, tile.y, tile.width, tile.height, x, y, tile.width, tile.height);
    // this.drawTileGraphics(map, x, y, 'rgba(255,255,255,0.4)', 'rgba(25,34, 44,0.2)', [1], 1);
  }
  
  drawTileHover(map, x, y) {   
    this.drawTileGraphics(map, x, y, 'rgba(30,250,42,0.4)', 'rgba(30,250,42,0.1)', [], 1);
  }  
  drawTileGraphics(map, x, y, strokeStyle, fillStyle, lineDash, lineWidth) {
    ctx.beginPath();    
    ctx.setLineDash(lineDash);
    ctx.strokeStyle = strokeStyle;  
    ctx.fillStyle = fillStyle;  
    ctx.lineWidth = lineWidth;  
    ctx.rect(x, y, map.tileWidth, map.tileHeight);    
    ctx.fill();
    ctx.stroke();   
  }  
  worldToScreenPoint(map, x, y) {
    let camera = Camera.getMainCamera();
    return {
      x: (map.tileWidth * x) - camera.viewport.x,
      y: (map.tileHeight * y) - camera.viewport.y
    }
  }
  screenToWorldPoint(map, x, y) {
    let camera = Camera.getMainCamera();
    let mouse_y = y - camera.viewport.y;
    let mouse_x = x - camera.viewport.x;  
    return {
      x: Math.floor(mouse_x / map.tileWidth),
      y: Math.floor(mouse_y / map.tileHeight)
    };
  }    
}

class Map {
  constructor(type, width, height, tileWidth, tileHeight, renderer) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.children = []; // both layer and groups
    this.renderer = renderer;
    this.hoverVisible = false;
    this.itemId = 0;
  }
  static createIso(width, height) {    
    resetScale();
    Camera.getMainCamera()
      .setViewport(canvas.width/2-48, canvas.height/2-((48*height)/2));
    return new Map("iso", width, height, 96, 48, new IsometricMapRenderer());
  }
  static create(width, height) {   
    resetScale();
    Camera.getMainCamera()
      .setViewport(canvas.width/2-((32*width)/2), canvas.height/2-((32*height)/2));
    return new Map("top", width, height, 32, 32, new MapRenderer());
  }
  draw() {    
    this.renderer.draw(this);
  }
  getHoverTile() {
    return this.renderer.screenToWorldPoint(this, mouse.x/ ctxScaleX, mouse.y/ ctxScaleY);
  }
  clone(item) {
    if (!item.type) { // check if the property: type exists, it should only exist on layers
      alert("Groups cannot be cloned yet.");
      return; // we can't clone groups right now
    }
    
    let newLayer = this.createLayer(item.parent);
    newLayer.name = item.name;
    newLayer.type = item.type;
    return newLayer;
  }
  
  createLayer(parent) {
    let layer = new MapLayer(this.type, ++this.itemId, "New layer", "normal", this.width, this.height);
    layer.properties = {};
    if (parent) {      
      layer.parent = parent;
      parent.children.push(layer);
    } else {
      this.children.push(layer);
      layer.parent = this;
    }    
    return layer;
  }  
  createGroup(parent) {
    let group = new MapLayerGroup(++this.itemId, "New group");
    if (parent) {
      group.parent = parent;
      parent.children.push(group);
    } else {
      this.children.push(group);
      group.parent = this;
    }    
    return group;    
  }
}

class MapLayerGroup {
  constructor(id, name) {
    this.name = name;
    this.id = id;
    this.children = [];
    this.visible = true;
    this.parent = undefined;
  }
}

class MapLayerTile {
  constructor(id, tileset) {
    this.id = id;
    this.tileset = tileset;
  }
  static empty() {
    return new MapLayerTile(-1, -1);
  }
}

class MapLayer {
  constructor(mapType, id, name, layerType, width, height) {
    this.name = name;
    this.id = id;
    this.type = layerType;
    this.width = width;
    this.height = height;
    this.visible = true;
    this.parent = undefined;    
    this.tileData   = [];
    for (let y = 0; y < height; ++y)
    for (let x = 0; x < width;  ++x)
      this.tileData[y * width + x] = MapLayerTile.empty();
    this.properties = mapType === "iso" 
      ? this.createIsoProperties() 
      : this.createStandardProperties();
  } 
  
  createIsoProperties() {
    return {
      heightLevel: 0,
      block: false,
    };
  }
  
  createStandardProperties() {
    return {
      block: false      
    };
  }  
}

class FillTool {
  constructor() {
    this.stackSize = 16777216; //avoid possible overflow exception
    this.stackptr = 0;
    this.stack = [];
    this.h = 0;
    this.w = 0;
    this.mouseWasDown=false;
  }
  
  update() {
    if (isGroupSelected()) return;
    if (!mouse.leftButton && this.mouseWasDown) {
      this.mouseWasDown = false;
      this.w = map.width;
      this.h = map.height;
      let camera = Camera.getMainCamera();
      // todo: 
      // this.floodFill(
      //    selectedTreeItem, x, y, 
      //    selectedTile.id, 
      //    layer.tileData[this.getIndex(x, y)].id);      
    }
    if (mouse.leftButton) {
      this.mouseWasDown = true;
    }
  }
  
  floodFill(layer, x, y, newTile, oldTile) {
    if (newTile === oldTile) return;
    this.emptyStack();
    var x1, spanAbove, spanBelow, val, index;
    if (this.push(x, y) === undefined) return;
    while ((val = this.pop()) !== undefined) {
      x1=val.x;
      while (x1>=0&&layer.tileData[this.getIndex(x1, y)].id==oldTile)x1--;
      x1++; spanAbove=spanBelow=0;
      while(x1<this.w&&layer.tileData[this.getIndex(x1, y)].id==oldTile){
        layer.tileData[this.getIndex(x1, y)].type = newTile;
        if (!spanAbove&&y>0&&layer.tileData[this.getIndex(x1, y-1)].id==oldTile) {
          if(this.push(x1, y-1) === undefined) return;
          spanAbove=1;
        } else if(spanAbove&&y>0&&layer.tileData[this.getIndex(x1, y-1)].id!=oldTile) {
          spanAbove=0;
        } else if(!spanBelow&&y>h-1&&layer.tileData[this.getIndex(x1, y+1)].id==oldTile) {
          if(this.push(x1,y+1) === undefined) return;
          spanBelow=1;
        } else if(spanAbove&&y>0&&layer.tileData[this.getIndex(x1, y+1)].id!=oldTile) {
          spanBelow=0;
        }                
        x1++;
      }
    }
  }
             
  getIndex(x,y) {
    return y * this.w + x;
 }
  
  pop() {
    if (this.stackptr > 0) {
      let p = this.stack[this.stackptr];
      let x = p / this.h;
      let y = p % this.h;
      this.stackptr--;
      return { x: x, y: y };
    }
    return undefined;
  }
  
  push(x, y) {
    if (this.stackptr < this.stackSize - 1) {
      this.stackptr++;
      this.stack[this.stackptr] = this.h * x + y;
      return true;
    }    
    return undefined;
  }
  
  emptyStack() {
    while(this.pop() !== undefined);
  }
}

class MoveTool {
  constructor() {    
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragCameraStartY = 0;
    this.dragCameraStartX = 0;
  }
  update() {
    if (mouse.leftButton) {
      let camera = Camera.getMainCamera();
      if (!this.isDragging) {
        this.isDragging = true;
        this.dragStartX = mouse.x / ctxScaleX;
        this.dragStartY = mouse.y / ctxScaleY;
        this.dragCameraStartX = camera.viewport.x;
        this.dragCameraStartY = camera.viewport.y;        
      } else {
        camera.viewport.x = this.dragCameraStartX - (this.dragStartX - mouse.x / ctxScaleX);
        camera.viewport.y = this.dragCameraStartY - (this.dragStartY - mouse.y / ctxScaleY);        
      }
    } else {
      this.isDragging = false;
    }    
  }
}

class BrushTool {
  constructor() {    
  }
  update() {
    if (isGroupSelected()||!selectedTile||!selectedTileElement) return;    
    if (mouse.leftButton) { 
      let layer = selectedTreeItem;
      let brush = selectedTile;
      let tileStart = map.getHoverTile();            
      this.paint(layer, tileStart, brush, brushSize);      
    }
    // todo: add undo support?
  }  
  paint(layer, position, brush, size) {    
    if (!brush) return;
    if (position.x < 0 || position.y < 0 || position.x >= layer.width || position.y >= layer.height) 
      return;
    
    for(let y = 0; y < size; ++y)
    for(let x = 0; x < size; ++x) {
      let idx = (position.y+y) * layer.width + (position.x+x);
      if (idx < layer.tileData.length) {
        let tile = layer.tileData[idx];
        tile.id = brush.id;
        tile.tileset = brush.tileset;
      }
    }      
  }
}

class EraserTool {
 constructor() {    
  }
  update() {
    if (isGroupSelected()||!selectedTile||!selectedTileElement) return;    
    if (mouse.leftButton) { 
      let layer = selectedTreeItem;
      let tileStart = map.getHoverTile();            
      this.clear(layer, tileStart, brushSize);      
    }
    // todo: add undo support?
  }  
  clear(layer, position, size) {
    if (position.x < 0 || position.y < 0 || position.x >= layer.width || position.y >= layer.height) 
      return;
    
    for(let y = 0; y < size; ++y)
    for(let x = 0; x < size; ++x) {
      let idx = (position.y+y) * layer.width + (position.x+x);
      if (idx < layer.tileData.length) {
        let tile = layer.tileData[idx];
        tile.id = -1;
        tile.tileset = -1;
      }
    }      
  }
}

class Tileset {
  constructor(id, type, width, height, tileWidth, tileHeight, src) {
    this.id = id;
    this.type = type;
    this.width = width;  // amount of tiles per row
    this.height = height;// amount of rows
    this.tileWidth=tileWidth;
    this.tileHeight = tileHeight;    
    this.tiles = []; // array of TilesetSource
    this.src = src;  // undefined if the source exists in the tiles:TilesetSource
  }
  getTile(id) {
    for(let i = 0; i < this.tiles.length; ++i) {
      if (this.tiles[i].id == id) return this.tiles[i];
    }
    return undefined;
  }
}

class TilesetSource {
  constructor(id, x, y, width, height, src) {
    this.id = id;   // used for identifying which tile it is when drawing
    this.src = src; // should only be defined if we have 1 tile per image
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

function getTilesetById(id, type) {
  for(let i = 0; i < tilesets.length; ++i) {
    if (tilesets[i].id == id && tilesets[i].type == type) return tilesets[i];
  }
  return undefined;
}

const resize = () => {  
  canvas.style.left = "1px";
  canvas.style.top = "33px";
  canvas.width = container.clientWidth-2;
  canvas.height = container.clientHeight-34;  
};      
let toasty = new Audio("https://www.dropbox.com/s/cql3setstbtz9r2/TOASTY%21.mp3?raw=1");
canvas = document.querySelector(".editor"); // needed in the createIso function. Otherwise its not necessary to assign it here
resize();

// let map = Map.create(8, 8);
let map = Map.createIso(8, 8);
createLayer(true);

window.addEventListener('mousewheel', evt => {
  if (activeToolName !== "move") {
    return;
  }      
  let camera = Camera.getMainCamera();
  let scaleChange = evt.wheelDelta/120;  
  var zoom = Math.exp(scaleChange*zoomIntensity);
  ctxScaleX *= zoom;
  ctxScaleY *= zoom;     
});

itemDetailNameInputElement.addEventListener("input", e => {
  if (selectedTreeItem && selectedTreeElement) {
    selectedTreeItem.name = itemDetailNameInputElement.value;    
    selectedTreeElement.innerHTML = itemDetailNameInputElement.value;
  }
}, false);

window.addEventListener("keydown", evt => {
  if (isWindowOpen
      ||isRenamingTreeItem
      ||document.activeElement === itemDetailNameInputElement
      ||document.activeElement === inputBrushSize) return;   
  evt.stopPropagation();
  evt.preventDefault();
  if (evt.which === 0x31) selectEditorTool(tools[0]);  
  if (evt.which === 0x32) selectEditorTool(tools[1]);
  if (evt.which === 0x33) selectEditorTool(tools[2]);
  if (evt.which === 0x34) selectEditorTool(tools[3]);
  if (evt.which === 0x6B || evt.which === 0xAB) zoomIn();
  if (evt.which === 0x6D || evt.which === 0xAD) zoomOut();
  if (evt.altKey) {    
    if (activeToolName !== "move") {
      backToolName = activeToolName;
      selectEditorTool("move");
    }
  }
}, false);

window.addEventListener("keyup", evt => {
  if (isWindowOpen
      ||isRenamingTreeItem
      ||document.activeElement === itemDetailNameInputElement
      ||document.activeElement === inputBrushSize) return;  
  if (!evt.altKey && backToolName !== undefined) {
    selectEditorTool(backToolName);
    backToolName = undefined;    
  }
}, false);

const draw = () => { 
  // ctx.fillRect(...)
  let hoverTile = {x:0, y:0};
  clear("black");   
  ctx.scale(ctxScaleX, ctxScaleY);  
  if (map) {
    map.hoverVisible = activeToolName !== undefined 
          && (activeToolName === "eraser" || activeToolName === "brush");      
    map.draw(); 
    hoverTile = map.getHoverTile();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);  
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText(`${mouse.x}, ${mouse.y}`, 5, 17);
  ctx.fillText(`${hoverTile.x}, ${hoverTile.y}`, 5, 30);
};

const update = () => { 
  // logic here, called just before draw is called  
  if (activeTool) {
    activeTool.update();
  }
    
};

loadTileSets();

setup(".editor", draw, update, resize);

/*
  App and map io functions
*/
function newMap() {  
  showWindow(createMapWindow);
}

function loadMap() {
  showWindow(loadMapWindow);
}
function saveMap() {}
function showSettings() {}
function showAbout() {
  displayToasty();
}

function cancelCreateMap() {  
  closeWindow(createMapWindow);
}
function cancelLoadMap() {
  closeWindow(loadMapWindow);
}
function openMap() {
  closeWindow(loadMapWindow);  
}
function createMap() {
  closeWindow(createMapWindow);  
  let mapType = "top";
  let mapWidth  = parseInt(document.querySelector("#input-map-width").value  || 32)
  let mapHeight = parseInt(document.querySelector("#input-map-height").value || 32);
  for(let radio of document.getElementsByClassName("map-perspective")) {    
    if (radio.checked) {
      mapType = radio.value;
      break;
    }
  }
  if (mapType === "iso") {
    map = Map.createIso(mapWidth, mapHeight);
  } else {
    map = Map.create(mapWidth, mapHeight);
  }
  clearTreeItems();
  createLayer(true);
  buildTileSelectorPage(0);
}

function showWindow(hwnd) {
  hwnd.style.display = "block";
  windowBackgroundTint.style.display = "block";
  isWindowOpen = true;
}

function closeWindow(hwnd) {
  hwnd.style.display = "none";
  windowBackgroundTint.style.display = "none";
  isWindowOpen = false;
}

/*
  Map layer functions
*/
function createLayerGroup() {
  return createTreeItem("group", x => map.createGroup(x)) ;
}

function createLayer(skipRename) {
  return createTreeItem("layer", x => map.createLayer(x),skipRename) ;
}

function createLayerFromItem(item) {
  let l = createLayer(true);
  l.item.name = item.name;
  l.item.visible = item.visible;  
  l.item.properties = item.properties;  
  l.item.tileData   = JSON.parse(JSON.stringify(item.tileData));
  l.node.innerHTML = item.name;  
}

function clearTreeItems() {  
  if (mapTreeElement) {
    mapTreeElement.innerHTML = "";
  }
}

function createTreeItem(type, factory, skipRename) {
  if (!map) return;
  if (isRenamingTreeItem) acceptRenameTreeItem();
  var group;
  var parent = mapTreeElement;
  if (isGroupSelected()) {        
      group = factory(selectedTreeItem);    
      parent = selectedTreeElement.parentElement.querySelector(".children");         
  }
  else { 
    group = factory(); 
  }    
  
  let layerElementWrapper = document.createElement("li");
  layerElementWrapper.classList.add(type);
  layerElementWrapper.setAttribute("data-id", group.id);
  
  let itemNameElement = document.createElement("div");
  itemNameElement.classList.add("item-name");
  itemNameElement.classList.add(type);
  itemNameElement.innerHTML = group.name;
  layerElementWrapper.appendChild(itemNameElement);
  
  let itemVisibilityElement = document.createElement("i");
  itemVisibilityElement.classList.add("item-visibility");
  itemVisibilityElement.classList.add("visible");
  itemVisibilityElement.addEventListener("click", e => {        
    group.visible = !group.visible;    
    if (group.visible) {
      itemVisibilityElement.classList.remove("not-visible");
      itemVisibilityElement.classList.add("visible");
    } else {
      itemVisibilityElement.classList.remove("visible");
      itemVisibilityElement.classList.add("not-visible");      
    }
  }, false);
  layerElementWrapper.appendChild(itemVisibilityElement);
  
  if (type === "group") {
    let childlist = document.createElement("ul");
    childlist.classList.add("children");
    layerElementWrapper.appendChild(childlist);
  }  
 
  itemNameElement.addEventListener("click", e => {     
    e.stopPropagation(); 
    selectTreeItem(group, itemNameElement); 
  }, false);
  
  itemNameElement.addEventListener("dblclick", e => {     
    e.stopPropagation(); 
    showRenameTreeItem(group, itemNameElement); 
  }, false);
  
  parent.appendChild(layerElementWrapper);  
  if (skipRename)
    selectTreeItem(group, itemNameElement);  
  else showRenameTreeItem(group, itemNameElement);
  return {
    item: group,
    node: itemNameElement
  };
}

function showDeleteTreeItemAndChildren(item, elm) {
  if (elm.classList.contains("group")) {
    if (!confirm("Are you sure you want to delete this group and all its children?")) {
        return;
    }    
  }
  else if (!confirm("Are you sure you want to delete this layer?")) {
    return;
  }  
  let index = item.parent.children.indexOf(item);
  if (index === -1) {
    alert("Error removing item!!");
    return;
  }  
  elm.parentElement.parentElement.removeChild(elm.parentElement);  
  item.parent.children.remove(index);  
  setLayerButtonState(false);
  clearSelectionDetails();  
  hideInspector();  
  
  selectedTreeItem = undefined;
  selectedTreeElement = undefined;
}

function selectTreeItem(item, elm) {  
  if (selectedTreeElement === elm) {
    return;
  }
  if (selectedTreeElement !== undefined) {    
    acceptRenameTreeItem();  
    selectedTreeElement.classList.remove("selected");  
  }  
  elm.classList.add("selected");
  selectedTreeElement = elm;
  selectedTreeItem = item; 
  setLayerButtonState(true);
  updateSelectionDetails();
  showInspector();
}

function acceptRenameTreeItem() {
  if (isRenamingTreeItem) {
    isRenamingTreeItem=false;
    let input = selectedTreeElement.querySelector("input");
    if (input) {
      selectedTreeItem.name = input.value;
      selectedTreeElement.innerHTML = input.value;
    }
  }    
}

function showRenameTreeItem(item, elm) {
  if (isRenamingTreeItem && selectedTreeItem === elm) {
    return;
  } else if (isRenamingTreeItem) {
    acceptRenameTreeItem();
  }
  selectTreeItem(item, elm);
  isRenamingTreeItem = true;
  let input = document.createElement("input");
  input.classList.add("name-editor");
  elm.innerHTML = "";      
  input.addEventListener("keydown", evt => {
    if (evt.keyCode === 27) {
      // cancel
      isRenamingTreeItem=false;
      elm.innerHTML = item.name;
      return;
    }
  }, false);
  input.addEventListener("keypress", evt=> {
    if (evt.which === 13) {
      // accept
      isRenamingTreeItem=false;
      item.name = input.value;
      elm.innerHTML = item.name;
      updateSelectionDetails();
      return;
    }
  }, false);
  input.value = item.name;    
  elm.appendChild(input);  
  input.select();
}

function isGroupSelected() {
  return selectedTreeItem && selectedTreeElement.classList.contains("group");
}

function duplicateLayer(btn) {  
  if (btn.getAttribute("disabled")||isGroupSelected()) return;
  if (isRenamingTreeItem) acceptRenameTreeItem();  
  createLayerFromItem(selectedTreeItem);  
  updateSelectionDetails();  
}

function moveLayerUp(btn) {
  if (btn.getAttribute("disabled")) return;  
  if (isRenamingTreeItem) acceptRenameTreeItem();
  let p = selectedTreeItem.parent;
  let i = p.children.indexOf(selectedTreeItem);
  if (i === -1 || i === 0) return;    
  let listItem = selectedTreeElement.parentElement;
  let list     = listItem.parentElement;
  let prev     = listItem.previousSibling;
  let old      = list.removeChild(listItem);
  list.insertBefore(old, prev);  
  let prev2 = p.children[i-1];
  p.children[i] = prev2;
  p.children[i-1] = selectedTreeItem;  
}

function moveLayerDown(btn) {
  if (btn.getAttribute("disabled")) return;  
  if (isRenamingTreeItem) acceptRenameTreeItem();
  let p = selectedTreeItem.parent;
  let i = p.children.indexOf(selectedTreeItem);
  if (i === -1 || i === p.children.length - 1) return;
  let listItem = selectedTreeElement.parentElement;
  let list     = listItem.parentElement;
  let next     = listItem.nextSibling;
  let old      = list.removeChild(next);
  list.insertBefore(old, listItem);  
  let next2 = p.children[i+1];
  p.children[i] = next2;
  p.children[i+1] = selectedTreeItem;  
}

function removeLayerOrGroup(btn) {
  if (btn.getAttribute("disabled")||isRenamingTreeItem) return;
  showDeleteTreeItemAndChildren(selectedTreeItem, selectedTreeElement);
}

function clearSelectionDetails() {
  itemDetailTypeIconElement.className = "";
  itemDetailNameInputElement.value = "";
  hideInspectorTools();
}

function updateSelectionDetails() {
  itemDetailNameInputElement.value = selectedTreeItem.name;
  itemDetailTypeIconElement.className = "";
  itemDetailTypeIconElement.classList.add("item-type-icon");
  itemDetailTypeIconElement.classList.add("fa");
  hideInspectorTools();
  
  if (isGroupSelected()) { 
    itemDetailTypeIconElement.classList.add("fa-folder");    
    showGroupInspectorTools();
  }
  else {
    itemDetailTypeIconElement.classList.add("fa-file");
    updateLayerInspectorTools();
  }
}

function hideInspectorTools() {
  inspectorLayerTools.style.display = "none";
  inspectorGroupTools.style.display = "none";
}

function showGroupInspectorTools() {
  inspectorGroupTools.style.display = "block";
  inspectorLayerTools.style.display = "none";
}

function updateLayerInspectorTools() {
  inspectorGroupTools.style.display = "none";
  inspectorLayerTools.style.display = "block";
  if (activeToolName === "brush") {
    inspectorTileSelector.style.display = "block";
  } else {
    inspectorTileSelector.style.display = "none";
  }
  if (activeToolName === "brush" || activeToolName === "eraser") {
    inspectorBrushSize.style.display = "block";
  } else {
    inspectorBrushSize.style.display = "none";
  }
}

function hideInspector() {
  inspectorPanel.style.display = "none";
  resize();
}

function showInspector() {
  if (inspectorPanel.style.display !== "block") {
    inspectorPanel.style.display = "block";  
    resize();
  }  
}

function setLayerButtonState(enabled) {
  let elms = document.getElementsByClassName("req-layer");
  for(let elm of elms) {
    if (enabled) {
      elm.removeAttribute("disabled");
    } else {
      elm.setAttribute("disabled","disabled");
    }
  }
}

/*
  Map editor functions
*/
function selectEditorTool(tool) {
  document.querySelector("#btn-editor-" + activeToolName).classList.remove("active");
  document.querySelector("#btn-editor-" + tool).classList.add("active");  
  activeToolName = tool;
  switch(tool) {
    case "cursor": 
      activeTool = undefined;
      break;
    case "brush": 
      activeTool = new BrushTool();      
      break;
    case "eraser": 
      activeTool = new EraserTool();
      break;
    case "move": 
      activeTool = new MoveTool();
      break;
    case "fill":
      activeTool = new FillTool();
      break;
  }
  updateLayerInspectorTools();
}

function zoomOut() {
  ctxScaleX-=zoomIntensity;
  ctxScaleY-=zoomIntensity;
}
function zoomIn() {
  ctxScaleX+=zoomIntensity;
  ctxScaleY+=zoomIntensity;  
}

function brushSizeChanged() {
  if (!inputBrushSize) return;  
  brushSize = parseInt(inputBrushSize.value||"1");
  if (brushSize > maxBrushSize) {
    brushSize = maxBrushSize;
    inputBrushSize.value = brushSize;
  }
  if (brushSize <= 0) {
    brushSize = 1;
    inputBrushSize.value = brushSize;
  }
}

/*
  Tile selector functions
*/
function previousTilePage() {
  if (!tilesetPagingForIsoEnabled && map.type == "iso") return; // for now
  selectedTilePage--;
  if (selectedTilePage < 0) selectedTilePage = 0;
  else {
    buildTileSelectorPage(selectedTilePage);
  }
}
function nextTilePage() {
  if (!tilesetPagingForIsoEnabled && map.type == "iso") return; // for now
  selectedTilePage++;
  if (selectedTilePage >= tilePageCount) {
    selectedTilePage = tilePageCount-1;
  } else {
    buildTileSelectorPage(selectedTilePage);
  }
}

function buildTileSelectorPage(page) {
  tileListElement.innerHTML = "";
  if (map.type === "iso") {
    // todo: fix me if we need "proper" isometric tilesets
    //       right now all our tilesets are 1 tile per image, so we will
    //       just iterate all iso-typed tilesets and grab those "one" tiles
    //       and create our tile-selector items
    for(let ts of tilesets) {      
      if (ts.type === map.type) {
        let tileData = ts.tiles[0];       
        tileData.src.setAttribute("data-tileset", ts.id);
        tileData.src.setAttribute("data-type", ts.type);
        tileData.src.setAttribute("data-tile-id", tileData.id);   
        tileData.src.classList.add("selectable-tile");
        tileData.src.classList.add(map.type);
        tileData.src.addEventListener("click", e=>tileClicked(e, ts, tileData, tileData.src), false);
        tileListElement.appendChild(tileData.src);
      }
    }
  } else {    
    let tilesetIteration = 0;
    for(let ts of tilesets) {      
      if (ts.type === map.type) {             
        if (tilesetIteration != page) {
          tilesetIteration++;
          continue;
        }
        for(let tileData of ts.tiles) {          
          let tile = document.createElement("div");
          tile.setAttribute("data-tileset", ts.id);
          tile.setAttribute("data-type", ts.type);
          tile.setAttribute("data-tile-id", tileData.id);   
          tile.classList.add("selectable-tile");
          tile.classList.add(map.type);
          
          tile.addEventListener("click", e=>tileClicked(e, ts, tileData, tile), false);
          tile.style.background =`url('${ts.src.src}') left -${tileData.x}px top -${tileData.y}px`;
          tile.style.width = `${tileData.width}px`;
          tile.style.height = `${tileData.height}px`;
          tileListElement.appendChild(tile);
        }
        return;
      }
    }    
  }
}

function tileClicked(clickEvent, tileset, tiledata, elm) {
  if (selectedTileElement) {
    selectedTileElement.classList.remove("selected");
  }
  selectedTile = {tileset: tileset.id, id: tiledata.id};
  elm.classList.add("selected");
  selectedTileElement = elm;
}

function displayToasty() {
  // play it once only, I'm pretty sure it wont be funny next time :P  
  if (toastyPlayed) return; 
  let toastyImg = document.querySelector(".toasty");  
  toastyPlayed = true;
  toasty.play();
  setTimeout(() => { 
    toastyImg.style.display ="block";
    setTimeout(() => { 
      toastyImg.style.display = 'none'; 
    }, 1500);
  }, 150);
}

function showTilesetLoader() {
  showWindow(loadTilesetWindow);
}

function hideTilesetLoader() {
  closeWindow(loadTilesetWindow);
}

function updateTilesetLoader(current, total) {
  loadTilesetWindowProgressBarValue.style.width = ((current/total) * 370) + "px";
}

function loadTileSets() {
  isLoadingTilesets = true;
  let queue = [];  
    
  tilePageCount = 5;
  for (let i = 0; i < tilePageCount; ++i) {
    queue.push({id:i,type:"top",w:32,h:32});   
  }
  
  for (let i = 0; i < 88; ++i) { // 88
    queue.push({id:i,type:"iso",w:96,h:48});
  }  
  
  tilesetLoadCount = queue.length;    
  showTilesetLoader(); 
  
  tilesetLoadCompleteCount = 0;
  for (let i = 0; i < queue.length; ++i) {
    loadTileSet(queue[i].id,queue[i].type,queue[i].w,queue[i].h, res => { 
      ++tilesetLoadCompleteCount; 
      updateTilesetLoader(tilesetLoadCompleteCount, tilesetLoadCount);
      if(tilesetLoadCompleteCount == queue.length) { 
        isLoadingTilesets = false;
        hideTilesetLoader();
        buildTileSelectorPage(0);        
      }
    });
  }
  
  if (queue.length == 0) {
    isLoadingTilesets = false;
    hideTilesetLoader();
  }
}

function loadTileSet(i, type, tileWidth, tileHeight, completed) {  
  let baseUri = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/163870/";
  let tilesetSource = new Image();
  tilesetSource.src = baseUri + `2d-${type}-${i}.png`;
  if (tilesetSource.complete) {
    let res = addTileSet(i, type, tilesetSource, tileWidth, tileHeight);
    completed(res);
  } else {
    tilesetSource.addEventListener("load", e => {
      let res = addTileSet(i, type, tilesetSource, tileWidth, tileHeight);
      completed(res);
    }, false);
  }  
}

function addTileSet(id, type, src, tileWidth, tileHeight) {
  let isSingleTile = src.width/tileWidth<1.99&&src.height/tileHeight<1.99;
  if(isSingleTile) {
    // (id, x, y, width, height, src)
    let tSrc = new TilesetSource(0, 0, 0, tileWidth, tileHeight, src);
    let tSet = new Tileset(id, type, 1, 1, tileWidth, tileHeight);
    tSet.tiles.push(tSrc);
    tilesets.push(tSet);
    return  tSet;
  } else {    
    let width = src.width/tileWidth;
    let height = src.height/tileHeight;    
    // constructor(id, type, width, height, tileWidth, tileHeight, src)    
    let tSet = new Tileset(id, type, width, height, tileWidth, tileHeight, src);
    for (let y = 0; y < height; ++y)
    for (let x = 0; x < width; ++x)
      tSet.tiles.push(new TilesetSource(y*tileWidth+x, x*tileWidth, y*tileHeight, tileWidth, tileHeight));
    tilesets.push(tSet);    
    return  tSet;
  }  
}