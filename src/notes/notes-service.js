const NotesService = {
   getAllNotes(knex) {
      return knex.select('*').from('noteful_notes')
   },
   getNoteById(knex, id) {
      return knex
         .from('noteful_notes')
         .select('*')
         .where('id', id)
         .first()
   },
   insertNote(knex, newNote) {
      return knex
         .insert(newNote)
         .into('noteful_notes')
         .returning('*')
         .then(rows => rows[0])
   },
   deleteNote(knex, id) {
      return knex('noteful_notes')
         .where({ id })
         .delete()
   },
   updateNote(knex, id, newFields) {
      return knex('noteful_notes')
         .where({ id })
         .update(newFields)
   }
}

module.exports = NotesService