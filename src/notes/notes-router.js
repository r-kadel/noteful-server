const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  id: note.id,
  title: xss(note.title),
  content: xss(note.content),
  date_created: note.date_created,
  folder_id: note.folder_id
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, folder_id } = req.body
    const newNote = { title, folder_id }

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    newNote.content = content

    NotesService.insertNote(req.app.get('db'), newNote)
      .then(note => {
        res
          .status(201)
          .location(`/api/notes/${note.id}`)
          .json(serializeNote)
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getNoteById(req.app.get('db'), req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: 'No Such note' }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get('db'), req.params.note_id)
      .then(() => res.status(204).end())
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content, folder_id } = req.body
    const noteToUpdate = { title, content, folder_id }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'content' or 'folder_id'`
        }
      })
    }

    NotesService.updateNote(req.app.get('db'), req.params.note_id, noteToUpdate)
      .then(() => res.status(204).end())
      .catch(next)
  })

module.exports = notesRouter
