import React from "react";

function NotesList(props) {
  return (
    <aside className="notesList">
      <h2>List of Notes</h2>
      <ul className="notes">
        {props.notes.map(note => {
          return (
            <li
              key={note.id}
              className="note"
              onClick={() => props.onNoteClick(note.id)}
            >
              <h3>
                { note.title ? note.title : "Untitled Note" }
              </h3>
              <p>
                { note.body ? note.body : "Empty Note" }
              </p>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default NotesList;