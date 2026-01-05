import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LanguageStore = {
    language: string;
    setLanguage: (language: string) => void;
};

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            language: 'en-US',
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'language-storage',
        }
    )
);
