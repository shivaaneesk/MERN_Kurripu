import Note from '../Models/Note.js'

export async function getAllNotes(req, res){
    try{
        const owner = req.userEmail;
        if(!owner) return res.status(401).json({ message: 'Unauthorized' });

        const notes = await Note.find({ owner }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    }
    catch(error){
        console.log("Error in getAllNotes controller :", error);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export async function createNote(req, res){
    try{
        const {title, content} = req.body;
        const owner = req.userEmail;
        if(!owner) return res.status(401).json({ message: 'Unauthorized' });

        const newNote = new Note({title : title, content : content, owner });
        await newNote.save();
        return res.status(201).json({message: "Note Created Successfully", note: newNote});
    }
    catch(error){
        console.log("Error in createNote controller :", error);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export async function updateNote(req, res){
    try{
        const {title, content} = req.body;
        const owner = req.userEmail;
        if(!owner) return res.status(401).json({ message: 'Unauthorized' });

        const note = await Note.findById(req.params.id);
        if(!note) return res.status(404).json({message : "Note Not Found"});
        if(note.owner !== owner) return res.status(403).json({ message: 'Forbidden' });

        note.title = title ?? note.title;
        note.content = content ?? note.content;
        await note.save();
        res.status(200).json({message : "Note Updated Successfully", note});
    }
    catch(error){
        console.log("Error in updateNote controller :", error);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export async function deleteNote(req, res){
    try{
        const owner = req.userEmail;
        if(!owner) return res.status(401).json({ message: 'Unauthorized' });

        const note = await Note.findById(req.params.id);
        if(!note) return res.status(404).json({message : "Note Not Found"});
        if(note.owner !== owner) return res.status(403).json({ message: 'Forbidden' });

    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Note Not Found' });
    res.status(200).json({message : "Note Deleted Successfully", note: deleted});
    }
    catch(error){
        console.log("Error in deleteNote controller :", error);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export async function getNoteById(req, res){
    try{
        const owner = req.userEmail;
        if(!owner) return res.status(401).json({ message: 'Unauthorized' });

        const note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).json({message : "Note Not Found"});
        }
        if(note.owner !== owner) return res.status(403).json({ message: 'Forbidden' });
        res.status(200).json({message : "Note Fetched Successfully", note});
    }
    catch(error){
        console.log("Error in getNoteById controller :", error);
        res.status(500).json({message : "Internal Server Error"});
    }
}