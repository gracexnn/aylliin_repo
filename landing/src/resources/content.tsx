import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";

const person: Person = {
  firstName: "Аялал",
  lastName: "Систем",
  name: "Аяллын Систем",
  role: "Аяллын Захиалгын Платформ",
  avatar: "/images/avatar.jpg",
  email: "naraenk27@gmail.com",
  phone: 88745504,
  location: "Asia/Ulaanbaatar",
  languages: ["Монгол", "English"],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Аялал мэдээллийн захиа авах</>,
  description: <></>,
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/gracexnn",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
  {
    name: "Phone",
    icon: "phone",
    link: `tel:${person.phone}`,
    essential: true,
  }
];

const home: Home = {
  path: "/",
  image: "/images/og.jpg",
  label: "Нүүр",
  title: "Аялал – Аяллын Захиалгын Платформ",
  description:
    "Онлайн аяллын захиалгын платформ.",
  headline: <>Аяллыг энгийн, хялбар, найдвартай болго</>,
  featured: {
    display: false,
    title: <>Аялал</>,
    href: "/",
  },
  subline: <>Аяллын захиалгын платформ — хэрэглэгч болон аяллын үйл ажиллагаанд зориулсан нэгдсэн шийдэл.</>,
};

const about: About = {
  path: "/about",
  label: "Тухай",
  title: "Тухай – Аялал Систем",
  description: "Аялал платформын тухай.",
  tableOfContent: { display: false, subItems: false },
  avatar: { display: false },
  calendar: { display: false, link: "" },
  intro: { display: false, title: "", description: <></> },
  work: { display: false, title: "", experiences: [] },
  studies: { display: false, title: "", institutions: [] },
  technical: { display: false, title: "", skills: [] },
};

const blog: Blog = {
  path: "/blog",
  label: "Блог",
  title: "Блог",
  description: "",
};

const work: Work = {
  path: "/work",
  label: "Ажлууд",
  title: "Ажлууд",
  description: "",
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Галлерей",
  title: "Галлерей",
  description: "Монголын үзэсгэлэнт газруудын фото цомог",
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "Монголын байгаль",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "Аяллын зураг",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "Монголын нутаг",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "Аяллын зураг",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "Аяллын зураг",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "Монголын байгаль",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "Монголын нутаг",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "Аяллын зураг",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
