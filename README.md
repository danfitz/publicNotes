# Notetaking App

## MVP

Plain-text notetaker with editor section and notes list section. Editor section contains a title input and text input that gets saved to Firebase. Notes list section displays all notes in Firebase and allows you to change the contents of Editor based on which note you choose. (Classic notetaking experience.)

## Stretch Goals

* Firebase authentication
* Rich text editor option
* Markdown editor option

## Pseudocode

1. Inside `App` component, include 2 child components: `NotesList` and `Editor`.
2. `App` component will have a `notes` state that mirrors the Firebase DB using `dbRef.on("value", ...)`.
3. The `notes` state gets passed to `NotesList` as a prop and helps `NotesList` render the full list of notes.
4. When a user clicks on a note in `NotesList`, it updates `currentNote` in `App` state, which then re-renders `Editor` component with contents of selected note.
5. When user edits and saves the current note in `Editor`, it updates the current node in Firebase DB. Otherwise, it creates a new note in Firebase. (This then will update the `notes` state in `App` automatically.)


## Wireframe

[Link](https://wireframepro.mockflow.com/view/M99b6e0cff62de62b6bad6aea21ba8a591566942467360)