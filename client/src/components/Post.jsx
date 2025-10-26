import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPost, deletePost } = useApi();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id, fetchPost]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost(id);
      navigate('/');
    } catch (err) {
      setError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 max-w-7xl mx-auto mt-8">
        <div className="text-sm text-red-700">{String(error)}</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="text-sm text-gray-500 uppercase tracking-wide">
          {post.category?.name}
        </div>
        <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3 text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-8 prose prose-indigo prose-lg text-gray-500 mx-auto">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => navigate(`/posts/${id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </article>
  );
}