import './App.css';
import {Component} from 'react';
//----------------------------------------------------------------------------------------


//const API_ID = process.env.REACT_APP_API_ID;
fetch('https://city-trie-route.herokuapp.com');
const API_ID = '53484872d9396a19d13a7ef976662159';


class CityField extends Component {
  constructor(props){
    super(props);
    this.state = {
        input: "",
        showList : true,
        active: -1,
        weather: <div className="weather-container"></div>,
        weatherClass: "weather-container"
    };
    this.handleChange = this.handleChange.bind(this);
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.showWeather = this.showWeather.bind(this);
  };
  showWeather(name, country, lat, lng){
    //Show weather and info.
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_ID}`;
    this.setState({input: name, showList: false, weatherClass: "weather-container-hide"});
    fetch(url, {mode: 'cors'})
      .then(res => res.json())
      .then(result =>{
        let x = new Date();
        let h = (((x.getUTCHours() + result['timezone'] / 3600) + 24) % 24);
        let m = x.getMinutes() + (h % 1) * 60; //Some timezone has 0.5 hours offset.
        h += -(h % 1) + (m - m % 60) / 60;
        h = h.toString();
        m %= 60;
        m = m.toString();
        if (m.length < 2){
          m = "0" + m;
        }
        if (h.length < 2){
          h = "0" + h;
        }
        this.setState({
          weather: 
            <div>
              <div className='City-name'>
                {name}, {country}
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
            </div>}, this.setState({weatherClass: "weather-container"}));
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
          let city = document.getElementsByClassName("City-items-active")[0];
          this.showWeather(city.getAttribute('name'), city.getAttribute('country'), city.getAttribute('lat'), city.getAttribute('lng'));
        }
      }
  }
  }
  focus(event){ 
    //Toggle the list to show when focus
    if (this.state.input.length > 0){
      this.setState({showList: true});
    }
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
                  <div style={{ visibility: (this.state.showList ? 'visible' : 'hidden')}}><ListCities focus={this.focus} showWeather={this.showWeather} active={this.state.active} prefix={this.state.input} /></div>
                </div>
                <div className={this.state.weatherClass}>
                  {this.state.weather}
                </div>
              </div>);
  };
};
class ListCities extends Component{
  constructor(props){
    super(props);
    this.state = {
      listIndices: [],
      returnList: []
    }

  }
  componentDidUpdate(prevProps, prevState){
    if (this.props.prefix !== prevProps.prefix){
      if (this.props.prefix.length === 0){
        this.setState({returnList: []});
      }
      else {
      this.updateList();
      }
    }
    else if(this.props.active !== prevProps.active){
      this.computeJsx();
    }
  }
  updateList(){
    //Update the list when the input changes
    fetch(`https://city-trie-route.herokuapp.com/listcities?prefix=${encodeURI(this.props.prefix)}`, {mode: 'cors'}).then(res => res.json()).then(result => this.setState({listIndices: result.data}, this.computeJsx))
  }
  computeJsx(){
    //Compute the jsx if input changes or arrow hover changes.
    let list = this.state.listIndices;
    let ans = [];
    for (let i = 0; i < list.length; i++){
      let city = list[i];
      ans.push(<div className={((this.props.active + 1) % (list.length + 1) + (list.length + 1)) % (list.length + 1)- 1 === i ? "City-items-active" : "City-items"} key={i} lng={city.lng} lat={city.lat} name={city.name} country={city.countryName}  onMouseDown={(e) => this.props.showWeather(city.name, city.countryName, city.lat, city.lng)}>
                    <strong>{city['name'].substring(0, this.props.prefix.length)}
                    </strong>
                    {city['name'].substring(this.props.prefix.length)}, {city['countryName']}
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
class App extends Component {
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
      </a>
      </footer>
    </div>
  )};
}

export default App;
