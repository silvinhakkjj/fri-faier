import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck, 
  Zap, 
  Trophy, 
  Target, 
  Smartphone, 
  Lock, 
  EyeOff, 
  Monitor, 
  Layers, 
  Settings, 
  Play,
  Star,
  ArrowRight,
  Users,
  X,
  ShoppingCart
} from 'lucide-react';
import { IMAGES, CHECKOUT_LINKS, FAQ_DATA } from './constants';

const BonusCard = ({ icon: Icon, title, description, oldPrice, newPrice }: any) => (
  <div className="card-premium p-4 flex flex-col gap-2 transition-all text-center">
    <div className="flex flex-col items-center gap-2 mb-2">
      <div className="p-2 bg-red-950/50 rounded-lg">
        <Icon className="w-5 h-5 text-red-primary" />
      </div>
      <h3 className="font-bold text-sm text-white uppercase tracking-tight">{title}</h3>
    </div>
    <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
    <div className="mt-auto pt-2 flex items-center justify-center gap-2">
      <span className="text-[10px] line-through text-zinc-500">De R$ {oldPrice}</span>
      <span className="text-[10px] font-bold text-red-bright">por R$ {newPrice}</span>
    </div>
  </div>
);

const Particles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-red-primary/20 rounded-full"
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%",
          opacity: Math.random() * 0.5
        }}
        animate={{ 
          y: [null, "-100%"],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: Math.random() * 10 + 10, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 10
        }}
      />
    ))}
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string, key?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-red-900/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left hover:text-red-bright transition-colors"
      >
        <span className="font-medium text-sm md:text-base text-zinc-300">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-red-primary" /> : <ChevronDown className="w-5 h-5 text-red-primary" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-zinc-500 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [timeLeft, setTimeLeft] = useState(809); // 13:29 in seconds
  const [showUpsell, setShowUpsell] = useState(false);
  const [notification, setNotification] = useState<{ name: string, plan: string } | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const indicatorsRef = useRef<HTMLDivElement>(null);

  const [showStickyButton, setShowStickyButton] = useState(false);

  const lastTracked = useRef<Record<string, number>>({});
  const hasTrackedPageView = useRef(false);

  const getURLParams = React.useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    try {
      const hash = window.location.hash || '';
      const hashContent = hash.includes('?') ? hash.split('?')[1] : hash.replace(/^#\/?/, '');
      if (hashContent.includes('=')) {
        const hashParams = new URLSearchParams(hashContent);
        hashParams.forEach((v, k) => {
          if (v && !params.has(k)) params.set(k, v);
        });
      }
    } catch (e) {
      console.error('[Params Error]', e);
    }
    return params;
  }, []);

  // Tracking Helper
  const trackEvent = React.useCallback((eventName: string, params: any = {}) => {
    try {
      // Safety check: if eventName is an object (e.g. called as onClick={trackEvent}), ignore it
      if (typeof eventName !== 'string') {
        return;
      }

      // Robust sanitization to avoid circular structures (like DOM elements or Events)
      const sanitize = (val: any, depth = 0): any => {
        if (depth > 3) return undefined;
        if (val === null || val === undefined) return val;
        if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') return val;
        
        // Skip DOM elements and Event objects
        if (typeof window !== 'undefined' && (val instanceof HTMLElement || val instanceof Event)) return undefined;
        if (val && typeof val === 'object' && ('nativeEvent' in val || 'target' in val || 'currentTarget' in val)) return undefined;
        
        if (Array.isArray(val)) {
          return val.map(v => sanitize(v, depth + 1)).filter(v => v !== undefined);
        }
        
        if (typeof val === 'object') {
          // Only allow plain objects to avoid circular references in complex objects
          const isPlainObject = val.constructor === Object || val.constructor === undefined;
          if (!isPlainObject) return undefined;
          
          const clean: any = {};
          let hasProps = false;
          for (const k in val) {
            if (Object.prototype.hasOwnProperty.call(val, k)) {
              const v = sanitize(val[k], depth + 1);
              if (v !== undefined) {
                clean[k] = v;
                hasProps = true;
              }
            }
          }
          return hasProps ? clean : {};
        }
        
        return undefined;
      };

      const sanitizedParams = sanitize(params) || {};

      // Auto-include UTMs and other tracking params from URL
      if (typeof window !== 'undefined') {
        const urlParams = getURLParams();
        const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ttclid', 'src', 'sck'];
        trackingKeys.forEach(key => {
          const val = urlParams.get(key);
          if (val && !sanitizedParams[key]) {
            sanitizedParams[key] = val;
          }
        });
      }

      const now = Date.now();
      // Don't throttle critical events
      const isThrottled = !['page_view', 'view_content', 'initiate_checkout', 'upsell_accept', 'upsell_decline'].includes(eventName);
      if (isThrottled && lastTracked.current[eventName] && now - lastTracked.current[eventName] < 2000) {
        return;
      }
      lastTracked.current[eventName] = now;

      if (typeof window !== 'undefined') {
        const fbEvent = {
          'initiate_checkout': 'InitiateCheckout',
          'view_content': 'ViewContent',
          'lead': 'Lead',
          'page_view': 'PageView'
        }[eventName] || eventName;

        // DataLayer (GTM)
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: eventName,
            ...sanitizedParams,
            timestamp: new Date().toISOString()
          });
        }

        // Direct FB Pixel
        if ((window as any).fbq) {
          (window as any).fbq('track', fbEvent, sanitizedParams);
        }

        // Direct Gtag
        if ((window as any).gtag) {
          (window as any).gtag('event', eventName, sanitizedParams);
        }
        
        console.log(`[Tracking] ${eventName}`, sanitizedParams);
      }
    } catch (error) {
      console.error('[Tracking Error]', error);
    }
  }, [getURLParams]);

  const getCheckoutUrl = React.useCallback((baseUrl: string) => {
    try {
      const urlParams = getURLParams();
      
      // Map utm_source to src if src is missing (common for Hotmart/Checkouts)
      if (urlParams.has('utm_source') && !urlParams.has('src')) {
        urlParams.set('src', urlParams.get('utm_source')!);
      }

      const paramsString = urlParams.toString();
      if (!paramsString) return baseUrl;
      
      const separator = baseUrl.includes('?') ? '&' : '?';
      // Handle potential hash in baseUrl
      const [urlWithoutHash, urlHash] = baseUrl.split('#');
      const finalUrl = `${urlWithoutHash}${separator}${paramsString}${urlHash ? '#' + urlHash : ''}`;
      
      console.log(`[Checkout] Redirecting to: ${finalUrl}`);
      return finalUrl;
    } catch (e) {
      console.error('[Checkout URL Error]', e);
      return baseUrl;
    }
  }, [getURLParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowStickyButton(true);
      } else {
        setShowStickyButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Page View Tracking (Once per mount)
    if (!hasTrackedPageView.current) {
      trackEvent('page_view');
      hasTrackedPageView.current = true;
    }

    // Wistia Play Tracking (Mount only)
    const wistiaInit = () => {
      (window as any)._wq = (window as any)._wq || [];
      (window as any)._wq.push({ id: "awrhu4bl2o", onReady: function(video: any) {
        video.bind("play", function() {
          console.log("[Wistia] Video playing, tracking page_view and view_content");
          trackEvent('page_view');
          trackEvent('view_content');
        });
      }});
    };
    
    wistiaInit();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);

  useEffect(() => {
    if (indicatorsRef.current) {
      const activeIndicator = indicatorsRef.current.children[currentIndex] as HTMLElement;
      if (activeIndicator) {
        indicatorsRef.current.scrollTo({
          left: activeIndicator.offsetLeft - indicatorsRef.current.offsetWidth / 2 + activeIndicator.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Social Proof Notification Logic
  useEffect(() => {
    const names = [
      "Gabriel F.", "Lucas M.", "Mateus S.", "Rafael O.", "Bruno C.", "Thiago R.", "Felipe A.", "Gustavo P.", "Vinícius L.", "Rodrigo B.",
      "André W.", "Daniel K.", "Vitor J.", "Leonardo H.", "Eduardo G.", "Ricardo F.", "Guilherme D.", "Alexandre S.", "Marcelo P.", "Fernando V.",
      "Caio T.", "Igor M.", "Renan S.", "Douglas Q.", "Murilo B.", "Samuel L.", "Arthur G.", "João P.", "Pedro H.", "Marcos A.",
      "Ana L.", "Bia S.", "Carla M.", "Julia F.", "Mariana R.", "Amanda C.", "Larissa G.", "Letícia B.", "Beatriz W.", "Camila P.",
      "Isabela D.", "Fernanda S.", "Gabriela K.", "Vanessa M.", "Patrícia R.", "Aline L.", "Jéssica Q.", "Bruna V.", "Natália H.", "Caroline T.",
      "Paulo R.", "Sérgio M.", "Roberto S.", "Cláudio F.", "Antônio G.", "José L.", "Carlos B.", "Luiz P.", "Francisco W.", "Manoel D.",
      "Sebastião S.", "Raimundo M.", "Joaquim R.", "Benedito C.", "Geraldo G.", "Wilson B.", "Ademir L.", "Edson P.", "Valter H.", "Nelson T.",
      "Hugo F.", "Yuri M.", "Enzo S.", "Noah R.", "Liam B.", "Oliver C.", "Benjamin G.", "Elijah L.", "James P.", "William D.",
      "Sophia S.", "Alice M.", "Helena R.", "Laura B.", "Valentina C.", "Isabella G.", "Manuela L.", "Júlia P.", "Lorena D.", "Lívia T.",
      "Giovanna F.", "Maria E.", "Beatriz S.", "Mariana M.", "Larissa R.", "Ana C.", "Letícia G.", "Camila B.", "Rafaela L.", "Amanda P.",
      "Thales G.", "Breno V.", "Calebe R.", "Davi L.", "Erick M.", "Fabrício S.", "George P.", "Heitor B.", "Ítalo F.", "Jonas D.",
      "Kauan T.", "Luan H.", "Mário Q.", "Natan W.", "Otávio K.", "Pietro G.", "Queiroz S.", "Ruan M.", "Saulo R.", "Túlio B."
    ];

    const plans = ["Acesso Básico", "Acesso VIP", "Acesso VIP"]; // Weighted towards VIP

    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomPlan = plans[Math.floor(Math.random() * plans.length)];
      
      setNotification({ name: randomName, plan: randomPlan });
      
      // Hide after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    // Initial delay
    const initialTimeout = setTimeout(showNotification, 10000);

    // Interval every 60 seconds
    const interval = setInterval(showNotification, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.scrollBehavior = 'auto';
    carouselRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (!carouselRef.current) return;
    isDragging.current = false;
    carouselRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    if (!carouselRef.current) return;
    isDragging.current = false;
    carouselRef.current.style.scrollBehavior = 'smooth';
    carouselRef.current.style.cursor = 'grab';
    
    // Snap to closest card after drag
    const index = Math.round(carouselRef.current.scrollLeft / carouselRef.current.offsetWidth);
    setCurrentIndex(index);
    carouselRef.current.scrollTo({
      left: index * carouselRef.current.offsetWidth,
      behavior: 'smooth'
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll speed
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(IMAGES.testimonials.length - 1, currentIndex + 1);
    
    setCurrentIndex(newIndex);
    
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen selection:bg-[#ff2e2e] selection:text-white">
      <Particles />
      {/* Header / Headline */}
      <header className="pt-12 pb-8 px-4 text-center max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-7xl uppercase leading-tight md:leading-none mb-4 font-black"
        >
          Comece a lucrar até <span className="text-brand-red">300 reais</span> por dia com apostados e recupere seu <span className="rect-highlight">investimento</span> ainda hoje.
        </motion.h1>
        <p className="text-sm sm:text-base md:text-lg font-medium text-zinc-400">
          O único painel com <span className="text-brand-red">Modo Oculto</span> real para 2026.
        </p>
      </header>

      {/* VSL Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 px-4 max-w-4xl mx-auto flex flex-col items-center"
      >
        <div className="w-full aspect-video bg-zinc-900 video-highlight video-container-active overflow-hidden relative group">
          <script src="https://fast.wistia.com/player.js" async></script>
          <script src="https://fast.wistia.com/embed/awrhu4bl2o.js" async type="module"></script>
          <style>{`
            wistia-player[media-id='awrhu4bl2o']:not(:defined) { 
              background: center / contain no-repeat url('${IMAGES.thumbnail}'); 
              display: block; 
              filter: blur(5px); 
              padding-top:56.25%; 
            }
          `}</style>
          <wistia-player media-id="awrhu4bl2o" aspect="1.7777777777777777" autoPlay="false"></wistia-player>
        </div>
        <div className="mt-8 flex justify-center w-full">
          <button 
            onClick={() => {
              trackEvent('lead');
              const offersSection = document.getElementById('offers');
              if (offersSection) {
                offersSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="btn-insane btn-main text-white py-5 px-8 rounded-2xl flex items-center justify-center gap-2 w-full max-w-md text-lg"
          >
            <Zap className="w-6 h-6 fill-current" />
            Quero ativar meu acesso agora
          </button>
        </div>
      </motion.section>

      <div className="px-4 max-w-6xl mx-auto">
        <div className="divider" />
      </div>

      {/* Testimonials Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 px-4 max-w-6xl mx-auto"
      >
        <div className="text-center mb-12 px-4">
          <h2 className="text-2xl md:text-4xl uppercase mb-2">
            VEJA QUEM JÁ ESTÁ <span className="text-brand-red">FORRANDO</span> NOS APOSTADOS <span className="rect-highlight">HOJE</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Resultados reais de jogadores que confiam no <span className="text-brand-red">Insane Xiters</span>. Mais de 5.000 clientes satisfeitos.
          </p>
          <div className="flex items-center justify-center gap-1 mt-4 text-yellow-500">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            <span className="text-yellow-500 text-xs ml-2 font-bold">(4.9/5.0)</span>
          </div>
          <p className="text-red-bright text-[10px] mt-2 font-bold animate-pulse">» Arrasta pro lado e veja »</p>
        </div>

        <div className="relative max-w-[320px] md:max-w-6xl mx-auto px-4 group">
            {/* Navigation Arrows */}
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute -left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-900/80 border border-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-red-primary transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-900/80 border border-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-red-primary transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div 
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onDragStart={(e) => e.preventDefault()}
              onScroll={(e) => {
                if (isDragging.current) return;
                const target = e.currentTarget;
                const index = Math.round(target.scrollLeft / target.offsetWidth);
                if (index !== currentIndex) setCurrentIndex(index);
              }}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 cursor-grab active:cursor-grabbing scroll-smooth touch-pan-y"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
            >
              {IMAGES.testimonials.map((src, i) => (
                <div key={i} className="w-full md:w-[300px] shrink-0 px-4 md:px-2 snap-center select-none">
                  <div className="aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800/50 opacity-95 hover:opacity-100 transition-all shadow-2xl shadow-red-900/20 pointer-events-none">
                    <img src={src} alt={`Depoimento ${i+1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" draggable="false" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Indicators (Vertical bars like screenshot) */}
            <div ref={indicatorsRef} className="flex justify-center gap-1 mt-6 overflow-x-auto scrollbar-hide px-4 max-w-full">
              {IMAGES.testimonials.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    setCurrentIndex(i);
                    if (carouselRef.current) {
                      carouselRef.current.scrollTo({
                        left: i * carouselRef.current.offsetWidth,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`w-[2px] h-3 transition-all shrink-0 cursor-pointer hover:bg-red-primary/50 ${currentIndex === i ? 'bg-red-primary h-5' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
          </div>
          
          <p className="text-center text-zinc-500 text-xs mt-12 px-4">
            Mais de 5.000 jogadores já mudaram de nível. Você vai ficar para trás?
          </p>
      </motion.section>

      <div className="px-4 max-w-6xl mx-auto">
        <div className="divider" />
      </div>

      {/* Problem vs Solution */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 max-w-6xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Problem */}
          <div className="card-premium bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-8 h-8 text-red-bright" />
              <h3 className="text-xl uppercase text-white">O <span className="gradient-text">PROBLEMA</span> ATUAL</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Mira puxando para o peito",
                "Capas inconsistentes",
                "Sensibilidade instável",
                "Regedit antigos que pararam de funcionar",
                "Painéis que só pioram a gameplay"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                  <XCircle className="w-4 h-4 text-red-900 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="card-premium bg-zinc-900/40 border border-red-500/20 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-red-primary" />
              <h3 className="text-xl uppercase text-white">A <span className="gradient-text">SOLUÇÃO</span> FFH4X</h3>
            </div>
            <p className="text-sm mb-6 leading-relaxed text-zinc-300">
              O <span className="gradient-highlight">InsaneXiters FFH4X</span> corrige sua mira em tempo real para focar diretamente na cabeça, com máxima precisão e estabilidade.
            </p>
            <ul className="space-y-4">
              {[
                "Mira puxando diretamente para a cabeça",
                "Ajuste de foco em tempo real (Head / Neck / Body)",
                "Gameplay mais \"legit\", sem movimentos estranhos",
                "Compatível apenas com Android"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-red-primary text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-red-bright shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-xl flex items-center gap-3 mt-8">
          <ShieldCheck className="w-6 h-6 text-red-primary shrink-0" />
          <div>
            <p className="text-red-bright font-bold text-sm uppercase">PAINEL ATUALIZADO E FUNCIONANDO HOJE</p>
            <p className="text-xs text-zinc-400">Nosso sistema foi testado e validado na última atualização. Jogue sem medo de ban.</p>
          </div>
        </div>
      </motion.section>

      <div className="px-4 max-w-6xl mx-auto">
        <div className="divider" />
      </div>

      {/* Bonus Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl uppercase mb-4">
            ACESSO COMPLETO PARA <span className="rect-highlight">LUCRAR</span> EM TODOS OS APOSTADOS <span className="text-brand-red">HOJE</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400">
            Ao adquirir o <span className="text-brand-red">Acesso VIP</span>, você não leva apenas o painel. Você recebe um arsenal completo para dominar o jogo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <BonusCard 
                icon={Target} 
                title="Ajuste Avançado de Recuo" 
                description="Sistema de calibração dinâmica que ajusta configurações conforme cada arma, mantendo a jogabilidade natural."
                oldPrice="47,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Trophy} 
                title="FULL VERMELHO PRO VIP" 
                description="Preset premium do painel para maior consistência de capas, com comportamento suave e discreto."
                oldPrice="67,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Layers} 
                title="OBB Lite (Desempenho)" 
                description="Pacote otimizado para reduzir peso, travamentos e consumo desnecessário, priorizando fluidez."
                oldPrice="37,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Star} 
                title="Sensi VIP Exclusiva" 
                description="Configuração de sensibilidade testada e aprovada para grudar na cabeça."
                oldPrice="30,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Settings} 
                title="Preset de Regedit Inteligente" 
                description="A mira que se adapta à sua distância. Nunca mais passe da cabeça em combates de longa distância no 4v4."
                oldPrice="67,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Smartphone} 
                title="SUPER PACK DE TEXTURA 2026" 
                description="As skins e combinações mais insanas com Textura com Efeito e Textura de Punho no Padrão. Tudo otimizado."
                oldPrice="59,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Zap} 
                title="Otimização para Celular" 
                description="Menos uso de RAM, melhor aproveitamento do processador e ajustes para rodar o jogo mais 'liso'."
                oldPrice="47,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Monitor} 
                title="Gráficos Estilo Minecraft" 
                description="Visual simplificado para melhor leitura do cenário e ganho de performance."
                oldPrice="37,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Lock} 
                title="ANT-BAN com proteção" 
                description="Proteção em tempo real que impede a detecção do dispositivo pelo servidor, evitando o banimento."
                oldPrice="97,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={EyeOff} 
                title="MODO OCULTO" 
                description="O painel fica 100% invisível em vídeos ou lives, transmitindo uma tela limpa e sem vestígios."
                oldPrice="67,00"
                newPrice="00,00"
              />
              <BonusCard 
                icon={Play} 
                title="Tutoriais de Instalação" 
                description="Acesso a vídeos detalhados que mostram o passo a passo da instalação e configuração."
                oldPrice="27,00"
                newPrice="00,00"
              />
            </div>

            <div className="mt-12 bg-zinc-900/60 border border-zinc-800/50 p-8 rounded-2xl text-center max-w-xl mx-auto">
              <p className="text-zinc-400 text-sm">Painel InsaneXiters FFH4X: <span className="text-red-primary font-bold">R$ 97,00</span></p>
              <p className="text-zinc-400 text-sm">Todos os Bônus: <span className="text-red-primary font-bold">R$ 552,00</span></p>
              <div className="my-4 h-px bg-zinc-800/50"></div>
              <p className="text-red-bright font-bold">Valor Total: <span className="old-price">R$ 649,00</span></p>
              <h3 className="text-2xl font-black text-white uppercase mt-2">VOCÊ LEVA TUDO POR APENAS</h3>
              <p className="price-money text-6xl mt-2">R$ 29,90</p>
            </div>
      </motion.section>

      <div className="px-4 max-w-6xl mx-auto">
        <div className="divider" />
      </div>

      {/* Offers Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        id="offers" 
        className="py-24 px-4 max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl uppercase mb-4">
            <span className="rect-highlight">LUCRE</span> EM TODOS OS <span className="text-brand-red">APOSTADOS</span>
          </h2>
          <p className="font-medium text-zinc-400">
            Acesso Imediato, pagamento único. Comece a lucrar até <span className="text-brand-red font-bold">300 reais</span> por dia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Basic Offer */}
              <div className="card-premium bg-zinc-900/30 border border-zinc-800/50 p-8 rounded-3xl relative overflow-hidden transition-all text-center">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-zinc-400 uppercase mb-2">Plano Básico</h3>
                  <p className="text-sm text-zinc-500">Acesso essencial ao painel FFH4X.</p>
                </div>

                <div className="relative mb-8 rounded-2xl overflow-hidden border border-zinc-800/50 aspect-square opacity-80">
                  <img src={IMAGES.mockupBasic} alt="Mockup Básico" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="mb-8">
                  <p className="old-price text-sm mx-auto">De R$ 56,00</p>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-4xl font-black text-red-primary">R$ 10,00</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase">Pagamento Único</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {[
                    "Painel FFH4X Atualizado",
                    "Antiban Real-time",
                    "Ajuste de Sensibilidade",
                    "Suporte via E-mail"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-zinc-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => {
                    setShowUpsell(true);
                  }}
                  className="block w-full bg-zinc-800 hover:bg-zinc-700 text-red-primary font-black py-4 rounded-xl text-center transition-all uppercase text-sm tracking-widest cursor-pointer"
                >
                  Escolher Plano Básico
                </button>
              </div>

              {/* Premium Offer */}
              <div className="bg-linear-to-br from-[#0f0f0f] to-[#1a1a1a] border-2 border-[#ff2e2e] p-8 rounded-3xl relative overflow-hidden shadow-[0_0_25px_rgba(255,0,0,0.2)] transform md:scale-105 z-10 text-center vip-card-pulse transition-all duration-300 hover:scale-[1.03] md:hover:scale-[1.08]">
                <div className="absolute top-4 right-4 bg-[#ff2e2e] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                  Mais Popular
                </div>
                
                <div className="mb-8">
                  <div className="flex flex-col items-center justify-center gap-3 text-[#ff2e2e] mb-4">
                    <Trophy className="w-10 h-10 fill-current" />
                    <h3 className="text-2xl font-black uppercase text-white leading-tight">
                      Acesso Completo <br />
                      <span className="highlight">VIP</span>
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-400">O arsenal completo para dominar qualquer partida.</p>
                </div>

                <div className="relative mb-8 rounded-2xl overflow-hidden border border-red-900/20 aspect-square">
                  <img src={IMAGES.mockup} alt="Mockup VIP" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 right-2 w-16 h-16">
                    <img src={IMAGES.guarantee} alt="Garantia" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>

                {/* Scarcity */}
                <div className="mb-8 timer-premium">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-red-bright uppercase tracking-widest">Oferta expira em:</span>
                    <span className="text-sm font-mono font-bold text-red-primary">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-red-950 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / 809) * 100}%` }}
                      className="h-full bg-red-bright shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] mt-2 text-center font-bold urgency-blink">🔥 7 ACESSOS RESTANTES</p>
                </div>

                {/* Highlights from user image */}
                <div className="mb-8 space-y-3">
                  {[
                    {
                      icon: Star,
                      title: "Todos os Bônus Inclusos",
                      description: "Acesso total à versão mais potente do painel e todos os recursos extras."
                    },
                    {
                      icon: Users,
                      title: "Acesso à Área de Membros",
                      description: "Após finalizar a compra é redirecionado imediatamente para a área de membros."
                    },
                    {
                      icon: CheckCircle2,
                      title: "Tutoriais de instalação",
                      description: "Guias passo a passo em vídeo para instalar sem dificuldades."
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-zinc-950/50 border-l-2 border-l-red-primary border-y border-r border-zinc-800/30 rounded-lg text-left shadow-lg">
                      <div className="mt-1">
                        <item.icon className="w-5 h-5 text-red-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <p className="old-price text-sm mx-auto">De R$ 97,00</p>
                  <div className="flex flex-col items-center gap-1">
                    <span className="price-money text-5xl tracking-tighter">R$ 29,90</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase">Pagamento Único</span>
                  </div>
                </div>

                <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-xl mb-8">
                  <p className="text-[10px] text-[#ff2e2e] font-bold leading-relaxed">
                    ⚠️ Atenção: Esse valor de R$ 29,90 é exclusivo para as próximas 7 pessoas. Após isso, o sistema volta automaticamente para R$ 97,00.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    trackEvent('initiate_checkout', { plan: 'premium' });
                    window.location.href = getCheckoutUrl(CHECKOUT_LINKS.premium);
                  }}
                  className="block w-full btn-insane btn-main text-white py-5 rounded-xl text-center mb-8 cursor-pointer"
                >
                  Sim! Quero Amassar nos Apostados
                </button>
              </div>
            </div>
      </motion.section>

      <div className="px-4 max-w-6xl mx-auto">
        <div className="divider" />
      </div>

      {/* Guarantee Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 max-w-4xl mx-auto"
      >
        <div className="bg-[#0f0f0f] border-l-4 border-l-red-600 p-8 rounded-lg flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <img src={IMAGES.guarantee} alt="Garantia 7 Dias" className="w-32 h-32 object-contain shrink-0" referrerPolicy="no-referrer" />
          <div>
            <h3 className="text-2xl uppercase mb-4 tracking-[-0.5px] text-white font-black">RISCO <span className="rect-highlight">ZERO</span> PARA VOCÊ</h3>
            <p className="text-sm leading-relaxed text-zinc-300">
              Sua satisfação é nossa prioridade. Se por qualquer motivo você não ficar satisfeito com os resultados, garantimos <span className="font-black rect-highlight">100% de reembolso</span> do seu investimento em até <span className="text-brand-red font-bold">7 dias</span>. Sem perguntas, sem burocracia.
            </p>
          </div>
        </div>
      </motion.section>

      <div className="px-4 max-w-6xl mx-auto">
        <div className="divider" />
      </div>

      {/* FAQ Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 px-4 max-w-3xl mx-auto"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl text-white text-center uppercase tracking-[-0.5px] mb-16">
            DÚVIDAS <span className="rect-highlight">FREQUENTES</span>
          </h2>
          <div className="space-y-2">
            {FAQ_DATA.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Social Proof Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-50 bg-[#1a1a1a] border border-red-900/40 p-3 pr-6 rounded-xl flex items-center gap-4 shadow-2xl pointer-events-none"
          >
            <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-red-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm leading-tight">{notification.name}</span>
              <span className="text-zinc-500 text-[10px] leading-tight">acabou de comprar o <span className="text-zinc-300">{notification.plan}</span></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buy Button for Mobile */}
      <AnimatePresence>
        {showStickyButton && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-6 md:hidden"
          >
            <button 
              onClick={() => {
                const offersSection = document.getElementById('offers');
                if (offersSection) {
                  offersSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center justify-center gap-3 w-full btn-insane btn-main py-4 rounded-2xl text-white shadow-[0_0_30px_rgba(255,0,0,0.6)] animate-bounce"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span className="font-black uppercase tracking-widest text-sm">Quero Amassar Agora</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4 text-center max-w-6xl mx-auto"
      >
        <h2 className="text-3xl md:text-5xl text-white uppercase tracking-[-0.5px] mb-6">
          INSANE <span className="rect-highlight">XITERS</span>
        </h2>
        <p className="text-xs md:text-sm mb-8 leading-relaxed text-zinc-400">
          A cada atualização, o jogo muda: sensibilidade, estabilidade, gráficos e desempenho. Quem não se adapta, sente na gameplay.
        </p>
        <p className="text-xl md:text-2xl font-black uppercase tracking-tight mb-12">
          <span className="text-white">Controle.</span> <span className="gradient-text">Constância.</span> <span className="rect-highlight">Performance.</span>
        </p>
        <div className="flex justify-center">
          <button 
            onClick={() => {
              const offersSection = document.getElementById('offers');
              if (offersSection) {
                offersSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 btn-insane btn-main text-white py-4 px-10 rounded-xl"
          >
            <Zap className="w-5 h-5 fill-current" />
            Sim! Quero Amassar nos Apostados
          </button>
        </div>
        <div className="mt-20 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
          <p>© 2026 INSANE XITERS. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-red-primary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-red-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </motion.footer>
      {/* Upsell Popup */}
      <AnimatePresence>
        {showUpsell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border-2 border-red-primary max-w-md w-full p-8 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.3)]"
            >
              <button 
                onClick={() => setShowUpsell(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-primary/20 rounded-full mb-4">
                  <Trophy className="w-8 h-8 text-red-primary" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase leading-tight mb-2">
                  ESPERA! <br />
                  <span className="text-red-primary rect-highlight">OFERTA ESPECIAL</span>
                </h3>
                <p className="text-zinc-400 text-sm">
                  Vimos que você escolheu o plano básico. Por apenas mais <span className="text-white font-bold">R$ 9,90</span>, você pode levar o <span className="rect-highlight">PLANO VIP COMPLETO</span> com todos os bônus!
                </p>
              </div>

              <div className="relative mb-6 rounded-2xl overflow-hidden border border-red-900/20 aspect-video">
                <img src={IMAGES.mockup} alt="Mockup VIP" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 mb-8 text-center">
                <p className="text-zinc-500 text-xs line-through mb-1">De R$ 97,00</p>
                <div className="flex flex-col items-center gap-1">
                  <span className="price-money text-5xl tracking-tighter">R$ 19,90</span>
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Acesso Vitalício + Todos os Bônus</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    trackEvent('upsell_accept');
                    trackEvent('initiate_checkout', { plan: 'premium_discounted' });
                    window.location.href = getCheckoutUrl(CHECKOUT_LINKS.premiumDiscounted);
                  }}
                  className="block w-full btn-insane btn-main text-white py-5 rounded-xl text-center font-black uppercase tracking-widest text-sm cursor-pointer"
                >
                  Sim! Quero o VIP por R$ 19,90
                </button>
                <button 
                  onClick={() => {
                    trackEvent('upsell_decline');
                    trackEvent('initiate_checkout', { plan: 'basic' });
                    window.location.href = getCheckoutUrl(CHECKOUT_LINKS.basic);
                  }}
                  className="block w-full text-zinc-500 hover:text-zinc-300 text-center text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Não, prefiro continuar com o plano de R$ 10,00
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-600 font-bold uppercase">
                <ShieldCheck className="w-3 h-3" />
                Pagamento 100% Seguro
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
