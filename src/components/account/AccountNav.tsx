"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { User, Key, MapPin, Package, Tag, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Điều hướng của khu tài khoản.
 *
 * Thay cho thanh tab từng được CHÉP TAY vào đầu mỗi trang — và chép sai: trang
 * /profile liệt kê ba mục (thông tin, đơn hàng, ví), trang /profile/change-password
 * liệt kê hai mục khác hẳn (thông tin, đổi mật khẩu). Không trang nào dẫn tới
 * địa chỉ hay tin đã đăng. Người dùng vào đổi mật khẩu xong thì mất luôn đường
 * sang đơn hàng.
 *
 * Một nguồn duy nhất, ba nhóm theo VIỆC người dùng đang làm chứ không theo cây
 * thư mục: tài khoản / mua / bán. Trên một sàn đồ cũ ai cũng vừa mua vừa bán,
 * nên hai nhánh đó phải ngang hàng nhau, không nhánh nào là mục con.
 */
type Item = { href: string; label: string; Icon: typeof User };

export function AccountNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations('account');

  const groups: { heading: string; items: Item[] }[] = [
    {
      heading: t('groupAccount'),
      items: [
        { href: '/profile', label: t('navProfile'), Icon: User },
        { href: '/profile/change-password', label: t('navPassword'), Icon: Key },
        { href: '/addresses', label: t('navAddresses'), Icon: MapPin },
      ],
    },
    {
      heading: t('groupBuying'),
      items: [{ href: '/profile/orders', label: t('navOrders'), Icon: Package }],
    },
    {
      heading: t('groupSelling'),
      items: [
        { href: '/profile/products', label: t('navListings'), Icon: Tag },
        { href: '/profile/wallet', label: t('navWallet'), Icon: Wallet },
      ],
    },
  ];

  // So khớp chính xác, KHÔNG dùng startsWith: '/profile' là tiền tố của mọi
  // đường dẫn con nên startsWith sẽ tô sáng "Thông tin cá nhân" cùng lúc với
  // trang đang mở. Ngoại lệ duy nhất là các trang con của /addresses, nơi
  // /addresses/create và /addresses/:id/edit vẫn thuộc về mục "Địa chỉ".
  const isActive = (href: string) =>
    pathname === href || (href === '/addresses' && pathname.startsWith('/addresses/'));

  return (
    <nav aria-label={t('navLabel')} className="rounded-card bg-surface-card">
      <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-tint">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-brand" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-small font-semibold text-ink">
            {user?.full_name || t('noName')}
          </span>
          <span className="block truncate text-caption text-ink-faint">{user?.email}</span>
        </span>
      </div>

      <div className="py-2">
        {groups.map((group) => (
          <div key={group.heading} className="py-1.5">
            <h2 className="px-4 pb-1 text-caption uppercase tracking-wide text-ink-faint">
              {group.heading}
            </h2>
            <ul>
              {group.items.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 border-l-2 px-4 py-2 text-small transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 ${
                        active
                          ? 'border-brand bg-brand-tint font-semibold text-brand'
                          : 'border-transparent text-ink hover:bg-surface-sunken'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
