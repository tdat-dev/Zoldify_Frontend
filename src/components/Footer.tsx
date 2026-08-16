"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, Bell, Home, Search, Plus, MessageSquare, User, Phone, MapPin } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { settingService, SETTING_KEYS } from '@/services/setting.service';

/**
 * Thông tin liên hệ lấy từ API settings/public.
 * Mỗi trường có thể rỗng — nếu rỗng thì footer không hiện mục đó.
 */
interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  facebook: string;
  zalo: string;
}

/** Giá trị mặc định khi chưa tải được hoặc chưa có dữ liệu. */
const DEFAULT_CONTACT: ContactSettings = {
  email: 'admin@zoldify.com',
  phone: '',
  address: '',
  facebook: '',
  zalo: '',
};

export default function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();

  /* ─── Tải thông tin liên hệ động từ backend ─── */
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await settingService.getPublic();
        /* Backend trả { data: { contact_email: '...', ... } } hoặc { data: { data: { ... } } } */
        const raw: Record<string, string> = res?.data?.data ?? res?.data ?? {};
        if (cancelled) return;
        setContact({
          email: raw[SETTING_KEYS.contactEmail] || DEFAULT_CONTACT.email,
          phone: raw[SETTING_KEYS.contactPhone] || '',
          address: raw[SETTING_KEYS.contactAddress] || '',
          facebook: raw[SETTING_KEYS.contactFacebook] || '',
          zalo: raw[SETTING_KEYS.contactZalo] || '',
        });
      } catch {
        /* Lỗi mạng — giữ giá trị mặc định, footer vẫn hiện bình thường */
      }
    })();

    return () => { cancelled = true; };
  }, []);

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

            {/* Contact — Nội dung động từ API settings */}
            <div>
              <h3 className="font-bold text-small text-ink mb-4 uppercase tracking-wide">{t('contact')}</h3>
              <ul className="space-y-3 text-small text-ink">
                {/* Email liên hệ — luôn hiện (fallback admin@zoldify.com) */}
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="inline-block py-1 hover:text-brand transition-colors">{contact.email}</a>
                </li>

                {/* SĐT — chỉ hiện khi admin đã nhập */}
                {contact.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" />
                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="inline-block py-1 hover:text-brand transition-colors">{contact.phone}</a>
                  </li>
                )}

                {/* Địa chỉ — chỉ hiện khi admin đã nhập */}
                {contact.address && (
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" />
                    <span className="py-1">{contact.address}</span>
                  </li>
                )}

                {/* Nhắn tin — tính năng app, giữ nguyên */}
                <li className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" />
                  <Link href="/chat" className="inline-block py-1 hover:text-brand transition-colors">{t('chatSeller')}</Link>
                </li>

                {/* Thông báo — tính năng app, giữ nguyên */}
                <li className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" />
                  <Link href="/notifications" className="inline-block py-1 hover:text-brand transition-colors">{t('notifications')}</Link>
                </li>

                {/* Facebook — chỉ hiện khi admin đã nhập */}
                {contact.facebook && (
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-brand transition-colors">Facebook</a>
                  </li>
                )}

                {/* Zalo — chỉ hiện khi admin đã nhập */}
                {contact.zalo && (
                  <li className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-ink flex-shrink-0" aria-hidden="true" />
                    <a href={contact.zalo} target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-brand transition-colors">Zalo</a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/10 mt-6 pt-6">
          <div className="text-center text-small text-ink">
            <p>{t('rights', { year: new Date().getFullYear() })}</p>
            <p className="mt-1">{t('region')}</p>
            <p className="mt-1">{t('email', { email: contact.email })}</p>
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

