import './App.css';
import React from 'react';
import cities from 'cities.json';
var countriesDict = require('countries-list')['countries'];
//----------------------------------------------------------------------------------------


//const API_ID = process.env.REACT_APP_API_ID;
const API_ID = '53484872d9396a19d13a7ef976662159';


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
    if (this.state.input.length > 0){
    //Arrow key up and down to navigate through the list, or enter to get the city
      if(event.keyCode === 40 && this.state.input.length > 0){
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
    if (event.target.value === ""){
      this.setState({input: event.target.value, showList: false, active: -1});
    }
    else{
      this.setState({input: event.target.value, showList: true, active: -1});
    }
  };
  render() {
      return (<div>
                <div className="City" onBlur={this.blur}>
                  <input value={this.state.input} type="text" onKeyDown={this.keyDown} onChange={this.handleChange} onFocus={this.focus} placeholder="City" />
                  <div style={{ visibility: (this.state.showList ? 'visible' : 'hidden')}}><ListCities showWeather={this.showWeather} active={this.state.active} prefix={this.state.input} country=""/></div>
                </div>
                {this.state.weather}
              </div>);
  };
};
class ListCities extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      listIndices: [],
      returnList: []
    }

  }
  componentDidUpdate(prevProps, prevState){
    if (this.props.prefix !== prevProps.prefix && this.props.prefix.length > 0){
      this.updateList();
    }
    else if(this.props.active !== prevProps.active){
      this.computeJsx();
    }
  }
  updateList(){
    //Update the list when the input changes
    //this.setState({listIndices: citiesTrie.listNames(this.props.prefix)}, this.computeJsx);
    fetch(`https://city-trie-route.herokuapp.com/listcities?prefix=${this.props.prefix}`).then(res => res.json()).then(result => this.setState({listIndices: result.data}, this.computeJsx))
  }
  computeJsx(){
    //Compute the jsx if input changes or arrow hover changes.
    let list = this.state.listIndices;
    let ans = [];
    for (let i = 0; i < list.length; i++){
      console.log()
      ans.push(<div className={((this.props.active + 1) % (list.length + 1) + (list.length + 1)) % (list.length + 1)- 1 === i ? "City-items-active" : "City-items"} key={i} id={list[i]} onMouseDown={(e) => {console.log(e.type);this.props.showWeather(list[i])}}>
                    <strong>{cities[list[i]]['name'].substring(0, this.props.prefix.length)}
                    </strong>
                    {cities[list[i]]['name'].substring(this.props.prefix.length)}, {countriesDict[cities[list[i]]['country']]['name']}
                    <input type='hidden' value={list[i]}/>
              </div>);
    };
    this.setState({returnList: ans});
  }
  render(){
    return(<div className="City-items-container">
            {this.state.returnList}
           </div>);
  }
}

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
