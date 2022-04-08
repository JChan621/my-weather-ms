import './App.css';
import React from 'react';
//import express from 'express';
//import $ from "jquery";
//import { citiesTrie, countriesDict } from './cities_trie.js';
//import { citiesTrie } from './cities_trie.js';
import cities from 'cities.json'; //of length 128769
var citiesTrie = require('./citiesTrie.json');
const NUMBER_OF_KEYS = 91;
var countriesDict = require('countries-list')['countries']; //Sample:{ "AE":{ name: 'United Arab Emirates',  ative: 'دولة الإمارات العربية المتحدة',  phone: '971',  continent: 'AS',  capital: 'Abu Dhabi',  currency: 'AED',  languages: [ 'ar' ],  emoji: '🇦🇪',  emojiU: 'U+1F1E6 U+1F1EA'}};

//----------------------------------------------------------------------------------------
const API_ID = "53484872d9396a19d13a7ef976662159";
//const API_ID = process.env.REACT_APP_API_ID;
const DICT = {"0":53,
              "1":52,"2":31,"3":49,"4":51,"5":38,"6":54,"7":48,"8":32,"9":55," ":0,"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":10,"k":11,"l":12,"m":13,"n":14,"o":15,"p":16,"q":17,"r":18,"s":19,"t":20,"u":21,"v":22,"w":23,"x":24,"y":25,"z":26,"-":27,"‘":28,"’":29,".":30,"`":33,"ß":34,"ı":35,"ə":36,"đ":37,"о":39,"к":40,"т":41,"я":42,"б":43,"р":44,"ь":45,"с":46,"и":47,"œ":50,"ø":56,"æ":57,"س":58,"ي":59,"د":60,"ن":61,"و":62,"ð":63,"у":64,"е":65,"ł":66,"þ":67,"д":68,"н":69,"ч":70,"а":71,"г":72,"п":73,"ш":74,"л":75,"в":76,"ц":77,"ј":78,"м":79,"з":80,"ħ":81,"”":82,"ٍ":83,"ж":84,"ق":85,"ر":86,"ة":87,"ا":88,"ل":89,"م":90};
var listNames = function(trie, searchString) {
    //Converting accents into english equivalents.
    let s = searchString.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let curr = trie;
    for (let i = 0; i < s.length; i++){
      let c = s.charAt(i);
      if (curr[DICT[c]] === undefined){
        //No such prefix
        return [];
      };
      curr = curr[DICT[c]];
    }
    let res = dfs(curr, 10);
    return res;
};
var dfs = function(curr, len){
  //use stack for dfs.
  let stack = [curr];
  let res = [];
  while (stack.length > 0 && res.length < len){
    let child = stack.pop();
    if (child.city){
      for (var i = 0; i < child.city.length; i++){
        res.push(child.city[i]);
        if (res.length === len){
          return res;
        };
      };
    };
    for (let i = NUMBER_OF_KEYS - 1; i >= 0; i--){
      //Starting from the largest index for returning in alphabetical order
      if (i in child){
        stack.push(child[i]);
      };
    };
  };
  return res;
};
//---------------------------------------------------------------



