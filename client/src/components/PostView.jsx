import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

export default function PostView() {
  const { id } = useParams();
  const { fetchPost } = useApi();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPost(id)
      .then((data) => setPost(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id, fetchPost]);

  if (loading) return <div>Loading post...</div>;
  if (error) return <div>Error loading post: {error.message || String(error)}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author?.name || 'Unknown'}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p>Category: {post.category?.name || 'Uncategorized'}</p>
      <p>Views: {post.viewCount || 0}</p>

      <Link to="/">Back to list</Link>
    </article>
  );
}
