import type { ReactNode } from "react";
import type { Lang } from "@/lib/language-context";

type HomeStrings = {
  header: {
    backToTop: string;
    logoTagline: string;
    searchPlaceholder: string;
    searchAria: string;
    menuToday: string;
    adminLogin: string;
  };
  hero: {
    badge: string;
    titleLine1: ReactNode;
    titleLine2: string;
    descLine1: ReactNode;
    descLine2: string;
    ctaPrimary: string;
    ctaGhost: string;
    cardName: string;
    cardSub: string;
    cardUnit: string;
    addAria: string;
    tag1Title: string;
    tag1Sub: string;
    tag2Text: string;
  };
  products: {
    eyebrow: string;
    subtitle: string;
    emptyTitle: string;
    emptyDesc: string;
    addAriaPrefix: string;
  };
  how: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  why: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  cta: {
    heading: string;
    subtext: string;
    button: string;
  };
};

export const homeStrings: Record<Lang, HomeStrings> = {
  vi: {
    header: {
      backToTop: "Về đầu trang",
      logoTagline: "Trái cây gọt sẵn",
      searchPlaceholder: "Tìm kiếm sản phẩm...",
      searchAria: "Tìm kiếm sản phẩm",
      menuToday: "Menu hôm nay",
      adminLogin: "Đăng nhập quản trị",
    },
    hero: {
      badge: "🚀 Giao trong 30-60 phút tại Phú Lợi",
      titleLine1: (
        <>
          Trái cây <em>tươi ngon</em>,
        </>
      ),
      titleLine2: "gọt sẵn - ăn liền!",
      descLine1: (
        <>
          <strong>Gọt Gòi Nè</strong> - startup nhỏ tại Phú Lợi, Cần Thơ.
        </>
      ),
      descLine2: "Không cần gọt, không cần rửa. Mở hộp là ăn ngay, tươi sạch mỗi ngày.",
      ctaPrimary: "🍉 Xem menu hôm nay",
      ctaGhost: "Tìm hiểu thêm →",
      cardName: "Dứa mật gọt sẵn",
      cardSub: "Dứa mật ngọt · cắt miếng · 300g",
      cardUnit: "/ hộp 300g",
      addAria: "Thêm dứa mật gọt sẵn",
      tag1Title: "🌿 100% tươi sạch",
      tag1Sub: "Nhập mỗi buổi sáng",
      tag2Text: "Đang giao • 14 đơn",
    },
    products: {
      eyebrow: "🛒 Menu hôm nay",
      subtitle: "Gọt và đóng gói ngay mỗi buổi sáng - đảm bảo độ tươi tối đa khi đến tay bạn.",
      emptyTitle: "Menu đang được cập nhật",
      emptyDesc: "Danh mục này sẽ có sản phẩm mới sau khi bếp chốt nguyên liệu trong ngày.",
      addAriaPrefix: "Thêm ",
    },
    how: {
      eyebrow: "📦 Quy trình",
      titleLine1: "Từ vườn đến tay bạn",
      titleLine2: "trong 4 bước",
      subtitle: "Quy trình chặt chẽ - để mỗi hộp trái cây đến tay bạn đều tươi, sạch và an toàn tuyệt đối.",
    },
    why: {
      eyebrow: "Tại sao chọn chúng tôi",
      titleLine1: "Tại sao khách hàng",
      titleLine2: "yêu thích Gọt Gòi Nè?",
      subtitle: "Ba lý do đơn giản - nhưng chúng tôi thực hiện mỗi ngày, không ngoại lệ.",
    },
    cta: {
      heading: "Đặt ngay - nhận trong 30 phút! 🚀",
      subtext: "Miễn phí giao đơn từ 150.000₫ · 7:00 - 20:00",
      button: "Đặt hàng ngay",
    },
  },
  en: {
    header: {
      backToTop: "Back to top",
      logoTagline: "Pre-cut fresh fruit",
      searchPlaceholder: "Search products...",
      searchAria: "Search products",
      menuToday: "Today's menu",
      adminLogin: "Admin login",
    },
    hero: {
      badge: "🚀 Delivered in 30-60 minutes in Phú Lợi",
      titleLine1: (
        <>
          <em>Fresh</em>, delicious fruit,
        </>
      ),
      titleLine2: "pre-cut & ready to eat!",
      descLine1: (
        <>
          <strong>Gọt Gòi Nè</strong> - a small startup in Phú Lợi, Cần Thơ.
        </>
      ),
      descLine2: "No peeling, no washing needed. Just open the box and enjoy - fresh every day.",
      ctaPrimary: "🍉 View today's menu",
      ctaGhost: "Learn more →",
      cardName: "Ready-cut Honey Pineapple",
      cardSub: "Sweet honey pineapple · cut pieces · 300g",
      cardUnit: "/ 300g box",
      addAria: "Add ready-cut honey pineapple",
      tag1Title: "🌿 100% fresh & clean",
      tag1Sub: "Sourced fresh every morning",
      tag2Text: "Delivering now • 14 orders",
    },
    products: {
      eyebrow: "🛒 Today's menu",
      subtitle: "Peeled and packed fresh every morning - guaranteed maximum freshness when it reaches you.",
      emptyTitle: "Menu is being updated",
      emptyDesc: "New items for this category will be added once the kitchen finalizes today's ingredients.",
      addAriaPrefix: "Add ",
    },
    how: {
      eyebrow: "📦 Our process",
      titleLine1: "From the farm to you",
      titleLine2: "in 4 steps",
      subtitle: "A strict process - so every box of fruit reaches you fresh, clean, and completely safe.",
    },
    why: {
      eyebrow: "Why choose us",
      titleLine1: "Why customers",
      titleLine2: "love Gọt Gòi Nè?",
      subtitle: "Three simple reasons - that we deliver on every single day, without exception.",
    },
    cta: {
      heading: "Order now - get it in 30 minutes! 🚀",
      subtext: "Free delivery on orders from 150,000₫ · 7:00 AM - 8:00 PM",
      button: "Order now",
    },
  },
};
