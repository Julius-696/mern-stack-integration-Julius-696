import { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { Link } from 'react-router-dom';

export default function Posts() {
  const { fetchPosts } = useApi();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts()
      .then(data => setPosts(data.posts || data || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [fetchPosts]);

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

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
        <Link
          to="/posts/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Post
        </Link>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/posts/${post._id}`}
            className="block group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden bg-white"
          >
            <div className="p-6">
              <p className="text-sm text-gray-500">{post.category?.name}</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                {post.title}
              </h3>
              <p className="mt-3 text-base text-gray-500 line-clamp-3">
                {post.excerpt || post.content}
              </p>
              <div className="mt-4 flex items-center">
                <div className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
        </div>
      )}
    </div>
  );
}