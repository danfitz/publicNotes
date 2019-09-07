import React, { Component } from 'react';
import firebase from "../firebase.js";
import Editor from "./Editor.js";
import NotesControls from "./NotesControls.js";
import '../styles/App.scss';
import { Fullscreen, FullscreenExit } from "@material-ui/icons";
import { Button } from "@material-ui/core";

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      userNode: null,
      currentNoteId: null,
      notes: [],
      fullScreen: false
    }
  }

  async componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      };
    });

    const userNode = await this.getUserNode();

    this.setState({
      userNode: userNode
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.userNode !== this.state.userNode) {
      // Turn off previous event listener IF there was one before
      if (prevState.userNode) {
        firebase.database().ref(prevState.userNode).off("value");
      };

      // Start new event listener
      const userRef = firebase.database().ref(this.state.userNode);
      
      userRef.on("value", (response) => {
        const data = response.val();
    
        const notesArray = [];
    
        for (let key in data) {
          notesArray.push({
            id: key,
            title: data[key].title,
            text: data[key].text,
            createdTimestamp: data[key].createdTimestamp
          });
        };
    
        // Sort notes by newest created note first
        notesArray.sort((a, b) => a.createdTimestamp < b.createdTimestamp);
        
        this.setState({
          notes: notesArray
        });
      });
    };
  };

  getUserNode = async () => {
    let userNode;

    if (this.state.user) {
      userNode = `users/${this.state.user.uid}`;
    } else {
      const anonymousUser = await firebase.database().ref("anonymous").push("");

      userNode = `anonymous/${anonymousUser.key}`;
    };

    return userNode;
  };

  selectNote = (noteId) => {
    this.setState({
      currentNoteId: noteId
    });
  };

  toggleFullScreen = () => {
    this.setState({
      fullScreen: !this.state.fullScreen
    });
  };

  login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user,
          userNode: `users/${user.uid}`
        });
      });
  };

  logout = () => {
    auth.signOut()
      .then(async () => {
        const userNode = await this.getUserNode();
        this.setState({
          user: null,
          userNode: userNode
          // NEED TO CREATE NEW ANONYMOUS USER AND CHANGE USERNODE
        });
      });
  };

  render() {
    return (
      <div className="app">
        <header className={this.state.fullScreen ? "collapsed" : ""}>
          <div className="wrapper">
            <h1>Public Notes</h1>
            {this.state.user ? <p>Not {this.state.user.displayName}?<br /><br /><Button variant="outlined" color="secondary" onClick={this.logout}>Log Out</Button></p> : <p>Anonymous User<br /><br /><Button variant="outlined" color="primary" onClick={this.login}>Log In</Button></p> }
            <NotesControls
              currentNoteId={this.state.currentNoteId}
              selectNote={this.selectNote}
              notes={this.state.notes}
              userNode={this.state.userNode}
            />
          </div>
        </header>
        <main className={this.state.fullScreen ? "fullScreen" : ""}>
          <div className="wrapper">
            <Editor
              currentNoteId={this.state.currentNoteId}
              selectNote={this.selectNote}
              userNode={this.state.userNode}
            />
          </div>
        </main>
        {this.state.fullScreen ?
          <FullscreenExit className="fullScreenToggle" onClick={this.toggleFullScreen} /> :
          <Fullscreen className="fullScreenToggle" onClick={this.toggleFullScreen} />
        }
      </div>
    );
  };
};

export default App;
