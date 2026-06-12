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
        console.log("getScenes res", res);
      } catch (err) {
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    };
  }, [token]);

  const updateScene = useCallback(
    async (id, inScenes) => {
      try {
        console.log("id", id);
        console.log("inScenes", inScenes);
        const res = await scenesApi.updateScene(id, inScenes, token);
        console.log("updateScene res", res);
      } catch (err) {
        console.log("error from scenes update", err);
        throw new Error(err);
      }
    },
    [token],
  );

  async function refreshData() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await scenesApi.getScenes(token);
        setScenes(Array.isArray(res) ? res : (res?.scenes ?? []));
        return;
      } catch (err) {
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
      }
    }
  }

  return { scenes, updateScene, loading, getScenes, refreshData };
}
