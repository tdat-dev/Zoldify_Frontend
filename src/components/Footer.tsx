"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();

  return (
    <>
      {/* Footer - hiện trên cả mobile; pb-20 để không bị bottom nav che */}
      <footer className="bg-surface-card border-t border-ink/10 py-[30px] pb-24 md:pb-[30px]">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 py-4 md:py-[30px]">
            {/* Service */}
            <div>
              <h3 className="font-bold text-small text-ink mb-4 uppercase tracking-wide">{t('buyAndSell')}</h3>
              <ul className="space-y-3 text-small text-ink">
                <li><Link href="/search" className="inline-block py-1 hover:text-brand transition-colors">{t('findItems')}</Link></li>
                <li><Link href="/product/create" className="inline-block py-1 hover:text-brand transition-colors">{t('sell')}</Link></li>
                <li><Link href="/profile/orders" className="inline-block py-1 hover:text-brand transition-colors">{t('myOrders')}</Link></li>
                <li><Link href="/shop/orders" className="inline-block py-1 hover:text-brand transition-colors">{t('mySales')}</Link></li>
                <li><Link href="/profile/wallet" className="inline-block py-1 hover:text-brand transition-colors">{t('wallet')}</Link></li>
              </ul>
            </div>

            {/* Pay */}
            <div>
              <h3 className="font-bold text-small text-ink mb-4 uppercase tracking-wide">{t('payment')}</h3>
              {/* Liệt kê bằng chữ đúng những gì trang checkout thật sự hỗ trợ.
                  Trước đây là logo Visa/Mastercard/JCB hotlink từ Wikimedia. */}
              <ul className="space-y-3 text-small text-ink">
                <li>{t('cod')}</li>
                <li>{t('wallet')}</li>
                <li>{t('payos')}</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-small text-ink mb-4 uppercase tracking-wide">{t('contact')}</h3>
              <ul className="space-y-3 text-small text-ink">
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-ink" aria-hidden="true" />
                  <a href="mailto:admin@zoldify.com" className="inline-block py-1 hover:text-brand transition-colors">admin@zoldify.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-ink" aria-hidden="true" />
                  <Link href="/chat" className="inline-block py-1 hover:text-brand transition-colors">{t('chatSeller')}</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/10 mt-6 pt-6">
          <div className="text-center text-small text-ink">
            <p>{t('rights', { year: new Date().getFullYear() })}</p>
            <p className="mt-1">{t('region')}</p>
            <p className="mt-1">{t('email', { email: 'admin@zoldify.com' })}</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation - Like Shopee/Lazada */}
      <nav aria-label={t('navMain')} className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-ink/10 md:hidden z-sticky pb-safe">
        <div className="flex h-16">
          {/* Trang chủ */}
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname === '/' || pathname === '/home' ? 'text-brand' : 'text-ink-muted'}`}>
            <Home className="w-5 h-5" aria-hidden="true" />
            <span className="text-caption font-medium">{t('navHome')}</span>
          </Link>

          {/* Tìm kiếm */}
          <Link href="/search" aria-current={pathname.startsWith('/search') ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname.startsWith('/search') ? 'text-brand' : 'text-ink-muted'}`}>
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="text-caption font-medium">{t('navSearch')}</span>
          </Link>

          {/* Đăng bán - Nút nổi bật */}
          <Link href="/product/create" className="w-1/5 flex flex-col items-center justify-center gap-0.5 -mt-2 text-brand">
            <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-accent rounded-full flex items-center justify-center border-2 border-white">
              <Plus className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-caption font-bold">{t('navSell')}</span>
          </Link>

          {/* Chat */}
          <Link href="/chat" aria-current={pathname.startsWith('/chat') ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname.startsWith('/chat') ? 'text-brand' : 'text-ink-muted'}`}>
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            <span className="text-caption font-medium">{t('navChat')}</span>
          </Link>

          {/* Tài khoản */}
          <Link href="/profile" aria-current={pathname.startsWith('/profile') ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname.startsWith('/profile') ? 'text-brand' : 'text-ink-muted'}`}>
            <User className="w-5 h-5" aria-hidden="true" />
            <span className="text-caption font-medium">{t('navAccount')}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
