import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

const NoteCard = ({ note, setNotes }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e, id) => {
    // Prevent Link navigation and stop propagation so click doesn't bubble to parent Link
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/notes/${id}`);
      // success - remove locally
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success(res.data?.message || "Note deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      if (error.response?.status === 401) {
        toast.error('Not authorized. Please login.');
        navigate('/login');
        return;
      }
      toast.error("Failed to delete note");
    }
    finally {
      setDeleting(false);
    }
  };

  return (
    <Link
      to={`/note/${note._id}`}
      className="card hover:shadow-lg transition-all duration-200 bg-[#B3CBB9] border-t-8 border-solid border-[#B23A48]"
    >
      <div className="card-body">
        <h3 className="card-title text-base-content">{note.title}</h3>
        <p className="text-base-content/70 line-clamp-3">{note.content}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="h-4 w-4" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, note._id)}
              disabled={deleting}
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default NoteCard;