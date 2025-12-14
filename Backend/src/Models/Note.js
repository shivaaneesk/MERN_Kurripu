import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
    {
        title: {
            type : String,
            required : true
        },
        content: {
            type : String,
            required : true
        }
        ,
        owner: {
            type: String,
            required: true,
            index: true
        }
    },
    {timestamps : true}
);

const Note = mongoose.model('Note', noteSchema);

export default Note;