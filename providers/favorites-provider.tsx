"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { FavoriteItem, getFavoriteKey, readFavorites, saveFavorites } from "@/lib/favorites";
import { FavoriteList } from "@/lib/types";

interface FavoritesContextValue {
  items: FavoriteItem[];
  lists: FavoriteList[];
  isFavorite: (type: "place" | "trip", id: string) => boolean;
  toggleFavorite: (type: "place" | "trip", id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [lists, setLists] = useState<FavoriteList[]>([]);

  useEffect(() => {
    const state = readFavorites();
    setItems(state.items);
    setLists(state.lists);
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      items,
      lists,
      isFavorite(type, id) {
        return items.some((item) => item.id === id && item.type === type);
      },
      toggleFavorite(type, id) {
        const key = getFavoriteKey(type, id);
        const nextItems = items.some((item) => item.id === id && item.type === type)
          ? items.filter((item) => getFavoriteKey(item.type, item.id) !== key)
          : [...items, { id, type, addedAt: new Date().toISOString() }];

        const nextLists = lists.map((list, index) => {
          if (index !== 0) {
            return list;
          }

          const alreadySaved = list.itemIds.includes(key);
          return {
            ...list,
            itemIds: alreadySaved ? list.itemIds.filter((itemId) => itemId !== key) : [key, ...list.itemIds]
          };
        });

        setItems(nextItems);
        setLists(nextLists);
        saveFavorites({ items: nextItems, lists: nextLists });
      }
    }),
    [items, lists]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
