import cities from 'cities.json'; //of length 128769

var countriesDict = require('countries-list')['countries']; //Sample:{ "AE":{ name: 'United Arab Emirates',  ative: 'دولة الإمارات العربية المتحدة',  phone: '971',  continent: 'AS',  capital: 'Abu Dhabi',  currency: 'AED',  languages: [ 'ar' ],  emoji: '🇦🇪',  emojiU: 'U+1F1E6 U+1F1EA'}};

const DICT = {"0":53,
              "1":52,"2":31,"3":49,"4":51,"5":38,"6":54,"7":48,"8":32,"9":55," ":0,"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":10,"k":11,"l":12,"m":13,"n":14,"o":15,"p":16,"q":17,"r":18,"s":19,"t":20,"u":21,"v":22,"w":23,"x":24,"y":25,"z":26,"-":27,"‘":28,"’":29,".":30,"`":33,"ß":34,"ı":35,"ə":36,"đ":37,"о":39,"к":40,"т":41,"я":42,"б":43,"р":44,"ь":45,"с":46,"и":47,"œ":50,"ø":56,"æ":57,"س":58,"ي":59,"د":60,"ن":61,"و":62,"ð":63,"у":64,"е":65,"ł":66,"þ":67,"д":68,"н":69,"ч":70,"а":71,"г":72,"п":73,"ш":74,"л":75,"в":76,"ц":77,"ј":78,"м":79,"з":80,"ħ":81,"”":82,"ٍ":83,"ж":84,"ق":85,"ر":86,"ة":87,"ا":88,"ل":89,"م":90};
const NUMBER_OF_KEYS = 91//Object.keys(DICT).length;
class Trie {
  constructor (){
    this.head = {};
    this.insert = this.insert.bind(this);
    this.dfs = this.dfs.bind(this);
    this.listNames = this.listNames.bind(this);
  }
  insert (name_o, index) {
    let name = name_o.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\[\]\{\}\(\)\/\,']+/g, "").toLowerCase();
    let curr = this.head;
    let l = name.length;
    for (let i = 0; i <(l); i++){
      let c = name.charAt(i).toLowerCase();
      if (!curr.children){
        curr.children = {};
      }
      if (!(DICT[c] in curr.children)){
        curr.children[DICT[c]] = {};
      };
      curr = curr.children[DICT[c]];
    };
    if (curr.city){ //There are distinct cities with the same names.
      curr.city.push(index);
    }
    else{
      curr.city = [index];
    }
  };
  dfs (curr, len){
    let stack = [curr];
    let res = [];
    while (stack.length > 0 && res.length < len){
      let child = stack.pop();
      if (child.city){
        for (var i = 0; i < child.city.length; i++){
          res.push(child.city[i]);
          if (res.length == len){
            return res;
          };
        };
      };
      for (let i = NUMBER_OF_KEYS - 1; i >= 0; i--){
        if (child.children && i in child.children){
          stack.push(child.children[i]);
        };
      };
    };
    return res;
  };
  listNames (searchString) {
    let s = searchString.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let curr = this.head;
    for (let i = 0; i < s.length; i++){
      let c = s.charAt(i);
      if (curr.children[DICT[c]] == undefined){
        return [];
      };
      curr = curr.children[DICT[c]];
    }
    let res = this.dfs(curr, 10);
    return res;
  };
};

//---------------------------------------------------

var citiesTrie = new Trie();
//var countriesTrie = new Trie();
/*
for (let item in countriesDict){
  countriesDict[item]['cities'] = new Trie();//new Array()
  countriesTrie.insert(countriesDict[item]['name'], item);
};*/
for (let i = 0; i < cities.length; i++){
  citiesTrie.insert(cities[i]["name"], i);
  countriesDict[cities[i]['country']]["cities"].insert(cities[i]["name"]);//push(....);
};

//-----------------------------------------
/*
if (require.main === module) {
  while (true){
    var input = prompt('String: ');
    var list = citiesTrie.listNames(input);
    for (var i = 0; i < list.length; i++){
      console.log(cities[list[i]]['name'], ', ',countriesDict[cities[list[i]]['country']]['name']);
    };
};

};
//module.exports = [countriesTrie, citiesTrie, countriesDict];*/

export {citiesTrie, countriesDict};