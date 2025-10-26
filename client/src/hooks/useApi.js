// useApi.js - small wrapper hook around client services
import { useState, useEffect, useCallback } from 'react';
import { postService, categoryService } from '../services/api';

export default function useApi() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (page = 1, limit = 10, category = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getAllPosts(page, limit, category);
      setPosts(data.posts || data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const fetchPost = useCallback(async (idOrSlug) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getPost(idOrSlug);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.createPost(postData);
      // optimistic: prepend
      setPosts((p) => [data, ...p]);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const updatePost = useCallback(async (id, postData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.updatePost(id, postData);
      setPosts((p) => p.map((x) => (x._id === data._id ? data : x)));
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const deletePost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await postService.deletePost(id);
      setPosts((p) => p.filter((x) => x._id !== id));
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  // Load categories when the hook is initialized
  useEffect(() => {
    fetchCategories().catch(console.error);
  }, [fetchCategories]);

  return {
    posts,
    categories,
    loading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    fetchCategories,
  };
}
