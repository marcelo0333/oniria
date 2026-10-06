export const DREAM_TYPES = [
  { value: "lucid", label: "Lúcido" },
  { value: "adventure", label: "Aventura" },
  { value: "fantasy", label: "Fantasia" },
  { value: "nightmare", label: "Pesadelo" },
  { value: "recurring", label: "Recorrente" },
  { value: "prophetic", label: "Sensação de premonição" },
] as const;

export const DREAM_EMOTIONS = [
  { value: "calm", label: "Calma" },
  { value: "happy", label: "Alegria" },
  { value: "intense", label: "Intensidade" },
  { value: "comfortable", label: "Conforto" },
  { value: "sad", label: "Tristeza" },
  { value: "anxious", label: "Ansiedade" },
  { value: "fear", label: "Medo" },
  { value: "wonder", label: "Encantamento" },
] as const;

export const typeLabel = (v: string) => DREAM_TYPES.find((t) => t.value === v)?.label ?? v;
export const emotionLabel = (v: string) => DREAM_EMOTIONS.find((t) => t.value === v)?.label ?? v;

export const DISCLAIMER = "Conteúdo para entretenimento e autoconhecimento. Não substitui aconselhamento médico, psicológico, jurídico ou financeiro.";
export const SITE_NAME = "Oniria";
export const SITE_DESCRIPTION = "Interprete seus sonhos com IA, descubra seu mapa astral, tarot, numerologia e horóscopo diário em português. Seu santuário de sonhos e astros.";
