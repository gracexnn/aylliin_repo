import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

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
  display: true,
  title: <>Аялал мэдээллийн захиа авах</>,
  description: (
    <>
      Шинэ аялалын багцууд, онцгой санал болон аяллын зөвлөмжийг хамгийн түрүүнд мэдрэхийн тулд
      бүртгүүлээрэй.
    </>
  ),
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/gracexnn/aylliin_repo",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/",
    essential: false,
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
    "Монголын хамгийн найдвартай онлайн аяллын захиалгын платформ. Аялал зохион байгуулагч, үйлчлүүлэгч, администратор нарт зориулсан бүрэн шийдэл.",
  headline: <>Аяллыг энгийн, хялбар, найдвартай болго</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Аялал</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Шинэ платформ
        </Text>
      </Row>
    ),
    href: "/work/aylal-client-portal",
  },
  subline: (
    <>
      Манай платформ нь аяллын агуулга удирдлага, захиалгын систем болон олон түрээслэгчийн{" "}
      <Text as="span" size="xl" weight="strong">
        нэгдсэн шийдэл
      </Text>{" "}
      юм.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "Тухай",
  title: "Тухай – Аялал Систем",
  description:
    "Аялал платформын тухай. Монголын аяллын салбарт дижитал шийдэл нэвтрүүлж буй манай баг.",
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Танилцуулга",
    description: (
      <>
        Аялал платформ нь Монголын аяллын салбарыг дижитал болгох зорилготой стартап юм. Бид
        аялал зохион байгуулагчид болон үйлчлүүлэгчдийг нэг нэгдсэн системд холбож, захиалга,
        төлбөр тооцоо, агуулга удирдлагыг автоматжуулдаг. Манай шийдэл нь үйлчлүүлэгчийн
        интерфэйс ба администратор хэрэгслийг нэгтгэн аяллын бүхий л процессыг хялбарчилдаг.
      </>
    ),
  },
  work: {
    display: true,
    title: "Платформын бүрдэл хэсгүүд",
    experiences: [
      {
        company: "Клиент Портал",
        timeframe: "2024 – Одоог хүртэл",
        role: "Үйлчлүүлэгчид зориулсан вэб апп",
        achievements: [
          <>
            Аяллын багцуудыг хайх, шүүх, харьцуулах боломж бүхий ухаалаг хайлтын систем
            хэрэгжүүлсэн – хэрэглэгчдийн хамрах хүрээ 45%-иар өссөн.
          </>,
          <>
            Онлайн захиалга, төлбөр тооцоо, баримт бичгийн менежментийг нэг дэлгэц дээр
            нэгтгэснээр гүйлгээний хурд 60%-иар хурдассан.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/cover-01.jpg",
            alt: "Клиент портал",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "Админ Хяналтын Самбар",
        timeframe: "2024 – Одоог хүртэл",
        role: "Администраторт зориулсан удирдлагын хэрэгсэл",
        achievements: [
          <>
            Аяллын агуулга (тайлбар, зураг, хөтөлбөр, үнэ) үүсгэх, засварлах, нийтлэх
            бүрэн CRUD интерфэйс боловсруулсан.
          </>,
          <>
            Бодит цагийн захиалгын мониторинг, үйлчлүүлэгчийн мэдэгдэл болон олон
            үйлчилгээ үзүүлэгчийг дэмжих олон түрээслэгчийн бүтэц нэвтрүүлсэн.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/cover-02.jpg",
            alt: "Админ хяналтын самбар",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
  studies: {
    display: true,
    title: "Технологийн стек",
    institutions: [
      {
        name: "Frontend: Next.js + TypeScript",
        description: (
          <>
            Клиент болон admin портал хоёулаа React 19 дээр суурилсан Next.js ашиглан
            бүтээгдсэн. Tailwind CSS болон Once UI компонент сангаар загварчилсан.
          </>
        ),
      },
      {
        name: "Backend & Database",
        description: (
          <>
            RESTful API болон бодит цагийн өгөгдлийн синхрончлол. Олон түрээслэгчийн
            архитектур нь тус тусын түрээслэгч бүрийн мэдээллийг бие биеэс тусгаарлан хадгалдаг.
          </>
        ),
      },
    ],
  },
  technical: {
    display: true,
    title: "Техникийн чадавх",
    skills: [
      {
        title: "Next.js & TypeScript",
        description: (
          <>
            Server-side rendering болон статик генерацийг ашиглан хурдан, SEO-д ээлтэй вэб
            апп боловсруулдаг. TypeScript ашиглан кодын найдвартай байдлыг хангадаг.
          </>
        ),
        tags: [
          { name: "TypeScript", icon: "typescript" },
          { name: "Next.js", icon: "nextjs" },
          { name: "JavaScript", icon: "javascript" },
        ],
        images: [
          {
            src: "/images/projects/project-01/cover-03.jpg",
            alt: "Next.js хөгжүүлэлт",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "UI/UX Design System",
        description: (
          <>
            Once UI компонент сан болон Figma дизайн системийг ашиглан тогтвортой,
            хэрэглэхэд хялбар интерфэйс бүтээдэг. Клиент болон admin хоёр портал нэгдсэн
            дизайн хэлийг баримталдаг.
          </>
        ),
        tags: [
          { name: "Figma", icon: "figma" },
          { name: "Tailwind CSS", icon: "tailwindcss" },
        ],
        images: [
          {
            src: "/images/projects/project-01/cover-04.jpg",
            alt: "UI дизайн систем",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Блог",
  title: "Аяллын зөвлөмж ба мэдээ...",
  description: "Аялал платформоос хамгийн сүүлийн мэдээ, зөвлөмж болон шинэчлэлүүдийг уншаарай.",
};

const work: Work = {
  path: "/work",
  label: "Ажлууд",
  title: "Платформын хөгжүүлэлт",
  description:
    "Аялал платформын клиент портал болон admin хяналтын самбарын хөгжүүлэлтийн ажлуудтай танилц.",
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Галлерей",
  title: "Аяллын зургийн галлерей",
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