class CityField extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        input: "",
        showList : true,
        active: -1,
    };
    this.handleChange = this.handleChange.bind(this);
    this.blur = this.blur.bind(this); 
    this.focus = this.focus.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.showWeather = this.showWeather.bind(this);
  };
  showWeather(index){
    //Show weather and info.
    this.setState({input: cities[index]['name'],
                   showList: false});
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${cities[index]['lat']}&lon=${cities[index]['lng']}&appid=${API_ID}`;
    fetch(url)
      .then(res => res.json())
      .then(result =>{
        let x = new Date();
        let h = (((x.getUTCHours() + result['timezone'] / 3600) + 24) % 24).toString();
        let m = x.getMinutes().toString();
        if (m.length < 2){
          m = "0" + m;
        }
        if (h.length < 2){
          h = "0" + h;
        }
        this.setState({
          weather: 
            <div className="weather-container">
              <div className='City-name'>
                {cities[index]['name']}, {countriesDict[cities[index]['country']]['name']}
              </div>
              <div className='local-time'>
                {h}:{m}
              </div>
              <div className="temperature">
                {Math.round(result['main']['temp'] - 273)} °C
              </div>
              <div className="humidity">
                Humidity  {result['main']['humidity']}%
              </div>
              <div className="condition">
                {result['weather'][0]['main']}
                <figure><img src={`http://openweathermap.org/img/wn/${result['weather'][0]['icon']}@2x.png`}/></figure>
              </div>
            </div>});
      }).catch(err =>{
        console.log('Error fetching and parsing data', err);
    });
  }
  keyDown(event){
    //Arrow key up and down to navigate through the list
    if(event.keyCode === 40){
      //Arrow up
      event.preventDefault();
       this.setState({active: this.state.active + 1, showList: true});
    }
    else if(event.keyCode === 38){
      //Arrow down.
      event.preventDefault();
      this.setState({active: this.state.active - 1, showList: true});
    }
    else if (event.keyCode === 13){
      //Pressing enter completing the input field and show weather.
      event.preventDefault();
      if (document.getElementsByClassName("City-items-active")[0]){
        this.showWeather(document.getElementsByClassName("City-items-active")[0].getAttribute("id"));
      }
    }
  }
  focus(event){ 
    //Toggle the list to show when focus
    this.setState({showList: true});
  }
  blur(event){
    //Toggle the list to hide when blur
    this.setState({showList: false, active: -1});
  }
  handleChange(event) {
    //set input box value
    this.setState({input: event.target.value, showList: true, active: -1});
  };
  render() {
      return (<div>
                <div className="City" onBlur={this.blur}>
                  <input value={this.state.input} type="text" onKeyDown={this.keyDown} onChange={this.handleChange} onFocus={this.focus} placeholder="City" />
                  <ListCities showWeather={this.showWeather} active={this.state.active} show={this.state.showList} prefix={this.state.input} country=""/>
                </div>
                {this.state.weather}
              </div>);
  };
};
class ListCities extends React.Component{
  constructor(props){
    super(props);
  }
  //MAX_LENGTH = 30;
  render(){
    
    if (this.props.prefix.length === 0 || !this.props.show){
      //No need to create the list if the field is empty
      return (<></>);
    }
    var list;
    if (this.props.country === ""){
      list = listNames(citiesTrie, this.props.prefix);
    }
    else{
      //For future use
    };
    if (list.length === 0){
      //Return nothing if nothing match.
      return (<></>);
    };
    let ans = [];
    for (let i = 0; i < list.length; i++){
      //Allowing user the loop through the list with % (n + 1)
      if (((this.props.active + 1) % (list.length + 1) + (list.length + 1)) % (list.length + 1)- 1 === i){
        ans.push(<div className="City-items-active" key={i} id={list[i]} onMouseDown={(e) => {this.props.showWeather(list[i])}}>
                    <strong>{cities[list[i]]['name'].substring(0, this.props.prefix.length)}
                    </strong>
                    {cities[list[i]]['name'].substring(this.props.prefix.length)}, {countriesDict[cities[list[i]]['country']]['name']}
                    <input type='hidden' value={list[i]}/>
                 </div>);
      }
      else{
        ans.push(<div className="City-items" key={i} id={list[i]} onMouseDown={(e) => {this.props.showWeather(list[i])}}>
                  <strong >{cities[list[i]]['name'].substring(0, this.props.prefix.length)}
                  </strong>
                  {cities[list[i]]['name'].substring(this.props.prefix.length)}, {countriesDict[cities[list[i]]['country']]['name']}
                  <input type='hidden' value={list[i]}/>
                 </div>);
      }
    };
    return(<div className="City-items-container">
            {ans}
           </div>);
    //return <></>;
  }
}
CityField.defaultProps = {"country": ""};

//-------------------------------------------------------------------------------------------------------------------------
/*
class CountryField extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        input: ""
    };
    this.handleChange = this.handleChange.bind(this);
  };
  handleChange(event) {
    this.setState({input: event.target.value});
  };
  render() {
    return (<input value={this.state.input} onChange={this.handleChange} placeholder="Country" />);
  };
};
*/
//--------------------------------------------------------------------------------------------------------
class App extends React.Component {
  constructor(props){
    super(props);
  };
  render() {return(
    <div className="App">
      <header className="App-header">
        <div className="App-title">Weather App</div>
          <CityField/>
        {/*<a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>*/}
      </header>
    </div>
  )};
}

export default App;
