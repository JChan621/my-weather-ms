import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const wakeUp = async() =>{
  await fetch('https://city-trie-route.herokuapp.com', {mode: 'cors'}).then(res => console.log(res));
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  document.getElementById('root'));
};
/*
//const wakeUp = async funcfetch('https://city-trie-route.herokuapp.com', {mode: 'cors'}).then(res => {
  console.log(res, );
  for (let i = 0; i < 100; i++){
    setTimeout(() => {console.log(i)}, 500);
  }
  ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)});*/
wakeUp();
reportWebVitals();
