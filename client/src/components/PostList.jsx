import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

export default function PostList() {
  const { posts, loading, error, fetchPosts } = useApi();

  useEffect(() => {
    fetchPosts().catch(() => {});
  }, [fetchPosts]);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts: {error.message || String(error)}</div>;

  return (
    <div>
      <h2>Posts</h2>
      {posts.length === 0 && <p>No posts yet.</p>}
      <ul>
        {posts.map((p) => (
          <li key={p._id}>
            <Link to={`/posts/${p._id}`}>{p.title}</Link>
            {p.excerpt && <p>{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
