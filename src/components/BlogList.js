import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Notes } from "@material-ui/icons";

class BlogList extends Component {
  constructor(props) {
    super(props);
  };

  // Method for converting timestamp to YYYY/M/D H:M datetime format
  convertToDate = (timestamp) => {
    const date = new Date(timestamp);
    return `Created: ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
  };

  conditionalPrivateRender = () => {
    return (
      <div className="toggleView">
        <NavLink to="/"><Notes /> Switch to Notes View</NavLink>
      </div>
    );
  };
  
  render() {
    return (
      <section className="notesList">
        <div className="notesListHeader">
          <h2>List of Public Notes</h2>
          {this.conditionalPrivateRender()}
        </div>
        <ul>
          {this.props.notes.filter(note => note.published).map(note => {
            return (
              <li key={note.id}>
                <article
                  className={`note ${this.props.currentNoteId === note.id ? "selected" : ""}`}
                  onClick={() => this.props.selectNote(note.id)}
                >
                  <h3 className="noteTitle">
            { note.published ? <span className="liveIcon">Live: </span> : null }
                    { note.title ? note.title : "New Note" }
                  </h3>
                  <p className="noteText">
                    { note.text ? note.text.substring(0, 20).trim() + (note.text.trim().length > 20 ? "..." : "") : "Empty Note" }
                  </p>
                  <p className="noteCreateDate">{ this.convertToDate(note.createdTimestamp) }</p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
};

export default BlogList;