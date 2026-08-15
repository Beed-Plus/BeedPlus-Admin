import { useState, useEffect, useMemo, useCallback } from "react";
import { scenesApi } from "../utils/scenesApi";

export function useScenes(token) {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getScenes();
  }, [token]);

  const getScenes = useMemo(() => {
    return async () => {
      try {
        const res = await scenesApi.getScenes(token);
        setScenes(Array.isArray(res) ? res : (res?.scenes ?? []));
      } catch (err) {
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    };
  }, [token]);

  const updateScene = async (id, inScenes) => {
    try {
      const res = await scenesApi.updateScene(id, inScenes, token);
    } catch (err) {
      throw new Error(err);
    }
  };

  async function refreshData() {
    try {
      const res = await scenesApi.getScenes(token);
      setScenes(Array.isArray(res) ? res : (res?.scenes ?? []));
    } catch (err) {
      throw new Error(err);
    }
  }

  return { scenes, updateScene, loading, getScenes, refreshData };
}
