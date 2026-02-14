import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="BotNails Logo" 
              className="w-auto h-12 object-contain"
            />
            <span className="text-xl font-display font-semibold text-foreground">
              BotNails
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Suporte
            </a>
          </nav>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Feito com <Heart className="w-4 h-4 text-primary fill-primary" /> para profissionais da beleza
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
