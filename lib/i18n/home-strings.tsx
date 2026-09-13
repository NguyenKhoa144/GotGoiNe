import type { ReactNode } from "react";
import type { Lang } from "@/lib/language-context";

type HomeStrings = {
  header: {
    backToTop: string;
    logoTagline: string;
    searchPlaceholder: string;
    searchAria: string;
    searchOpen: string;
    searchClose: string;
    searchClear: string;
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
    noResultTitle: string;
    noResultDesc: string;
    addAriaPrefix: string;
  };
  fruitBox: {
    subtitle: string;
    pickInstructions: string;
    decreaseAriaPrefix: string;
    increaseAriaPrefix: string;
    selectedTypesLabel: string;
    selectedTypesUnit: string;
    ctaButton: string;
    comingSoonTitle: string;
    comingSoonDesc: string;
    emptyToday: string;
    emptyHint: string;
    noResultToday: string;
    noResultHint: string;
  };
  how: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    stepPrefix: string;
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
  footer: {
    tagline: string;
    addressLabel: string;
    hotlineLabel: string;
    navHeading: string;
    navHome: string;
    navMenu: string;
    navProcess: string;
    navWhy: string;
    navOrder: string;
    connectHeading: string;
    rights: string;
    credit: string;
  };
};

export const homeStrings: Record<Lang, HomeStrings> = {
  vi: {
    header: {
      backToTop: "Về đầu trang",
      logoTagline: "Trái cây gọt sẵn",
      searchPlaceholder: "Tìm kiếm sản phẩm...",
      searchAria: "Tìm kiếm sản phẩm",
      searchOpen: "Mở ô tìm kiếm",
      searchClose: "Đóng ô tìm kiếm",
      searchClear: "Xoá từ khoá",
      menuToday: "Menu hôm nay",
      adminLogin: "Đăng nhập quản trị",
    },
    hero: {
      badge: "Giao trong 30-60 phút tại Phú Lợi",
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
      ctaPrimary: "Xem menu hôm nay",
      ctaGhost: "Tìm hiểu thêm →",
      cardName: "Dứa mật gọt sẵn",
      cardSub: "Dứa mật ngọt · cắt miếng · 300g",
      cardUnit: "/ hộp 300g",
      addAria: "Thêm dứa mật gọt sẵn",
      tag1Title: "100% tươi sạch",
      tag1Sub: "Nhập mỗi buổi sáng",
      tag2Text: "Đang giao • 14 đơn",
    },
    products: {
      eyebrow: "Menu hôm nay",
      subtitle: "Gọt và đóng gói ngay mỗi buổi sáng - đảm bảo độ tươi tối đa khi đến tay bạn.",
      emptyTitle: "Menu đang được cập nhật",
      emptyDesc: "Danh mục này sẽ có sản phẩm mới sau khi bếp chốt nguyên liệu trong ngày.",
      noResultTitle: "Không tìm thấy loại nào",
      noResultDesc: "Thử từ khoá ngắn hơn, hoặc xem danh mục khác ở thanh phía trên.",
      addAriaPrefix: "Thêm ",
    },
    fruitBox: {
      subtitle: "Chọn thoải mái các loại trái theo khẩu vị - phần ăn được chia đều và báo giá theo cỡ hộp bạn chọn.",
      pickInstructions: "Chạm vào từng loại trái để thêm vào hộp",
      decreaseAriaPrefix: "Bớt ",
      increaseAriaPrefix: "Thêm ",
      selectedTypesLabel: "Đã chọn",
      selectedTypesUnit: "loại quả",
      ctaButton: "Đặt hộp này",
      comingSoonTitle: "Sắp ra mắt!",
      comingSoonDesc: "Tính năng đặt hộp tự chọn đang được hoàn thiện - theo dõi Gọt Gòi Nè để là người đặt đầu tiên nhé.",
      emptyToday: "Hôm nay chưa có trái cây để ghép hộp",
      emptyHint: "Bếp đang chốt nguyên liệu trong ngày - ghé lại sau một chút nha!",
      noResultToday: "Không tìm thấy loại nào",
      noResultHint: "Hôm nay menu không có loại này. Thử từ khoá ngắn hơn xem sao!",
    },
    how: {
      eyebrow: "Quy trình",
      titleLine1: "Từ vườn đến tay bạn",
      titleLine2: "trong 4 bước",
      subtitle: "Quy trình chặt chẽ - để mỗi hộp trái cây đến tay bạn đều tươi, sạch và an toàn tuyệt đối.",
      stepPrefix: "Bước",
    },
    why: {
      eyebrow: "Tại sao chọn chúng tôi",
      titleLine1: "Tại sao khách hàng",
      titleLine2: "yêu thích Gọt Gòi Nè?",
      subtitle: "Ba lý do đơn giản - nhưng chúng tôi thực hiện mỗi ngày, không ngoại lệ.",
    },
    cta: {
      heading: "Đặt ngay - nhận trong 30 phút!",
      subtext: "Miễn phí giao đơn từ 150.000₫ · 7:00 - 20:00",
      button: "Đặt hàng ngay",
    },
    footer: {
      tagline: "Trái cây tươi, gọt sẵn - giao tận nơi tại Cần Thơ.",
      addressLabel: "Địa chỉ",
      hotlineLabel: "Hotline",
      navHeading: "Khám phá",
      navHome: "Trang chủ",
      navMenu: "Menu hôm nay",
      navProcess: "Quy trình",
      navWhy: "Vì sao chọn chúng tôi",
      navOrder: "Đặt hàng",
      connectHeading: "Kết nối với chúng tôi",
      rights: "Gọt Gòi Nè. Đã đăng ký bản quyền.",
      credit: "Thiết kế bởi Khoa - Saamiton",
    },
  },
  en: {
    header: {
      backToTop: "Back to top",
      logoTagline: "Pre-cut fresh fruit",
      searchPlaceholder: "Search products...",
      searchAria: "Search products",
      searchOpen: "Open search",
      searchClose: "Close search",
      searchClear: "Clear search",
      menuToday: "Today's menu",
      adminLogin: "Admin login",
    },
    hero: {
      badge: "Delivered in 30-60 minutes in Phú Lợi",
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
      ctaPrimary: "View today's menu",
      ctaGhost: "Learn more →",
      cardName: "Ready-cut Honey Pineapple",
      cardSub: "Sweet honey pineapple · cut pieces · 300g",
      cardUnit: "/ 300g box",
      addAria: "Add ready-cut honey pineapple",
      tag1Title: "100% fresh & clean",
      tag1Sub: "Sourced fresh every morning",
      tag2Text: "Delivering now • 14 orders",
    },
    products: {
      eyebrow: "Today's menu",
      subtitle: "Peeled and packed fresh every morning - guaranteed maximum freshness when it reaches you.",
      emptyTitle: "Menu is being updated",
      emptyDesc: "New items for this category will be added once the kitchen finalizes today's ingredients.",
      noResultTitle: "Nothing matched",
      noResultDesc: "Try a shorter keyword, or browse another category in the bar above.",
      addAriaPrefix: "Add ",
    },
    fruitBox: {
      subtitle: "Pick as many fruits as you like - portions are split evenly and priced by the box size you choose.",
      pickInstructions: "Tap each fruit to add it to your box",
      decreaseAriaPrefix: "Remove ",
      increaseAriaPrefix: "Add ",
      selectedTypesLabel: "Selected",
      selectedTypesUnit: "fruit types",
      ctaButton: "Order this box",
      comingSoonTitle: "Coming soon!",
      comingSoonDesc: "The build-your-own box feature is still in the works - follow Gọt Gòi Nè to be first in line.",
      emptyToday: "No fruit to build a box today",
      emptyHint: "The kitchen is still picking today's produce - check back in a bit!",
      noResultToday: "Nothing matched",
      noResultHint: "Today's menu has no such fruit. Try a shorter keyword!",
    },
    how: {
      eyebrow: "Our process",
      titleLine1: "From the farm to you",
      titleLine2: "in 4 steps",
      subtitle: "A strict process - so every box of fruit reaches you fresh, clean, and completely safe.",
      stepPrefix: "Step",
    },
    why: {
      eyebrow: "Why choose us",
      titleLine1: "Why customers",
      titleLine2: "love Gọt Gòi Nè?",
      subtitle: "Three simple reasons - that we deliver on every single day, without exception.",
    },
    cta: {
      heading: "Order now - get it in 30 minutes!",
      subtext: "Free delivery on orders from 150,000₫ · 7:00 AM - 8:00 PM",
      button: "Order now",
    },
    footer: {
      tagline: "Fresh, pre-cut fruit - delivered around Cần Thơ.",
      addressLabel: "Address",
      hotlineLabel: "Hotline",
      navHeading: "Explore",
      navHome: "Home",
      navMenu: "Today's menu",
      navProcess: "Our process",
      navWhy: "Why choose us",
      navOrder: "Order now",
      connectHeading: "Connect with us",
      rights: "Gọt Gòi Nè. All rights reserved.",
      credit: "Designed by Khoa - Saamiton",
    },
  },
};
