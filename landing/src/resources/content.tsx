import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";

const person: Person = {
  firstName: "Аялал",
  lastName: "Систем",
  name: "Аялал Систем",
  role: "Аяллын Захиалгын Платформ",
  avatar: "/images/avatar.jpg",
  email: "info@aylliin.mn",
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
    link: "https://github.com/gracexnn/aylliin_repo",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Нүүр",
  title: "Аялал – Аяллын Захиалгын Платформ",
  description:
    "Монголын онлайн аяллын захиалгын платформ. Клиент болон админ хэсэгтэй бүрэн шийдэл.",
  headline: <>Аяллыг энгийн, хялбар, найдвартай болго</>,
  featured: {
    display: false,
    title: <>Аялал</>,
    href: "/",
  },
  subline: <>Аяллын захиалгын платформ — клиент болон администраторт зориулсан нэгдсэн шийдэл.</>,
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
  description: "",
  images: [],
};

export { person, social, newsletter, home, about, blog, work, gallery };
