import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import firebase from "../firebase.js";
import Moment from "react-moment";
import { Notes } from "@material-ui/icons";

class PublicList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: []
    };
  };

  // Get notes upon mount
  componentDidMount() {
    this.props.selectNote(null); // clears note selection upon mount!
    this.getNotes();
  };

  // Get notes provided a new user was selected
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.uid !== this.props.match.params.uid) {
      this.getNotes();
    };
  };

  getNotes = () => {
    const userNode = `${this.props.match.params.node}/${this.props.match.params.uid}`;
    const userRef = firebase.database().ref(userNode);

    userRef.once("value", response => {
      const data = response.val();

      const notesArray = [];

      for (let key in data) {
        notesArray.push({
          id: key,
          title: data[key].title,
          published: data[key].published,
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

  // Method for converting timestamp to YYYY/M/D H:M datetime format
  convertToDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
  };

  render() {
    return (
      <section className="notesList">
        <div className="notesListHeader">
          <h2>Public Feed</h2>
          <div className="toggleView">
            <NavLink to="/"><Notes /> View All My Notes</NavLink>
          </div>
        </div>
        
        <ul>
          {this.state.notes.filter(note => note.published).map(note => {
            return (
              <li key={note.id}>
                <NavLink
                  tabIndex="-1"
                  to={`/${this.props.match.params.node}/${this.props.match.params.uid}/${note.id}`}
                  className="noteLink"
                >
                  <article
                    tabIndex="0"
                    className={`note ${this.props.currentNoteId === note.id ? "selected" : ""}`}
                  >
                    <h3 className="noteTitle">
                      { note.title ? note.title : "New Note" }
                    </h3>
                    <p className="noteCreateDate">Created: <Moment interval={0} date={note.createdTimestamp} format="MMMM D, YYYY" /></p>
                  </article>
                </NavLink>
                </li>
            );
          })}
        </ul>
      </section>
    );
  }
};

export default PublicList;