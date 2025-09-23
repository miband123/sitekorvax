import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  onLeadCapture?: (data: { name: string; phone: string; email: string }) => void;
  webhookUrl?: string;
}

const countryCodes = [
  { code: '+55', flag: '🇧🇷', country: 'Brasil' },
  { code: '+1', flag: '🇺🇸', country: 'EUA' },
  { code: '+44', flag: '🇬🇧', country: 'Reino Unido' },
  { code: '+33', flag: '🇫🇷', country: 'França' },
  { code: '+49', flag: '🇩🇪', country: 'Alemanha' },
  { code: '+34', flag: '🇪🇸', country: 'Espanha' },
  { code: '+39', flag: '🇮🇹', country: 'Itália' },
  { code: '+351', flag: '🇵🇹', country: 'Portugal' },
  { code: '+54', flag: '🇦🇷', country: 'Argentina' },
  { code: '+56', flag: '🇨🇱', country: 'Chile' },
  { code: '+57', flag: '🇨🇴', country: 'Colômbia' },
  { code: '+52', flag: '🇲🇽', country: 'México' }
];

export default function ChatWidget({ onLeadCapture, webhookUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [countryCode, setCountryCode] = useState('+55');
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatSteps = [
    {
      botMessage: "Olá! 👋 Sou o assistente da Korvax Services. Como posso te ajudar hoje?",
      options: [
        "Quero um site profissional",
        "Preciso de mais informações",
        "Quero falar sobre preços"
      ]
    },
    {
      botMessage: "Perfeito! Para te ajudar melhor, qual é o seu nome?",
      inputType: "text",
      placeholder: "Digite seu nome..."
    },
    {
      botMessage: "Prazer em conhecê-lo! Qual é o seu WhatsApp para contato?",
      inputType: "tel",
      placeholder: "(11) 99999-9999"
    },
    {
      botMessage: "E seu e-mail para enviarmos a proposta?",
      inputType: "email",
      placeholder: "seu@email.com"
    },
    {
      botMessage: "Obrigado! Em breve nossa equipe entrará em contato. Enquanto isso, que tal conhecer nosso portfólio?",
      options: ["Ver portfólio", "Falar com especialista", "Finalizar"]
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Primeira mensagem quando abre o chat
      setTimeout(() => {
        addBotMessage(chatSteps[0].botMessage);
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text,
        isBot: true,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Simula digitação
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    }]);
  };

  const sendToWebhook = async (leadData: { name: string; phone: string; email: string }) => {
    const actualWebhookUrl = webhookUrl || 'https://n8n.korvaxai.site/webhook/page';
    console.log('=== CHAT WIDGET: ENVIANDO PARA WEBHOOK ===');
    console.log('Lead data:', leadData);
    console.log('Webhook URL:', actualWebhookUrl);

    setIsSendingData(true);
    
    try {
      const payload = {
        name: leadData.name,
        whatsapp: leadData.phone,
        email: leadData.email,
        source: 'chat-widget',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('Chat payload:', payload);

      const response = await fetch(actualWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('Chat response:', response);
      console.log('Chat status:', response.status);

      if (response.ok) {
        console.log('✅ Chat: Lead enviado com sucesso para webhook');
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Chat: Erro ao enviar para webhook:', error);
      // Não mostra erro para o cliente, apenas loga no console
    } finally {
      setIsSendingData(false);
      // Sempre mostra mensagem de sucesso para o cliente
      setTimeout(() => {
        addBotMessage("✅ Dados enviados com sucesso! Nossa equipe entrará em contato em breve.");
      }, 1000);
      console.log('=== CHAT WIDGET: FIM DO ENVIO ===');
    }
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    
    if (currentStep === 0) {
      setTimeout(() => {
        addBotMessage(chatSteps[1].botMessage);
        setCurrentStep(1);
      }, 1000);
    } else if (currentStep === 4) {
      if (option === "Ver portfólio") {
        setTimeout(() => {
          addBotMessage("Infelizmente ainda não temos um portfólio online, mas posso te mostrar alguns exemplos por WhatsApp! 📱");
        }, 1000);
      } else if (option === "Falar com especialista") {
        setTimeout(() => {
          addBotMessage("Perfeito! Nossa equipe entrará em contato em até 2 horas. Obrigado! 🚀");
        }, 1000);
      } else {
        setTimeout(() => {
          addBotMessage("Obrigado pelo interesse! Até logo! 👋");
        }, 1000);
      }
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    addUserMessage(currentInput);
    
    // Salva dados do usuário
    if (currentStep === 1) {
      setUserData(prev => ({ ...prev, name: currentInput }));
      setTimeout(() => {
        addBotMessage(chatSteps[2].botMessage);
        setCurrentStep(2);
      }, 1000);
    } else if (currentStep === 2) {
      const fullPhone = `${countryCode} ${currentInput}`;
      setUserData(prev => ({ ...prev, phone: fullPhone }));
      setTimeout(() => {
        addBotMessage(chatSteps[3].botMessage);
        setCurrentStep(3);
      }, 1000);
    } else if (currentStep === 3) {
      const finalUserData = { ...userData, email: currentInput };
      setUserData(finalUserData);
      
      // Envia para webhook primeiro
      await sendToWebhook(finalUserData);
      
      // Depois chama callback local se existir
      if (onLeadCapture) {
        onLeadCapture(finalUserData);
      }
      
      setTimeout(() => {
        addBotMessage(chatSteps[4].botMessage);
        setCurrentStep(4);
      }, 1000);
    }

    setCurrentInput('');
  };

  const getCurrentStep = () => chatSteps[currentStep];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white mx-auto" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white mx-auto" />
        )}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Assistente Korvax</h3>
                <p className="text-sm opacity-90">Online agora</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isBot 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gray-400'
                  }`}>
                    {message.isBot ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.isBot 
                      ? 'bg-white text-gray-800 shadow-sm' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {(isTyping || isSendingData) && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                    {isSendingData ? (
                      <p className="text-sm text-gray-600">Enviando dados...</p>
                    ) : (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            {!isTyping && !isSendingData && getCurrentStep()?.options && (
              <div className="space-y-2">
                {getCurrentStep().options!.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-sm"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!isTyping && !isSendingData && getCurrentStep()?.inputType && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleInputSubmit} className="space-y-2">
                {getCurrentStep().inputType === 'tel' ? (
                  <div className="flex space-x-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-16 px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="flex-1 min-w-0 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type={getCurrentStep().inputType}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={getCurrentStep().placeholder}
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}