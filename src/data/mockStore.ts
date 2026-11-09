import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "marvel-spiderman-1422",
    title: "Spider-man",
    subtitle: "Peter Parker | Funko POP! 1422",
    popNumber: "1422",
    franchise: "Marvel",
    category: "marvel",
    image: "/501374361.webp",
    description: "Фігурка Людини-павука в класичному стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 20,
    regionalPricing: {
      UA: { currency: "UAH", price: 799 },
      EU: { currency: "EUR", price: 19 },
      US: { currency: "USD", price: 20 }
    },
    tags: ["Marvel", "Spidey", "Bestseller"],
    inStock: true
  },
  {
    id: "marvel-miles-765",
    title: "Miles Morales",
    subtitle: "Spider-Man | Funko POP! 765",
    popNumber: "765",
    franchise: "Marvel",
    category: "marvel",
    image: "/501374361-removebg-preview.png",
    description: "Фігурка Майлза Моралеса у костюмі з білим логотипом. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 22,
    regionalPricing: {
      UA: { currency: "UAH", price: 899 },
      EU: { currency: "EUR", price: 21 },
      US: { currency: "USD", price: 22 }
    },
    tags: ["Marvel", "Spider-Verse"],
    inStock: true
  },
  {
    id: "marvel-ironman-1421",
    title: "Ironman",
    subtitle: "Tony Stark | Funko POP! 1421",
    popNumber: "1421",
    franchise: "Marvel",
    category: "marvel",
    image: "/824996.webp",
    description: "Фігурка Залізної людини в класичному стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 24,
    regionalPricing: {
      UA: { currency: "UAH", price: 950 },
      EU: { currency: "EUR", price: 23 },
      US: { currency: "USD", price: 24 }
    },
    tags: ["Marvel", "Avenger"],
    inStock: true
  },
  {
    id: "marvel-blackpanther-1418",
    title: "Black Panther",
    subtitle: "T'Challa | Funko POP! 1418",
    popNumber: "1418",
    franchise: "Marvel",
    category: "marvel",
    image: "/588077361.webp",
    description: "Фігурка Чорної Пантери у класичному стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 20,
    regionalPricing: {
      UA: { currency: "UAH", price: 799 },
      EU: { currency: "EUR", price: 19 },
      US: { currency: "USD", price: 20 }
    },
    tags: ["Marvel", "Wakanda"],
    inStock: true
  },
  {
    id: "marvel-cap-1419",
    title: "Captain America",
    subtitle: "Steve Rogers | Funko POP! 1419",
    popNumber: "1419",
    franchise: "Marvel",
    category: "marvel",
    image: "/515073030.webp",
    description: "Фігурка Капітана Америки зі щитом у класичному стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 20,
    regionalPricing: {
      UA: { currency: "UAH", price: 799 },
      EU: { currency: "EUR", price: 19 },
      US: { currency: "USD", price: 20 }
    },
    tags: ["Marvel", "First Avenger"],
    inStock: true
  },
  {
    id: "marvel-hulk-1420",
    title: "Hulk",
    subtitle: "Bruce Banner | Funko POP! 1420",
    popNumber: "1420",
    franchise: "Marvel",
    category: "marvel",
    image: "/501372890.webp",
    description: "Фігурка неймовірного Халка у класичному стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 22,
    regionalPricing: {
      UA: { currency: "UAH", price: 899 },
      EU: { currency: "EUR", price: 21 },
      US: { currency: "USD", price: 22 }
    },
    tags: ["Marvel", "Smash"],
    inStock: true
  },
  {
    id: "marvel-carnage-671",
    title: "Carnage",
    subtitle: "Cletus Kasady | Funko POP! 671",
    popNumber: "671",
    franchise: "Marvel",
    category: "marvel",
    image: "/618lkYll7KL._AC_UF894,1000_QL80_.jpg",
    description: "Ексклюзивна фігурка Карнажа з випущеними симбіотичними щупальцями. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 26,
    regionalPricing: {
      UA: { currency: "UAH", price: 1050 },
      EU: { currency: "EUR", price: 25 },
      US: { currency: "USD", price: 26 }
    },
    tags: ["Marvel", "Symbiote", "Exclusive"],
    inStock: true
  },
  {
    id: "disney-stitch-1538",
    title: "Stitch 4-Arms",
    subtitle: "Alien Stitch | Funko POP! 1538",
    popNumber: "1538",
    franchise: "Disney",
    category: "disney",
    image: "/Stitch1538_2-800x800.jpg",
    description: "Фігурка ексклюзивного чотирирукого Стітча у класичному стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 20,
    regionalPricing: {
      UA: { currency: "UAH", price: 799 },
      EU: { currency: "EUR", price: 19 },
      US: { currency: "USD", price: 20 }
    },
    tags: ["Disney", "Stitch", "Bestseller"],
    inStock: true
  },
  {
    id: "disney-luau-stitch-1567",
    title: "Luau Stitch",
    subtitle: "Hawaiian Luau | Funko POP! 1567",
    popNumber: "1567",
    franchise: "Disney",
    category: "disney",
    image: "/6763893618_w400_h400_figurka-fanko-pop.webp",
    description: "Фігурка Луау Стітча з традиційним вінком у гавайському стилі. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 21,
    regionalPricing: {
      UA: { currency: "UAH", price: 849 },
      EU: { currency: "EUR", price: 20 },
      US: { currency: "USD", price: 21 }
    },
    tags: ["Disney", "Luau"],
    inStock: true
  },
  {
    id: "disney-summer-stitch-1414",
    title: "Summer Stitch",
    subtitle: "Hot Topic Blacklight | Funko POP! 1414",
    popNumber: "1414",
    franchise: "Disney",
    category: "disney",
    image: "/Summer_Stitch_1414_Blacklight_Funko_Pop_-_Lilo_Stitch_-_Hot_Topic_Exclusive.webp",
    description: "Фігурка Літнього Стітча в неоновому стилі Blacklight. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 28,
    regionalPricing: {
      UA: { currency: "UAH", price: 1199 },
      EU: { currency: "EUR", price: 27 },
      US: { currency: "USD", price: 28 }
    },
    tags: ["Disney", "Blacklight", "Exclusive"],
    inStock: true
  },
  {
    id: "disney-stitch-pongo",
    title: "Stitch as Pongo",
    subtitle: "Disney Cosplay | Funko POP! 1462",
    popNumber: "1462",
    franchise: "Disney",
    category: "disney",
    image: "/pop-figure-disney-stitch-as-pongo.jpg",
    description: "Колекційний Стітч у милому образі далматинця Понго з 101 Далматинця. Висота: 10 см.",
    basePriceUSD: 24,
    regionalPricing: {
      UA: { currency: "UAH", price: 950 },
      EU: { currency: "EUR", price: 23 },
      US: { currency: "USD", price: 24 }
    },
    tags: ["Disney", "Limited"],
    inStock: true
  },
  {
    id: "disney-ukulele-stitch-1044",
    title: "Stitch with Ukulele",
    subtitle: "Aloha Music | Funko POP! 1044",
    popNumber: "1044",
    franchise: "Disney",
    category: "disney",
    image: "/61J4X7JfPvL.jpg",
    description: "Фігурка Стітча, що грає на укулеле. Висота: 10 см. Матеріал: Вініл.",
    basePriceUSD: 25,
    regionalPricing: {
      UA: { currency: "UAH", price: 999 },
      EU: { currency: "EUR", price: 24 },
      US: { currency: "USD", price: 25 }
    },
    tags: ["Disney", "Music"],
    inStock: true
  }
];

export const INITIAL_USERS = [
  {
    id: "usr_superadmin",
    name: "Alexey Petrov",
    email: "admin@popshop.com",
    role: "SuperAdmin" as const,
    isActive: true,
    createdAt: "2026-01-15T09:30:00Z"
  },
  {
    id: "usr_manager",
    name: "Olena Ivanenko",
    email: "manager@popshop.com",
    role: "Manager" as const,
    isActive: true,
    createdAt: "2026-02-10T14:15:00Z"
  },
  {
    id: "usr_customer1",
    name: "Dmytro Shevchenko",
    email: "dmytro@gmail.com",
    role: "Customer" as const,
    isActive: true,
    createdAt: "2026-03-01T11:45:00Z"
  },
  {
    id: "usr_customer2",
    name: "Iryna Koval",
    email: "iryna.k@ukr.net",
    role: "Customer" as const,
    isActive: false,
    createdAt: "2026-03-05T16:20:00Z"
  }
];
