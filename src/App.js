import './App.css';
import React from 'react';
import { citiesTrie, countriesDict } from './cities_trie.js';
import cities from 'cities.json'; //of length 128769
//----------------------------------------------------------------------------------------


const API_ID = process.env.REACT_APP_API_ID;


class CityField extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        input: "",
        showList : true,
        active: -1,
        weather: <div className="weather-container"></div>
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
      list = citiesTrie.listNames(this.props.prefix);
    }
    else{
      //For future use
      //list = countriesTrie.listNames(this.props.prefix);
    };
    if (list.length === 0){
      //Return nothing if nothing match.
      return (<></>);
    };
    let ans = [];
    //ans.push(<div style={this.fontNorm}>asdfsadfaslfsafkjasdlfkjlsafddddddd</div>)
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
  }
}
//CityField.defaultProps = {"country": ""};

//--------------------------------------------------------------------------------------------------------
class App extends React.Component {
  constructor(props){
    super(props);
  };
  render() {return(
    <div className="App">
      <div className="App-header">
        <div className="App-title">Weather App</div>
          <CityField/>
        
      </div>
      <footer>
      <a
          className="github"
          href="https://github.com/fourierz517"
          target="_blank"
          rel="noopener noreferrer">
          GitHub
      </a> | 
      </footer>
    </div>
  )};
}

export default App;
