import { Link } from 'react-router-dom';
import { Lightbulb, Mail, Phone, MapPin, Linkedin, Instagram, Cloud } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
                <Lightbulb className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">IluminaCity</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistema completo de Gestão de Iluminação Pública Municipal. 
              Transformando a forma como prefeituras cuidam da iluminação das cidades.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Produto</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Demonstração
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Casos de Sucesso
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Suporte</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/denuncia" className="text-muted-foreground hover:text-primary transition-colors">
                  Fazer Denúncia
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Status do Sistema
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary/60" />
                <a href="mailto:contato@radtecnologia.com.br" className="hover:text-primary transition-colors">
                  contato@radtecnologia.com.br
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary/60" />
                <a href="tel:+5511999999999" className="hover:text-primary transition-colors">
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary/60" />
                <span>
                  São Paulo, SP<br />
                  Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-sm text-muted-foreground">
              IluminaCity © {new Date().getFullYear()} · Sistema integrante da <span className="text-accent font-medium">Plataforma RAD Tecnologia</span>
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-muted-foreground/60">
              <Cloud className="h-3 w-3" />
              <span>Infraestrutura em nuvem AWS</span>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              LGPD
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
