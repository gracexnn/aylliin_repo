import { Heading, Text, Button, RevealFx, Column, Row, Schema, Meta } from "@once-ui-system/core";
import { home, person, baseURL } from "@/resources";
import GalleryView from "@/components/gallery/GalleryView";
import { Projects } from "@/components/work/Projects";
import { FiBookOpen, FiMapPin, FiCreditCard, FiGrid, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { IoAirplaneOutline, IoBusOutline, IoBicycleOutline } from "react-icons/io5";

const platformFeatures = [
  {
    id: "content",
    icon: <FiBookOpen size={24} color="white" />,
    color: "#8B5CF6", // Purple 500
    tagColor: "rgba(139, 92, 246, 0.15)",
    tagText: "Контент",
    title: "Агуулгын уян хатан удирдлага",
    description: "Аяллын багц, хөтөлбөр, багцад багтсан зүйлсийг контент сангаас дахин ашиглах болон төвлөрсөн байдлаар удирдах боломжтой.",
    bullets: ["Контент санг төвлөрүүлэх", "Дахин ашиглах боломжтой", "Багцыг уян хатан тохируулах"],
    linkText: "Дэлгэрэнгүй",
  },
  {
    id: "map",
    icon: <FiMapPin size={24} color="white" />,
    color: "#0EA5E9", // Light Blue 500
    tagColor: "rgba(14, 165, 233, 0.15)",
    tagText: "Маршрут",
    title: "Нарийвчилсан маршрут",
    description: "Газрын зураг дээр цэгүүд тэмдэглэнэ. Төрөл бүрийн тээврийн хэрэгсэл болон очих цагийг нарийвчлан тодорхойлох боломжтой.",
    pills: [
      { icon: <IoAirplaneOutline size={16} />, label: "Онгоц" },
      { icon: <IoBusOutline size={16} />, label: "Автобус" },
      { icon: <IoBicycleOutline size={16} />, label: "..." },
    ],
    bullets: ["Интерактив газрын зураг", "Тээврийн төрөл", "Нарийвчилсан цагийн хуваарь"],
    linkText: "Дэлгэрэнгүй",
  },
  {
    id: "payment",
    icon: <FiCreditCard size={24} color="white" />,
    color: "#10B981", // Emerald 500
    tagColor: "rgba(16, 185, 129, 0.15)",
    tagText: "Төлбөр",
    title: "Захиалга ба төлбөр",
    description: "Явах өдрүүдийн хуваарь үүсгэж захиалгыг системээр хүлээн авна. QPay системээр хэрэглэгчид онлайн төлбөрөө шууд төлөх, урьдчилсан захиалга үүсгэх боломжтой.",
    bullets: ["QPay шууд холболт", "Захиалгын төлөв хянах", "Нэхэмжлэх автоматаар үүсэх"],
    linkText: "Дэлгэрэнгүй",
  },
  {
    id: "analytics",
    icon: <FiGrid size={24} color="white" />,
    color: "#F97316", // Orange 500
    tagColor: "rgba(249, 115, 22, 0.15)",
    tagText: "Аналитик",
    title: "Дашбоард ба Хяналт",
    description: "Сайтын хандалт болон амжилттай захиалгуудыг нэг дор хянаж, бизнесийн шийдвэр гаргалтыг мэдээлэлд тулгуурлаж гаргах боломжтой.",
    bullets: ["Хэрэглэгчийн урсгал", "Санхүүгийн тайлан"],
    linkText: "Дэлгэрэнгүй",
  }
];

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  const demoClientUrl =
    process.env.NEXT_PUBLIC_DEMO_CLIENT_URL ?? "https://client-demo.example.com";
  const demoAdminUrl =
    process.env.NEXT_PUBLIC_DEMO_ADMIN_URL ?? "https://admin-demo.example.com";

  return (
    <Column maxWidth="s" gap="xl" paddingY="12" horizontal="center" fillWidth>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: baseURL,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* Headline */}
      <Column fillWidth horizontal="center" align="center" gap="m" paddingTop="32">
        <RevealFx fillWidth horizontal="center">
          <Heading wrap="balance" variant="display-strong-l" align="center">
            {home.headline}
          </Heading>
        </RevealFx>
        <RevealFx delay={0.1} fillWidth horizontal="center">
          <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-l" align="center">
            {home.subline}
          </Text>
        </RevealFx>
      </Column>

      {/* CTA buttons */}
      <RevealFx delay={0.2} fillWidth>
        <Row fillWidth gap="12" s={{ direction: "column" }}>
          <Button
            href={demoClientUrl}
            variant="primary"
            size="l"
            weight="strong"
            arrowIcon
            fillWidth
          >
            Хэрэглэгчийн хэсэг
          </Button>
          <Button
            href={demoAdminUrl}
            variant="secondary"
            size="l"
            weight="default"
            arrowIcon
            fillWidth
          >
            Админ хэсэг үзэх
          </Button>
        </Row>
      </RevealFx>

      <RevealFx translateY="16" delay={0.6}>
        <Projects range={[1, 1]} />
      </RevealFx>
      {/* System explanation */}
      <RevealFx delay={0.3} fillWidth>
        <Column fillWidth gap="20" padding="24" border="neutral-alpha-medium" radius="xl" background="surface">
          <Heading as="h2" variant="display-strong-xs" wrap="balance">
            Систем хэрхэн ажилладаг вэ?
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
            Аялал платформ нь <strong>Клиент</strong> болон <strong>Админ</strong> гэсэн хоёр хэсгээс
            бүрддэг. Админ хэсгээс аяллын багц үүсгэж, засварлаж, нийтлэхэд клиент хэсэг
            автоматаар шинэчлэгдэж хэрэглэгчдэд шууд харагдана.
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
            <strong>Клиент хэсэг</strong> — аяллын багц хайх, харьцуулах, захиалга өгөх,
            онлайн төлбөр хийх боломжтой хэрэглэгчийн интерфэйс.
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
            <strong>Админ хэсэг</strong> — агуулга удирдлага, захиалгын мониторинг, хэрэглэгч
            болон үйлчилгээ үзүүлэгчийн бүрэн хяналтын самбар.
          </Text>
        </Column>
      </RevealFx>

      {/* Feature highlights */}
      <RevealFx delay={0.4} fillWidth>
        <Column fillWidth gap="m" paddingTop="40" paddingBottom="24">
          <Row fillWidth gap="12" s={{ direction: "column" }}>
            {platformFeatures.slice(0, 2).map((feature) => (
              <Column
                key={feature.id}
                flex={1}
                padding="32"
                gap="24"
                border="neutral-alpha-medium"
                radius="xl"
                background="surface"
                position="relative"
              >
                <Row fillWidth horizontal="between" align="center" vertical="center" marginBottom="8">
                  <Row
                    align="center"
                    vertical="center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: feature.color,
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    {feature.icon}
                  </Row>
                  <Row
                    paddingX="16"
                    paddingY="8"
                    radius="full"
                    style={{ backgroundColor: feature.tagColor }}
                  >
                    <Text variant="body-default-s" weight="strong" style={{ color: feature.color }}>
                      {feature.tagText}
                    </Text>
                  </Row>
                </Row>
                <Column gap="12">
                  <Heading as="h3" variant="heading-strong-xl" wrap="balance" onBackground="brand-strong">
                    {feature.title}
                  </Heading>
                  <Text variant="body-default-m" onBackground="neutral-weak" wrap="pretty" style={{ minHeight: "3em" }}>
                    {feature.description}
                  </Text>
                </Column>

                {feature.pills && (
                  <Row fillWidth gap="12" wrap marginY="8">
                    {feature.pills.map((pill, idx) => (
                      <Row
                        key={idx}
                        gap="8"
                        paddingX="16"
                        paddingY="8"
                        radius="full"
                        align="center"
                        vertical="center"
                        style={{ backgroundColor: "rgba(25, 168, 230, 0.1)" }}
                      >
                        <Text style={{ color: feature.color, display: "flex", alignItems: "center" }}>{pill.icon}</Text>
                        <Text variant="body-strong-xs" style={{ color: feature.color }}>
                          {pill.label}
                        </Text>
                      </Row>
                    ))}
                  </Row>
                )}

                <div style={{ height: 1, width: "100%", backgroundColor: "var(--neutral-alpha-weak)", margin: "8px 0" }} />

                <Column gap="12">
                  {feature.bullets.map((bullet, idx) => (
                    <Row key={idx} gap="12" align="center" vertical="center">
                      <FiCheckCircle size={20} color={feature.color} style={{ minWidth: 20 }} />
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {bullet}
                      </Text>
                    </Row>
                  ))}
                </Column>
                
                {/* <Row marginTop="16" gap="8" align="center" vertical="center">
                  <Text variant="body-default-m" weight="strong" style={{ color: feature.color }}>
                    {feature.linkText}
                  </Text>
                  <FiArrowRight size={16} color={feature.color} />
                </Row> */}
              </Column>
            ))}
          </Row>
          
          <Row fillWidth gap="12" s={{ direction: "column" }}>
            {platformFeatures.slice(2, 4).map((feature) => (
              <Column
                key={feature.id}
                flex={1}
                padding="32"
                gap="24"
                border="neutral-alpha-medium"
                radius="xl"
                background="surface"
                position="relative"
              >
                <Row fillWidth horizontal="between" align="center" vertical="center" marginBottom="8">
                  <Row
                    align="center"
                    vertical="center"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: feature.color,
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    {feature.icon}
                  </Row>
                  <Row
                    paddingX="16"
                    paddingY="8"
                    radius="full"
                    style={{ backgroundColor: feature.tagColor }}
                  >
                    <Text variant="body-default-s" weight="strong" style={{ color: feature.color }}>
                      {feature.tagText}
                    </Text>
                  </Row>
                </Row>
                
                <Column gap="12">
                  <Heading as="h3" variant="heading-strong-xl" wrap="balance" onBackground="brand-strong">
                    {feature.title}
                  </Heading>
                  <Text variant="body-default-m" onBackground="neutral-weak" wrap="pretty" style={{ minHeight: "3em" }}>
                    {feature.description}
                  </Text>
                </Column>

                {feature.pills && (
                  <Row fillWidth gap="12" wrap marginY="8">
                    {feature.pills.map((pill, idx) => (
                      <Row
                        key={idx}
                        gap="8"
                        paddingX="16"
                        paddingY="8"
                        radius="full"
                        align="center"
                        vertical="center"
                        style={{  }}
                      >
                        <Text style={{ color: feature.color, display: "flex", alignItems: "center" }}>{pill.icon}</Text>
                        <Text variant="body-default-xs" weight="strong" style={{ color: feature.color }}>
                          {pill.label}
                        </Text>
                      </Row>
                    ))}
                  </Row>
                )}

                <div style={{ height: 1, width: "100%", backgroundColor: "var(--neutral-alpha-weak)", margin: "8px 0" }} />

                <Column gap="12">
                  {feature.bullets.map((bullet, idx) => (
                    <Row key={idx} gap="12" align="center" vertical="center">
                      <FiCheckCircle size={20} color={feature.color} style={{ minWidth: 20 }} />
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {bullet}
                      </Text>
                    </Row>
                  ))}
                </Column>
                
                {/* <Row marginTop="16" gap="8" align="center" vertical="center">
                  <Text variant="body-default-m" weight="strong" style={{ color: feature.color }}>
                    {feature.linkText}
                  </Text>
                  <FiArrowRight size={16} color={feature.color} />
                </Row> */}
              </Column>
            ))}
          </Row>
        </Column>
      </RevealFx>
    </Column>
  );
}
