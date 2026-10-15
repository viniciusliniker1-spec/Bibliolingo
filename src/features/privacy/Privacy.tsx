import { Link } from "react-router-dom";

export function Privacy() {
  return (
    <main className="page privacy-page">
      <header className="page-heading">
        <p className="eyebrow">Bibliolingo</p>
        <h1>Política de Privacidade</h1>
        <p>Esta página explica, em linguagem clara, como seus dados são tratados.</p>
      </header>

      <section className="profile-card">
        <h2>Progresso de estudo</h2>
        <p>Seu progresso, preferências, notas, marcações e estatísticas são salvos localmente no aparelho por meio do armazenamento do navegador ou do aplicativo. Você pode exportar um backup pelo Perfil.</p>
      </section>

      <section className="profile-card">
        <h2>Professor Noah</h2>
        <p>Quando você decide enviar uma pergunta ao Professor Noah, o texto da pergunta e o contexto necessário da lição são enviados a um serviço de inteligência artificial de terceiros para gerar a resposta. Não envie informações pessoais ou sensíveis nas perguntas.</p>
      </section>

      <section className="profile-card">
        <h2>Compartilhamento e venda de dados</h2>
        <p>O Bibliolingo não vende seus dados pessoais. Os dados enviados ao serviço de IA são limitados ao necessário para responder à solicitação feita por você.</p>
      </section>

      <section className="profile-card">
        <h2>Contato</h2>
        <p>Para dúvidas sobre privacidade, entre em contato pelo e-mail <strong>[EMAIL_DE_CONTATO]</strong>.</p>
      </section>

      <Link className="secondary-button" to="/profile">Voltar ao Perfil</Link>
    </main>
  );
}
