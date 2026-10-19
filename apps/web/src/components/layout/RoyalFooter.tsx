import React from 'react';
import { Link } from 'react-router-dom';
import { MomeraLogo } from '../common/MomeraLogo';
import { GoldDivider } from '../common/GoldDivider';
import { Phone, MessageCircle, MapPin, Clock, Mail, Flame, ShieldCheck, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { usePublicSettings } from '../../context/SettingsContext';

export const RoyalFooter: React.FC = () => {
  const { settings, formatWhatsAppUrl, formatTelUrl } = usePublicSettings();
  return (
    <footer className="bg-[#0c0a09] text-stone-200 pt-16 pb-12 border-t-2 border-[#C8A45D]/40 shadow-[0_-4px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
      {/* Subtle Ancient Temple Backdrop Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(200,164,93,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-600/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Crest & Tagline */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1b1714] border-2 border-[#C8A45D] mb-4 shadow-[0_0_20px_rgba(200,164,93,0.4)] p-2">
            <MomeraLogo variant="emblem" size={44} alt="MIRSTOERA Royal Crest" />
          </div>
          <h2 className="font-serif text-3xl font-black tracking-widest text-amber-100">
            MIRSTOERA
          </h2>
          <p className="font-serif text-base text-[#C8A45D] tracking-widest uppercase mt-1 flex items-center justify-center gap-2">
            <Flame size={14} className="text-amber-500 temple-flame-anim" />
            Every Moment Deserves a Crown.
            <Flame size={14} className="text-amber-500 temple-flame-anim" />
          </p>
          <p className="text-xs text-stone-400 mt-3 font-light leading-relaxed">
            Coimbatore’s premier surprise experience planners. Crafting emotional, cinematic milestones that turn ordinary days into royal memories.
          </p>
          <GoldDivider className="my-6 opacity-60" withCrown={false} />
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left text-sm mb-12">
          {/* Col 1: Experiences */}
          <div>
            <h3 className="font-serif text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-xs text-[#C8A45D]">✦</span>
              Royal Experiences
            </h3>
            <ul className="space-y-2.5 text-xs tracking-wide">
              <li>
                <Link
                  to="/experiences/secret-gift"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Secret Gift Delivery (₹799)
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/mini-proposal"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Mini Movie Proposal (₹1,499)
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/birthday-surprise"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Cinematic Birthday Surprise (₹1,799)
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences/hero-entry"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Cinematic Hero Entry (₹1,299)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-serif text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-xs text-[#C8A45D]">✦</span>
              Explore MIRSTOERA
            </h3>
            <ul className="space-y-2.5 text-xs tracking-wide">
              <li>
                <Link
                  to="/our-story"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Visual Moments Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/book"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Book Your Royal Moment
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Concierge & Coverage Area
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Concierge */}
          <div>
            <h3 className="font-serif text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-xs text-[#C8A45D]">✦</span>
              Direct Concierge
            </h3>
            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-center space-x-2.5">
                <MapPin size={16} className="text-amber-400 shrink-0" />
                <span>{settings.service_coverage}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone size={16} className="text-amber-400 shrink-0" />
                <a href={formatTelUrl()} className="hover:text-amber-300 font-mono">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <MessageCircle size={16} className="text-amber-400 shrink-0" />
                <a
                  href={formatWhatsAppUrl("Hello MIRSTOERA Concierge, I would like to plan a surprise experience.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail size={16} className="text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="font-mono hover:text-amber-300">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Clock size={16} className="text-amber-400 shrink-0" />
                <span>{settings.business_hours}</span>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="pt-4 mt-4 border-t border-stone-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/80 block mb-2">
                Connect With Us:
              </span>
              <div className="flex items-center gap-2.5">
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#1c1815] border border-amber-600/40 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:scale-110 transition-all shadow-sm"
                    title="Follow on Instagram"
                  >
                    <Instagram size={15} />
                  </a>
                )}
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#1c1815] border border-amber-600/40 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:scale-110 transition-all shadow-sm"
                    title="Follow on Facebook"
                  >
                    <Facebook size={15} />
                  </a>
                )}
                {settings.youtube_url && (
                  <a
                    href={settings.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#1c1815] border border-amber-600/40 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:scale-110 transition-all shadow-sm"
                    title="Subscribe on YouTube"
                  >
                    <Youtube size={15} />
                  </a>
                )}
                {settings.twitter_url && (
                  <a
                    href={settings.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#1c1815] border border-amber-600/40 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-amber-100 hover:scale-110 transition-all shadow-sm"
                    title="Follow on X / Twitter"
                  >
                    <Twitter size={15} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Col 4: Legal & Policy */}
          <div>
            <h3 className="font-serif text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="text-xs text-[#C8A45D]">✦</span>
              Trust & Governance
            </h3>
            <ul className="space-y-2.5 text-xs tracking-wide">
              <li>
                <Link
                  to="/privacy"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Privacy Notice & Data Rights
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-stone-300 hover:text-amber-300 transition-colors"
                >
                  Booking Conditions & Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© {new Date().getFullYear()} MIRSTOERA Experiences. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-serif italic text-amber-400/80">
            Handcrafted with devotion in Coimbatore.
          </p>
        </div>
      </div>
    </footer>
  );
};
