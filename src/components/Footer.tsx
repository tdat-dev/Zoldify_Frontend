"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, MessageCircle, Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      {/* Footer - Ẩn trên mobile, chỉ hiện bottom nav */}
      <footer className="hidden md:block bg-white border-t border-gray-200 py-[30px]">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 py-4 md:py-[30px]">
            {/* Service */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">DỊCH VỤ KHÁCH HÀNG</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Trung Tâm Trợ Giúp Zoldify</Link></li>
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Hướng Dẫn Mua Hàng/Đặt Hàng</Link></li>
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Hướng Dẫn Bán Hàng</Link></li>
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Đơn Hàng</Link></li>
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Trả Hàng/Hoàn Tiền</Link></li>
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Liên Hệ Zoldify</Link></li>
                <li><Link href="#" className="hover:text-[#2C67C8] transition-colors">Chính Sách Bảo Hành</Link></li>
                <li><Link href="/privacy" className="hover:text-[#2C67C8] transition-colors">Chính Sách Bảo Mật</Link></li>
                <li><Link href="/terms" className="hover:text-[#2C67C8] transition-colors">Điều Khoản Sử Dụng</Link></li>
              </ul>
            </div>

            {/* Pay */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">THANH TOÁN</h3>
              <div className="flex gap-3 flex-wrap">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASEAAACuCAMAAABOUkuQAAABblBMVEXw7+vv7urp6OTs6+f5nwDtAAbu7enl5ODr6ubq6eXt7Ojn5uL/XwEyK17w7+0AAADW1dEyLFwxLmMyK2Hw8Oj39vQwL2jw7u/uAAD3oQD8ngAwLF4zLVzyAAAgFlT///+1s77l5O7jAADaAADwmwAsJVm9vbtIR0UmHlP39vjb2tZaWVhxcG/28+n03bfUAAD/WRHo9PBNSGmUkaUfF04eGlrh3uurqbqBfZcUAEdzcIfOzdkMAEDz7fFrZoIqIlympaItLCuMi4l/fnybmplKSUj55+P3zsruvb340s/48Nzuq6jfc3PZQULcEBTbHh/XT07lhH356cv41qLtwHbtsEXxoyHumJb30JXxwXL78N/RKijppCvfU0/xt1/vZwD57sTyqKX/lAj3dgP6PA/0cwQAADweGEdeXW4AAFBZVXHYXl4+Omi/vc/yQgChn7CPj7BVUnk9OlmopcFNR3H5hwXhz60AADT4v5MdHBzUIQoFAAAU5klEQVR4nO2di0PTyL7HE0UqYqeNmSG1Da0FWghYvYXKq4QCShV015WX+Fhdd/cs56Icdtnde47//fn9ZiZpC0mn5dyzWMx3lTavpvnwe04mrhaL1F5a6+JgJFQgoYv+Ul+YzhIS669E4mqGpHmALvpLfWk6Rcgzn4FIAwM+oyZCEhBsvR7pug9pMDYoCSEgXAlbr0a6Chg8R5OEvBgkDOiiv9/Fq2FGpwgNCDg3vnpxSAGEABDf3v/Vi0OSiBqEwMOuCjz6Vy+EJK0IjSgidEYBhDDPI6GIj6d+z884IWFCVzmhi/5mX4zQiiJC7RRESALSIuleKBKIIkJnFBFSKSKkUkRIpYiQSmcJXYkItSgipFLkZSpFhFSKCKkUxSGVIkIqRV6mUkRIpYiQSlEcUikipFJESKUoDqkUEVIpIqRSFIdUigipFHmZSj1AKHaxp+8BQsmLPX0PxKGIkEpfHKHIy1oVEVIpIqTSpYpDRNMsC9/olOLC6c0E/2ga1WEjxWX5IlaH6LIQQiLEIhTQoCxYcikVCDzxBdjBIsQSVCzCD6RfASE0C4swVqrXHz8BbdTrjJU1l7SYEiIjllba3Nq6B9rafF3SOK0Ag/N1SeIQGEyZbTx99s23oyMj1/DP8+9ePKmzMm26BGJZpLS1vbO715fuQ43t7e5sb5Usy2pzoZeFUGnj5TejI8PDqdQ11Mg1eDsy+vFpvdy0E93a391Lp/tuSwGkdHrv3fYmvcw2RNB12ONn968JNkLi/fDwyPMXG4wQCv9ZpXuvwHiE9Qil5c+9HTAkoumBnHo5DlHiYoh2yxvPRodTw9eClLp2/2W9bGn92tarMTCevmZCDVR7O68JxG0acJZeJkQwdUH8eXk/BI8wpJE3T6hV2t9L3w4DhHb0drtEArNaT3sZpS4pb3w/MgxOFc5oZHj02et3Y8FopBDdq01iBRhRLxOCCGSVnzyH4JziwTlYsC018v7HvtYQdMaGYPPuD1AplU6fpZcJEa3Mno4OczapED7ciEb+5yYiaidMcH1794hLtFPVUS/HIYjRH0bboPE2jdwEvf8RszvP8OEau+dgK9ISsnuZECk/vd8mRHNIQAksSCCSEaedJe2ho2EB0ThL73qZrjmPVYC4BQlAgCitsCDAl367xe3HbTpPDxOqv+kE0D9uevopHZrtpQnBDrslS29JaT1LSNfYd+3Cswfo55sN/akwIR6Kdgi12nvZfzcOtWmAwhRACIppWv4Qlt+bwpCI0r5+VLkZIrpnaVbTuf5iQjSorlcoxIbqz5UmlEr5QUjobx0YUd/uZktR9F8n1GQ01jkMSAsmRDXnWQcWdO3nm636UxmsIRrtl+tNRvT/F4f6m96fPo4P/dGzQ6N66BFNCiJEyvXRbvKYJ8hnaiN6u2n9ldkeqDiOY1mWaznsrJeJZdbuEwII3bDKL9R8zpoQRKIO3Cy97TRduIpQ9U6rqq5/NZyz5W+JwYUWvQW0UjFK7OTvzB9+KlQmjOnlmaM8I/7JddhYbT6gc0IarX97HhOCjN8Jod322b4lDrGZk6WlhWw2W6lkhewqk794C8fAj36ZEFtsV9OtE7nTBFZcOtGpc/T3g2ytZsZBhUIte/D3QR8RZdWT7AOh/62S0DQXRKj8VJ3IQGcAoRGpiiJIZ1tt41BrpGZgA4t2tha3DbzKuGEezDaNoTiHhoEbzMox00j+IM73KiyjmRKdVaezBdOM2/zQjGGYpt04mOaN2q3MLa4Hc+GOFpTt2ccOTCjAybAmUgbrdN9OF3FIh/jK3KPDg4IpCWVnmDye9muzFY9bnuraUUUQmphhQIg6x0sFWJExBKG4YRuFZeafnB0/MCWgW7V5pxtC2vnitIjV7VszTmi3Kd13EKmJBZZUPZwQl2nXDpsucr7GLz1em2dUYzNyn+wR9n5sZsHkpmcKuCa8Hsw0DnZPCoY9xAENDX1yQiulAELlJyOd1NMBgG7eVBNCN2sYkZKQ1+o6i/zyTdssuJ6XEteGizcMO5Ot4nj6YQFNKBOfmIUMxo6WgI9p2NI/8eD4wVHDy44qtzLShoZuZYOG90IJsZeptiNC4U4GgSjd1z4QoRtutyMUVjHGssAinskYQEOssdCtuAqHYALUsk2bu9w0g9bGkmAAEA/0lUotYy7lBVrNos5yDc1KALr14KgrQh87MKFr/wgk9GcHFVF6x9U1OUjUKaF+zfkNnIITuuNdjHOYERiyczisXq0AISNu1BYZJey4IhzQnDiZqc7mZ6t3Fk+yn8SwAhomhjBOKIOWVDtmYcVXEKE35yf0UyeEXjXuw3ZeMUKU4TYUr83IvENnl0RkNm0wGcLmMFDDLhVITLrzhynta9lllIs5R8fiUAxtGMKQ0NAQJrShphCuJlT/thNCQYEaCXXQeOyWaPeENDARTgjykTiUzcvIXAFmQAgWMxkbMn8VtuazklAlX+IdBwQq/6zEonkMYUCogIiAkB2azIIItRt89RSYyjrrXtNvX/OZId0RolaBEzLiBWkIri0rnUoeTEhzpgsGZnbTAIvSqh6hA0dMHyB8fNP7xNJclhOq/WpgJMoMVfJdeNnGaJu7P1ypUELvOyNkeSVsF709O4TaGOvDCqYqrKez6GGGUVt2sMC2CpDGbPDCQyge2R3fhuYcMB9RN3hzVQh1pmtQP0KQyh+aPN1nQ0N1MCFFLmtDqH0iE9or+YGoG0IzWUlIXEzuEK4QcpW5UCWoaha22TxOAYrqglcFVY4dMb+nIej3lkwgZJq/5RZrPJvVfg2rqlsJ8Y/ZuK/K9v8podda94TgqrI8OcUnRLzlyQiQ1abxFgokrwnYxnMdGotb8QjFK9NVh7V29c5iLWMA4Owcm3vACQ0dhgWiAELnL6k7I5R+u6lb3UdqzbVF/i4ssquQmWaQCEQiSF2c0HIBM5lhVGZxMpisMDHdxwtLh1WH0sbH6bOCn2nngbsgNOFqwTpDSKd15V0g/BEWqTtI95DLzkGIAgNsruKFEwcqYAd7LrAZTPXcyz4BLagZjU8WH0f2WjZOora0mGeNjxP9CcRpqJys2i2ezLKzHRNS10N4Kzq0Huog278j58n2GsEiEHKZWcmDG4lQbIjyCD5tkldDps2bUzAi9juPRHwnCDkFiNj9nqdhS8ZHBKCBY7+ZQ2hDvKoOqonORmqdfa/O9mGEoKZWIkrvWFQLzfZtxqm9DI5dGDRhvKeIL8zyK6NeBzLhNafseGEonjG9piy+MO/wsViiQ20JhYORqX1yYWFeGFFtvqTpQQNpQTX1i04qxpC+7Laid8W+7Vx9Gf7qbVMm8JI37oFjQRRLh0b5eCT3puzoYCLjexpYzIzDjYQ6hzWspMwHM0wn2p2s6F5/Yx0T0p52ACikt1feEUrfTo/d66K3b/nVLXO7icOv2xvpAEfROCFH2BRUiHm5NwRva3GhkPHGh0xz6UjM1wVbxBZvCGxRh4AlCWVdGjhPLnh86LxF9fvQiWhNhN5unpNQaU4YTmHacbwBjRM5sGMJ+4LG3sva1HI1Vl1ewkJS7FuYdmFnPbc4AQE9bkOZQHFIoCAGidB3A2AEEip9M6we/hgJCkQ/tZmJ5utV06m6IURLvCJCw3HuLAjXqRwzcV0yRmVq817lh3MnIRBXDyteJDKXqhiy8gXDAJ421FU4B5P9NiRHYjsmpJ9/gOjHPtXde3Cy7S7GqZtFqDQUszK7WIB6z0afQhOyKJXmFYcaUOMtjX+1zlyWj6LZUEzOMUsrHWdlCJt1Lct13V9rkMqGhoBt4HB+4Eg+9h3ncTN1vXj7dnoPncybItMVIY0t8lFXc+L3AxGBJxYdnK9reeOxmOcQZdNgP6XOUcWQ5TZajXXiVdsTFa7CECc09IcT2LwG3pUufRxW3+0YOWtEHUxuuJ3ewXuf4RVj27vS0lIMO2PiRYPbUMw/2ImKQG3a+KRAY1YpsSyd5v7A1AWJ/8Ex00XDKxmZJqLhrevQEJZZnRGCUzzuaKT6PPdc03tb4BOl8DHGtvdcZ5e8VsLEOISjr3wCKc3LTFY4BD+y+Ng2kReDRSG3IRO8jPLRV58QrL3lE3pwdPp0oTZEXfZdJ63Zmfv2HbQcYEIuIWXqdjs+xL8Y+UOSwCYfWrA7HAFYkWcYUC8ioSr0qv5RrFqx0YYy9kKVatWKd3dIDKGZiEcQOg4cAAmyIUujj8+R8DszoU16716dnIuQzutC2zMBG8fKhJ2wY9nKZ+9ggGPzvxz+nnewoy8x5wjxwB87/smiPGDZOCiQEWbk3e4ALQcOgATZEHS5JT75o30wSp0yoj9vt23KxIMe+3Tz3v+VfIfvdnbMnUqDkJGVI9aQsZdrktAsDiOy6YIxcTC9OHM8d7x4IuGByUFDYhmFuOjUfPludivwplng3A/NKtefK4I1FgQtRvQ3RSLDdiS9u2nx1ui8hPJy8J7//hdk+axT90TcNjTFzYz8AbeTWq2WzdZMeUcRB/wh9VcwwtuGOWEUpGqmJJTNnzlfGKGyZZWfKPwsdcrP3v+oiEJICGfDYs3hT/bpdnaMM91oRWuLTNQvOpXjPfHaMiQrUT6KG/oNngC0ysC65HhIpcosKdeZbheqA7M9JS4pvxzpIOX/3DEgtKCxbSzums/ULSEII55JGJDqRdGg+4G6wgseelzh5SSvC/yb0ks40gZVOfQbsHKaie+B8654e48140xQIAqepYepsvSsgxkgXih6r55/dvv22L7lQmxtP4+xPSGoZvBGNBoCdGCSEGUztYyBRpM9wke52GIBb1/zO9YZPlILRWbhiGk81dsZ28bBa7+qJOz3BzwMgQUGBKKgXMZrFVoufVRWRSmvPfsJTUQx8DG2w2/ItJyr63mM+YrnZtBCeJNAsLFHIKZo7K2TCk6KMQzhaTj4X5l3sS6QYyZ2bWK22ZarC5zQkBk01TF8Tj7V6h876T5+vtnBDEZ0sZ3S2S/QLSHq4JSrpQXQL35cJfmDJVi7sLR04ojluWV7CfqJGqqSzU4f5/lQPpv5p9zxsCVtWb9ks9mF7MI/ZwOG89s8+aKX2TP56IvC0ZTdBgLa18r/+fNllOZn81INbyX+SrkXcdzZo+OZ+cXF+Zm5at7RKJ8J2zjYbRlxpXLtbKfjQ5IQ3kD4cD/VHhGE8zf/2lOMeIz1pd9u03LAE2bdErIaD840XyEGzhJtNKx475AykAN/G/7kPQ7Pp8U2h0NshPiN6668DHcu043v2gej4fvP6uWtd+0eL0NE77ZcaMHPTvjunhDxhyhOP+5v+cv43fHZ7YZOD9KTloEOwEvw4fjAAaI2z7kKgRmFM0qNvHkCvyOrtL0XjiiNBmTheMfZb9DLT0/5YvUX347wZ11PuVtqePTNhxJaK7jP5v5eGgwJbUkEbT92j+3tbwY/BqxdEkLga3V83D413GRKqVRqZPT7J4SWXY0P91Dr9f7uGD5C1XA4YDQ2trtdojpYcPCM5UtCSCdltvHyu2+BUmoY/10CoPP844d6mTs7FT6P/3DBvf13byEqexp7u7u/RcsU/0UV0imhHnl6qlX4751YjlN//PTli2eglx+ebLhl6JPxVgF2KITwBoeUy3Tzh+3tnVegne3tHzY1HsqsM4+3+rokhAjPpfCGlSF/YgItU/j++DS15nopA4MRRmJoLPiUL83is5oofyKRhD2Xc0kIwYWX8Qp1/qQIoIHenOiiHmgyD9JYkpeGVEWNQeTa0wXHJYlDgfLqjC6EY1unDrrchHKh00dDpGvFRzEVoR7yMl3D5yq0/n7N8xq+Bl/xJ4lNPfIR6WKtLv7q/gdoYl2/PJitJZKXiBC4BINrgx943fwNiL/BdyyWeJgjHAxrOYAfIZc0AU+sgeMeXSJCenFycGUlxvqLj4pM126wSVi6UoxBy19cWUkykiwm7iaL+NxbEvfTYQUprkxquGMRjAtXD8aKA9pkEZwryddfWVET6ok4hNE0llhNgFbw5xTTwD9A64kim/yM76Zy/CUBjjaFr0XG7ibGE4kke4iLqwQWQeN8Bawv5h6KD0i2xq6eJpRYS67AtRaT43D9RXyzhld6N7ESS67BmpXEVLGYBBJrseRqIgYb1pNF8KNx2PFRjr/eRWRriXFYv4IfAJSUhHrCywSh9RzJTcEVAp2HufXEJNMAQhGIPJocyIFVDcJqppHEqkNgl0ewEfZlq4lBHJdhnxNX4ec6JwQ+mQOG8AFTl4rQXabDVUN2TibW2OdVDLtFIJTk3gMXDZEawk0sIXQX9p0kZCCxzkseeM1p/RiZRf5iCfiAG9rKJSOkMY8QmACsB1cpEkaKaxB6GoRWIXJDcBY0dSDBS8nEag6y3sMGoQQg5u9bTtWjcQiFhEiD0EOwo9zkKkbqyVwuN56wgNBUjt0At0rmciSJkRpsiE0lVnK52CT40wpDe0s6nBDwe8QwyoPxNReaPUtIbyX0kF1dTaxO8Zw1npi6C38ZmsX654dIYQq2XBeEyCS44DoYknhNeDaEkX+VLxNSnGz8Gwk9S0jTrqyvAYS18UEgNA45ffDh6ueHK+OQw+6ufl5dw+HZ5PjnVTSUqc+fpyDbr61jR8FisH19hbDJu6ura4/GJ9nK+CR3W1i/tjKeJFfvrjRubfZoHOJiGE+YeGSC19C8KMYFJqpleEu8ncQGObDtrdZE9e2vlx9AYlcbZ+llQk03CvxGS9dkQ6+3bA8UP0hvOkrHxdMDAr1MqKlJlW/lK/GjSGMWUOMAjqF5tb+e97Fnz9KzcegvUkRIpV72sr9GESGVIkIqRXFIpYiQSpGXqdQDhKL/f5niC174F/ji49BFf4cvn9BFKyKk0hcfhy5cESGVIkIqRXFIpYiQSpGXqRQRUikipFIUh1SKCKkUeZlKESGVIkIqRYRUigipFBFSKYzQdYkoEqoBKCIUrBZCWDIODFznhCJEQgCohRA3IiB0I2KEEkFIAIoIBSmYEA9FN24ISF+5AIL0MXSyBiGe8UE3vnoBhOsSUCsh9DTQ1a9eAGFgoIUQIBq8gmsiPlyAQZjMoE+II0IjGhBm9JVLGhBGIZ+QhwgZRbpyxQPEJQj5sSiSp0EJyCOEVjQYYfLEYZwiJBFFkor50mItuugv9oWoGckpQpHO6N+CFymqo4GDWQAAAABJRU5ErkJggg==" alt="Visa" className="h-8 w-auto object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 w-auto" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" alt="JCB" className="h-8 w-auto" />
              </div>
            </div>

            {/* Monitor */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">THEO DÕI ZOLDIFY</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <Facebook className="w-4 h-4 text-gray-800" />
                  <Link href="#" target="_blank" className="hover:text-[#2C67C8] transition-colors">Facebook</Link>
                </li>
                <li className="flex items-center gap-3">
                  <Instagram className="w-4 h-4 text-gray-800" />
                  <Link href="#" target="_blank" className="hover:text-[#2C67C8] transition-colors">Instagram</Link>
                </li>
                <li className="flex items-center gap-3">
                  <Youtube className="w-4 h-4 text-gray-800" />
                  <Link href="#" target="_blank" className="hover:text-[#2C67C8] transition-colors">YouTube</Link>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-gray-800" />
                  <Link href="#" target="_blank" className="hover:text-[#2C67C8] transition-colors">Zalo</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="text-center text-sm text-gray-700">
            <p>© {new Date().getFullYear()} Zoldify. Tất cả các quyền được bảo lưu.</p>
            <p className="mt-1">Quốc gia & Khu vực: Việt Nam</p>
            <p className="mt-1">Email: admin@zoldify.com</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation - Like Shopee/Lazada */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-[1000] pb-safe">
        <div className="flex h-14">
          {/* Trang chủ */}
          <Link href="/" className={`w-1/5 flex flex-col items-center justify-center ${pathname === '/' || pathname === '/home' ? 'text-[#2C67C8]' : 'text-gray-500'}`}>
            <Home className="w-[18px] h-[18px]" />
            <span className="text-[9px] mt-0.5 font-medium">Trang chủ</span>
          </Link>

          {/* Tìm kiếm */}
          <Link href="/search" className={`w-1/5 flex flex-col items-center justify-center ${pathname.startsWith('/search') ? 'text-[#2C67C8]' : 'text-gray-500'}`}>
            <Search className="w-[18px] h-[18px]" />
            <span className="text-[9px] mt-0.5 font-medium">Tìm kiếm</span>
          </Link>

          {/* Đăng bán - Nút nổi bật */}
          <Link href="/product/create" className="w-1/5 flex flex-col items-center justify-center -mt-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#2C67C8] to-[#1990AA] rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-[9px] mt-0.5 font-bold text-[#2C67C8]">Đăng bán</span>
          </Link>

          {/* Chat */}
          <Link href="/chat" className={`w-1/5 flex flex-col items-center justify-center ${pathname.startsWith('/chat') ? 'text-[#2C67C8]' : 'text-gray-500'}`}>
            <MessageSquare className="w-[18px] h-[18px]" />
            <span className="text-[9px] mt-0.5 font-medium">Chat</span>
          </Link>

          {/* Tài khoản */}
          <Link href="/profile" className={`w-1/5 flex flex-col items-center justify-center ${pathname.startsWith('/profile') ? 'text-[#2C67C8]' : 'text-gray-500'}`}>
            <User className="w-[18px] h-[18px]" />
            <span className="text-[9px] mt-0.5 font-medium">Tài khoản</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
