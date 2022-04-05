//import logo from './logo.svg';
import './App.css';
import React from 'react';
import {countriesTrie, citiesTrie, countriesDict} from './cities_trie.js';
import cities from 'cities.json'; //of length 128769
//----------------------------------------------------------------------------------------


class CityField extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        input: "",
        showList : true,
        active: -1
    };
    this.handleChange = this.handleChange.bind(this);
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.keyDown = this.keyDown.bind(this);
  };
  keyDown(event){
    //Arrow key up and down to navigate through the list
    if(event.keyCode == 40){
      event.preventDefault();
       this.setState({active: this.state.active + 1});
    }
    else if(event.keyCode == 38){
      event.preventDefault();
      this.setState({active: this.state.active - 1});
    }
  }
  focus(event){ 
    //Toggle the list to show
    this.setState({showList: true});
  }
  blur(event){
    //Toggle the list to hide.
    this.setState({showList: false, active: -1});
  }
  handleChange(event) {
    //set the class
    this.setState({input: event.target.value, active: -1});
  };
  render() {
    
      return (<div className="City"><input value={this.state.input} type="text" onKeyDown={this.keyDown} onChange={this.handleChange} onBlur={this.blur} onFocus={this.focus}
       placeholder="City" /><ListCities active={this.state.active} show={this.state.showList} prefix={this.state.input} country=""/></div>);
  };
};
class ListCities extends React.Component{
  constructor(props){
    super(props);
  }
  fontWeight = {fontWeight: 900};
  fontNorm = {fontWeight: 100}
  MAX_LENGTH = 30;
  render(){
    
    if (this.props.prefix.length === 0 || !this.props.show){
      return (<></>);
    }
    var list;
    if (this.props.country === ""){
      list = citiesTrie.listNames(this.props.prefix);
    }
    else{
      list = countriesTrie.listNames(this.props.prefix);
    };
    if (list.length === 0){
      return (<></>);
    };
    let ans = [];
    //ans.push(<div style={this.fontNorm}>asdfsadfaslfsafkjasdlfkjlsafddddddd</div>)
    for (let i = 0; i < list.length; i++){
      if (((this.props.active + 1) % (list.length + 1) + (list.length + 1)) % (list.length + 1)- 1 == i){
        ans.push(<div className="City-items-active" id={list[i]} style={this.fontNorm}><strong style={this.fontWeight}>{cities[list[i]]['name'].substring(0, this.props.prefix.length)}
                </strong>{cities[list[i]]['name'].substring(this.props.prefix.length) + 
                ", " + countriesDict[cities[list[i]]['country']]['name']}<input type='hidden' value={list[i]}/></div>);
      }
      else{
        ans.push(<div id={list[i]} style={this.fontNorm}><strong style={this.fontWeight}>{cities[list[i]]['name'].substring(0, this.props.prefix.length)}
                  </strong>{cities[list[i]]['name'].substring(this.props.prefix.length) + 
                  ", " + countriesDict[cities[list[i]]['country']]['name']}<input type='hidden' value={list[i]}/></div>);
      }
    };
    return(<div className="City-items">{ans}</div>);
    //return <></>;
  }
}
CityField.defaultProps = {"country": ""};

//-------------------------------------------------------------------------------------------------------------------------

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

//--------------------------------------------------------------------------------------------------------
class App extends React.Component {
  constructor(props){
    super(props);
  };
  render() {return(
    <div className="App">
      <header className="App-header">
        {/*<img src={logo} className="App-logo" alt="logo" />*/}
          Edit <code><CityField/></code> and save to reload.
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
