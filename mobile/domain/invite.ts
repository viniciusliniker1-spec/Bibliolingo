/** Convite para amigos: texto pronto para compartilhar (o link vem de EXPO_PUBLIC_INVITE_URL, quando existir). */
export function inviteMessage({ name, url }: { name?: string; url?: string }) {
  const who = name ? `${name.split(" ")[0]} está` : "Estou";
  const link = url?.trim();
  return [
    `${who} estudando a Bíblia de um jeito divertido no Bibliolingo, com a Lumi! 🐑📖`,
    "Trilhas por livro, ofensiva diária e o Professor Noah para tirar dúvidas. Vem estudar comigo?",
    link ? link : "Procure por Bibliolingo."
  ].join("\n\n");
}
