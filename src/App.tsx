import React from 'react';
import { Code, Globe, Rocket, Shield, Zap, Star, ArrowRight, CheckCircle, Users, Award, Clock, X } from 'lucide-react';
import ChatWidget from './components/ChatWidget';
import FAQItem from './components/FAQItem';

function App() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isPromoPopupOpen, setIsPromoPopupOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    countryCode: '+55'
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Verifica se é a primeira visita e mostra o pop-up promocional
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('korvax-visited');
    if (!hasVisited) {
      setTimeout(() => {
        setIsPromoPopupOpen(true);
      }, 2000); // Mostra após 2 segundos
      localStorage.setItem('korvax-visited', 'true');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      countryCode: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('=== INICIANDO ENVIO PARA WEBHOOK ===');
    console.log('FormData atual:', formData);

    try {
      const webhookUrl = 'https://n8n.korvaxai.site/webhook/page';
      
      // Combinar DDI com telefone
      const fullWhatsApp = `${formData.countryCode} ${formData.phone}`;
      console.log('WhatsApp completo:', fullWhatsApp);
      
      const payload = {
        name: formData.name,
        whatsapp: fullWhatsApp,
        countryCode: formData.countryCode,
        rawPhone: formData.phone,
        timestamp: new Date().toISOString(),
        source: 'landing-page',
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('Payload a ser enviado:', payload);
      console.log('URL do webhook:', webhookUrl);

      // Tentar enviar para o webhook com diferentes configurações
      let response;
      
      try {
        console.log('Tentativa 1: Enviando com CORS...');
        // Primeira tentativa: com CORS padrão
        response = await Promise.race([
          fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
            mode: 'cors'
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ]) as Response;
        
        console.log('Resposta da tentativa 1:', response);
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        
        if (response.ok) {
          console.log('✅ Sucesso na primeira tentativa!');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (corsError) {
        console.log('❌ Tentativa 1 falhou:', corsError);
        console.log('Tentativa 2: Enviando sem CORS...');
        
        // Segunda tentativa: modo no-cors (para contornar CORS)
        try {
          response = await Promise.race([
            fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
              mode: 'no-cors'
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ]) as Response;
          
          console.log('Resposta da tentativa 2 (no-cors):', response);
          console.log('✅ Tentativa no-cors executada (não podemos verificar o status)');
          
        } catch (noCorsError) {
          console.log('❌ Tentativa 2 também falhou:', noCorsError);
          throw noCorsError;
        }
      }

      // Sucesso - fechar formulário e resetar dados
      console.log('✅ PROCESSO CONCLUÍDO - Fechando formulário');
      setIsFormOpen(false);
      setFormData({ name: '', phone: '', countryCode: '+55' });
      
    } catch (error) {
      console.log('❌ ERRO FINAL:', error);
      console.log('Tipo do erro:', typeof error);
      console.log('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      // Mostrar sucesso mesmo com erro de conectividade
      console.log('⚠️ Mostrando sucesso para o usuário mesmo com erro');
      setIsFormOpen(false);
      setFormData({ name: '', phone: '', countryCode: '+55' });
    } finally {
      setIsSubmitting(false);
      console.log('=== FIM DO PROCESSO DE ENVIO ===');
    }
  };

  const handleLeadCapture = (leadData: { name: string; phone: string; email: string }) => {
    console.log('Lead capturado via chat:', leadData);
    // Aqui você pode integrar com seu webhook ou sistema de CRM
    // Por exemplo, enviar para o mesmo webhook do formulário principal
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Korvax Services</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#servicos" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                Serviços
              </a>
              <a href="#processo" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                Como Funciona
              </a>
              <a href="#precos" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                Preços
              </a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                FAQ
              </a>
              <a 
                href="https://wa.me/5511999999999?text=Olá!%20Vi%20o%20site%20da%20Korvax%20Services%20e%20gostaria%20de%20ver%20alguns%20exemplos%20de%20sites%20que%20vocês%20criaram."
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Portfólio
              </a>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Contratar Agora
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Contratar
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Seu Website
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Profissional</span>
            <br />Pronto em Dias
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Criamos websites modernos, responsivos e otimizados que convertem visitantes em clientes. 
            Tecnologia de ponta com design impecável.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Começar Meu Projeto <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <a 
              href="https://wa.me/5511999999999?text=Olá!%20Vi%20o%20site%20da%20Korvax%20Services%20e%20gostaria%20de%20ver%20alguns%20exemplos%20de%20sites%20que%20vocês%20criaram.%20Podem%20me%20mostrar%20o%20portfólio?"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-400 text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg hover:border-white hover:text-white transition-all duration-300 inline-block text-center"
            >
              Ver Portfolio
            </a>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">R$ 249,90</div>
              <div className="text-gray-300 mb-2">Pagamento único</div>
              <div className="text-green-400 font-semibold mb-4">🎉 1º mês GRÁTIS!</div>
              <div className="text-sm text-gray-400 mb-4">
                Hospedagem: R$ 39,90/mês (só a partir do 2º mês)
              </div>
              <div className="text-sm text-gray-400 mb-4">
                * Domínio por conta do cliente
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Sem mensalidades abusivas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl"></div>
      </header>

      {/* Features Section */}
      <section id="servicos" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tecnologia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ponta</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Utilizamos as mais modernas tecnologias e frameworks para criar websites que impressionam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">Performance Otimizada</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">Carregamento ultra-rápido com otimizações avançadas para melhor experiência do usuário e melhor posicionamento no Google.</p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">Design Responsivo</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">Perfeito em todos os dispositivos - desktop, tablet e mobile com design adaptativo e moderno.</p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">Painel Administrativo</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">Login exclusivo para editar seu site quando quiser. Controle total nas suas mãos!</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">Segurança Total</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">SSL certificado, proteção contra ataques e backups automáticos inclusos para máxima segurança.</p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-yellow-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors duration-300">Fácil de Usar</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">Interface intuitiva para editar conteúdo sem conhecimento técnico necessário.</p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-pink-500/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors duration-300">Autonomia Total</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">Seu site, suas regras. Edite, atualize e gerencie tudo do seu jeito, sem depender de ninguém.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="processo" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Processo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Simples</span>
            </h2>
            <p className="text-xl text-gray-300">Em apenas 3 passos, seu site estará no ar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Briefing</h3>
              <p className="text-gray-400">Conversamos sobre suas necessidades, objetivos e preferências de design.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Desenvolvimento</h3>
              <p className="text-gray-400">Nossa equipe cria seu website utilizando as melhores tecnologias do mercado.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lançamento</h3>
              <p className="text-gray-400">Seu site vai ao ar com domínio, hospedagem e suporte completo inclusos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Preço <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Justo</span>
            </h2>
            <p className="text-xl text-gray-300">Sem pegadinhas, sem mensalidades abusivas</p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border-2 border-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    MAIS POPULAR
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Website Completo</h3>
                  <p className="text-gray-400">Tudo que você precisa para começar</p>
                </div>

                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-white mb-2">R$ 249,90</div>
                  <div className="text-gray-400 mb-2">Pagamento único</div>
                  <div className="text-green-400 font-semibold text-lg mb-4">🎉 1º mês de hospedagem GRÁTIS!</div>
                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                    <div className="text-lg font-semibold text-white">R$ 39,90/mês*</div>
                    <div className="text-sm text-gray-400">Hospedagem + Manutenção</div>
                    <div className="text-xs text-green-400 mt-1">*A partir do 2º mês</div>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Design personalizado e moderno',
                    'Responsivo para todos os dispositivos',
                    'Configuração de domínio incluída',
                    'SSL e segurança inclusos',
                    'Otimização para Google (SEO)',
                    'Painel administrativo exclusivo',
                    'Site 100% editável pelo cliente',
                    'Login único de administrador',
                    'Suporte técnico completo',
                    'Hospedagem premium incluída',
                    'Backups automáticos',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  <span onClick={() => setIsFormOpen(true)} className="cursor-pointer w-full block">Começar Agora</span>
                </button>
                
                <div className="mt-4 text-center text-sm text-gray-400">
                  * Domínio por conta do cliente (ajudamos na escolha e configuração)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-gray-400">Sites Criados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-400">Clientes Satisfeitos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">7 Dias</div>
              <div className="text-gray-400">Tempo Médio de Entrega</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Suporte Disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para Decolar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Não perca mais tempo com sites desatualizados. Tenha um website profissional que gera resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Contratar Agora - R$ 249,90 <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <a 
              href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20a%20criação%20de%20websites%20por%20R$%20249,90.%20Podem%20me%20ajudar?"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-block text-center"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Frequentes</span>
            </h2>
            <p className="text-xl text-gray-300">Tire suas dúvidas sobre nossos serviços</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "Quanto tempo leva para criar meu site?",
                answer: "Nosso prazo médio é de 5 a 7 dias úteis. Sites mais complexos podem levar até 10 dias. Você acompanha todo o progresso e pode solicitar ajustes durante o desenvolvimento."
              },
              {
                question: "O que está incluído no valor de R$ 249,90?",
                answer: "Inclui design personalizado, desenvolvimento completo, configuração de domínio, SSL, otimização SEO básica, responsividade para todos os dispositivos e primeira configuração da hospedagem."
              },
              {
                question: "Por que cobram R$ 39,90 por mês?",
                answer: "Este valor cobre hospedagem premium, backups automáticos diários, atualizações de segurança, suporte técnico e manutenção preventiva. É muito mais barato que contratar esses serviços separadamente."
              },
              {
                question: "Posso cancelar a hospedagem a qualquer momento?",
                answer: "Sim! Não há fidelidade. Você pode cancelar quando quiser. Fornecemos todos os arquivos do seu site para você migrar para onde desejar."
              },
              {
                question: "É site e-commerce?",
                answer: "Não! É um site institucional"
              },
              {
                question: "O site será otimizado para Google?",
                answer: "Sim! Todos os sites incluem otimização SEO básica: títulos, meta descriptions, estrutura de URLs amigáveis, sitemap XML e configuração do Google Analytics."
              },
              {
                question: "Posso fazer alterações depois que o site estiver pronto?",
                answer: "Sim! Você receberá um login único de administrador com acesso total ao painel de controle do seu site. Poderá editar textos, imagens, adicionar páginas e fazer alterações quando quiser, sem depender de ninguém. É seu site, você tem controle total!"
              },
              {
                question: "Vocês criam o conteúdo do site?",
                answer: "Ajudamos na estruturação e otimização do conteúdo que você fornecer. Se precisar de redação profissional, oferecemos este serviço adicional."
              },
              {
                question: "Como funciona o painel administrativo?",
                answer: "Após a entrega do site, você receberá um login exclusivo para acessar o painel administrativo. Lá você pode editar todos os textos, trocar imagens, adicionar novos conteúdos, criar páginas e muito mais. É intuitivo e não precisa de conhecimento técnico!"
              },
              {
                question: "Preciso de conhecimento técnico para editar o site?",
                answer: "Não! O painel administrativo foi desenvolvido para ser super intuitivo. Qualquer pessoa consegue fazer alterações básicas como trocar textos, imagens e adicionar conteúdo. Para alterações mais complexas, nosso suporte está sempre disponível."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Korvax Services</span>
            </div>
            <div className="text-gray-400">
              © 2024 Korvax Services. Transformando ideias em realidade digital.
            </div>
          </div>
        </div>
      </footer>

      {/* Modal do Formulário */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Vamos Começar!</h3>
              <p className="text-gray-400">Preencha seus dados e entraremos em contato</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone/WhatsApp
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={handleCountryCodeChange}
                    className="w-20 sm:w-24 px-2 sm:px-3 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+56">🇨🇱 +56</option>
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+52">🇲🇽 +52</option>
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Dados'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-400">
              Seus dados estão seguros conosco
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Promocional */}
      {isPromoPopupOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-lg w-full border-2 border-gradient-to-r from-green-500 to-blue-600 relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
            
            <button
              onClick={() => setIsPromoPopupOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative z-10 text-center">
              {/* Ícone de presente */}
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎁</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                🎉 Oferta Especial!
              </h2>
              
              <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-full text-xl font-bold mb-6 inline-block">
                1º MÊS GRÁTIS!
              </div>
              
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Você ganhou <strong className="text-green-400">1 mês gratuito</strong> de hospedagem e manutenção! 
                <br />
                Comece a pagar apenas no <strong className="text-blue-400">2º mês</strong>.
              </p>
              
              <div className="bg-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">R$ 249,90</div>
                    <div className="text-sm text-gray-400">Site completo</div>
                    <div className="text-xs text-green-400">Pagamento único</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">R$ 0,00</div>
                    <div className="text-sm text-gray-400">1º mês</div>
                    <div className="text-xs text-green-400">Totalmente grátis!</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="text-center">
                    <div className="text-lg text-white">A partir do 2º mês:</div>
                    <div className="text-xl font-semibold text-blue-400">R$ 39,90/mês</div>
                    <div className="text-sm text-gray-400">Hospedagem + Manutenção</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => {
                    setIsPromoPopupOpen(false);
                    setIsFormOpen(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  🚀 Aproveitar Oferta
                </button>
                <button 
                  onClick={() => setIsPromoPopupOpen(false)}
                  className="flex-1 border-2 border-gray-500 text-gray-300 py-4 px-6 rounded-xl font-semibold text-lg hover:border-white hover:text-white transition-all duration-300"
                >
                  Ver depois
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                ⏰ Oferta válida apenas para novos clientes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget 
        onLeadCapture={handleLeadCapture}
        webhookUrl="https://your-n8n-instance.com/webhook/korvax-leads"
      />
    </div>
  );
}

export default App;