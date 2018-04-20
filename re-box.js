'use srtict';

/**
 * rebox like lightbox script
 * 
 * v0.1
 * author   : waiya
 * browser  : IE11 / Edge / Chrome 65.0.33~ / FireFox
 */
var rebox = {

  // ------ params
  _pn: 're-box',
  items: [],
  imgs: {
    ids:[],
    srcs:{}
  },
  selector: '',
  createDivs: [
    { class: 'bgLayer' },
    { class: 'imgbox' },
  ],
  options: {
    data: 're-box',
  },
  
  // ------ init
  init: function(imgArray){
    this.selector = '[data-'+this.options.data+']';
    if(imgArray != undefined){
      this.imgs = imgArray;
    }
    this.items = document.querySelectorAll(this.selector);
    this.addClick();
  },

  // ------ events
  addClick: function(){
    var self = this;
    var imgsetFlg = false;
    if(self.imgs.ids.length > 0){
      imgsetFlg = true;
    }
    for(var i=0;i<self.items.length;i++){
      var preimg = document.createElement('img');
      preimg.src = self.items[i].href;
      if(!imgsetFlg){
        // 画像の順序配列
        self.imgs['ids'][i] = self.items[i].getAttribute('data-'+self.options.data);
        self.imgs['srcs'][self.items[i].getAttribute('data-'+self.options.data)] = self.items[i].href;
      }
      self.items[i].addEventListener('click',function(e){
        e.preventDefault();
        self.openBox(this);
      });
    }

    // create div
    for(var i=0;i<self.createDivs.length;i++){
      self._createElm(document.body,'div',self.createDivs[i].class);
    }

  },

  openBox: function(e){
    var bgLayer = document.querySelector('.'+this._pn+'__bgLayer'),
        imgbox = document.querySelector('.'+this._pn+'__imgbox');
    bgLayer.classList.add('overlay');
    imgbox.classList.add('overlay');
    this._createPhoto(imgbox,e.href,e.getAttribute('data-re-box'));

    document.body.style.transitionDelay = '.3s';
    document.body.style.top = window.pageYOffset+'px';
    document.body.style.position = 'fixed';
  },

  closeBox: function(e){
    var bgLayer = document.querySelector('.'+this._pn+'__bgLayer'),
        imgbox = document.querySelector('.'+this._pn+'__imgbox'),
        largeimg = document.querySelector('.'+this._pn+'__largeimg');
    bgLayer.classList.remove('overlay');
    imgbox.classList.remove('overlay');
    imgbox.innerHTML = "";
    
    document.body.style.top = 0;
    document.body.style.transitionDelay = '';
    document.body.style = 'position:static;';
  },

  nextImgBox: function(selector){
    var self = this;
    document.querySelector(selector).addEventListener('click',function(e){
      e.preventDefault();
      var nodes,next,parent;
      nodes = document.querySelectorAll('.'+self._pn+'__imgboxInner li');
      document.querySelector('.'+self._pn+'__imgboxInner').removeChild(nodes[0]);
      //nodes[0].remove();
      next = self._getNextImg(nodes[2].children[0].getAttribute('data-imgid'));
      self._createNextPhoto(next);
      self._closeActive();
    });
  },

  prevImgBox: function(selector){
    var self = this;
    document.querySelector(selector).addEventListener('click',function(e){
      e.preventDefault();
      var nodes,prev,parent;
      nodes = document.querySelectorAll('.'+self._pn+'__imgboxInner li');
      prev = self._getPrevImg(nodes[0].children[0].getAttribute('data-imgid'));
      self._createPrevPhoto(prev);
      document.querySelector('.'+self._pn+'__imgboxInner').removeChild(nodes[2]);
      //nodes[2].remove();
      self._closeActive();
    });
  },


  // ----- private func
  _createElm: function(target,tag,className){
    var self = this,
        elm = document.createElement(tag);

    elm.classList.add('re-box__'+className);
    target.appendChild(elm);

    if(self.createDivs[1].class == className && className != 'imgbox'){
      document.querySelector(closeTarget).addEventListener('click',function(e){
        e.preventDefault();
        self.closeBox();
      });
    }
  },

  _createNextPhoto: function(next){
    var self = this,
        li = document.createElement('li');
    li.innerHTML = '<img src="'+next.src+'" alt="" data-imgid="'+next.imgid+'">';
    document.querySelector('.'+self._pn+'__imgboxInner').appendChild(li);
  },

  _createPrevPhoto: function(prev){
    var self = this,
        li = document.createElement('li'),
        imgInner = document.querySelector('.'+self._pn+'__imgboxInner');
    li.innerHTML = '<img src="'+prev.src+'" alt="" data-imgid="'+prev.imgid+'">';
    imgInner.insertBefore(li,imgInner.firstChild);
  },

  _createPhoto: function(target,src,imgid){
    var self = this,
        pnimg = this._getImgIndex(imgid),
        elm = '<ul class="'+self._pn+'__imgboxInner">'
            + '<li><img src="'+pnimg['prev']['src']+'" class="'+self._pn+'__previmg" data-imgid="'+pnimg['prev']['imgid']+'"></li>'
            + '<li><img src="'+src+'" alt="" class="'+self._pn+'__largeimg" data-imgid="'+imgid+'"></li>'
            + '<li><img src="'+pnimg['next']['src']+'" class="'+self._pn+'__nextimg" data-imgid="'+pnimg['next']['imgid']+'"></li>'
            + '</ul>'
            + '<a href="#" class="'+self._pn+'__arrow '+self._pn+'__prev"><span></span></a>'
            + '<a href="#" class="'+self._pn+'__arrow '+self._pn+'__next"><span></span></a>';

    target.innerHTML = elm;
    
    self._closeActive();
    self.prevImgBox('.'+self._pn+'__prev');
    self.nextImgBox('.'+self._pn+'__next');
  },

  _getImgIndex: function(imgid){
    var img = {
          prev:{},
          next:{},
        },
        previd,nextid,
        maxindex = this.imgs['ids'].length - 1;
    
    if(this.imgs['ids'].indexOf(imgid) != 0){
      previd = this.imgs['ids'][this.imgs['ids'].indexOf(imgid)-1];
    } else {
      previd = this.imgs['ids'][maxindex];
    }

    if(this.imgs['ids'].indexOf(imgid) != maxindex){
      nextid = this.imgs['ids'][this.imgs['ids'].indexOf(imgid)+1];
    } else {
      nextid = this.imgs['ids'][0];
    }

    img['prev']['imgid'] = previd;
    img['prev']['src'] = this.imgs['srcs'][previd];
    img['next']['imgid'] = nextid;
    img['next']['src'] = this.imgs['srcs'][nextid];
    return img;
  },

  _getNextImg: function(imgid){
    var img = {},
        getid,
        maxindex = this.imgs['ids'].length - 1;

    if(this.imgs['ids'].indexOf(imgid) != maxindex){
      getid = this.imgs['ids'][this.imgs['ids'].indexOf(imgid)+1];
    } else {
      getid = this.imgs['ids'][0];
    }

    img['imgid'] = getid;
    img['src'] = this.imgs['srcs'][getid];
    return img;
  },

  _getPrevImg: function(imgid){
    var img = {},
        getid,
        maxindex = this.imgs['ids'].length - 1;

    if(this.imgs['ids'].indexOf(imgid) != 0){
      getid = this.imgs['ids'][this.imgs['ids'].indexOf(imgid)-1];
    } else {
      getid = this.imgs['ids'][maxindex];
    }

    img['imgid'] = getid;
    img['src'] = this.imgs['srcs'][getid];
    return img;
  },

  _closeActive: function(){
    var self = this,
        reboxs = document.querySelectorAll('.'+self._pn+'__imgboxInner li');
    
    Array.prototype.slice.call(reboxs).map(function(e,i){
      if(i == 1){
        e.children[0].addEventListener('click',function(e){
          e.preventDefault();
          self.closeBox();
        });
      }
    });
  }
}

// init
rebox.init(window.reboxArray);


/**
 * usage
 * 
 * <a href="upimg" data-rebox="[IMG_ID]"><img src="xxx.jpg" alt=""></a>
 */